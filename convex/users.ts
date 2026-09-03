import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

const VALID_SPIRITUAL_SEASONS = [
  "uncertain_future",
  "pressure_stress",
  "struggling_to_trust",
  "waiting",
  "distant_from_god",
  "none",
] as const;

/**
 * Returns the current authenticated user's full profile.
 * Used by the onboarding page to check hasCompletedOnboarding
 * and by the dashboard header to show "Hi, {firstName}".
 */
export const me = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return await ctx.db.get(userId);
  },
});

/**
 * Saves first name, last name, and optional phone number.
 * Called from /onboarding step 1 (profile form).
 * Does NOT set hasCompletedOnboarding — that happens in completeOnboarding.
 */
export const updateProfile = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    phoneNumber: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    await ctx.db.patch(userId, {
      firstName: args.firstName,
      lastName: args.lastName,
      phoneNumber: args.phoneNumber,
    });
  },
});

/**
 * Records the user's spiritual season and marks onboarding complete.
 * Called from /onboarding step 2 (spiritual season selector).
 *
 * Idempotent: if onboarding is already complete, returns success without
 * overwriting the existing spiritualSeason value.
 */
export const completeOnboarding = mutation({
  args: {
    spiritualSeason: v.string(),
    studyTimePreference: v.optional(v.string()),
    contactPreference: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    timezone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    if (!VALID_SPIRITUAL_SEASONS.includes(args.spiritualSeason as typeof VALID_SPIRITUAL_SEASONS[number])) {
      throw new Error("INVALID_SEASON_VALUE");
    }

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    // Idempotency: never overwrite an already-completed onboarding
    if (user.hasCompletedOnboarding === true) {
      return {
        success: true,
        spiritualSeason: user.spiritualSeason,
        studyTimePreference: user.studyTimePreference,
        contactPreference: user.contactPreference,
      };
    }

    await ctx.db.patch(userId, {
      spiritualSeason: args.spiritualSeason,
      studyTimePreference: args.studyTimePreference ?? "morning",
      contactPreference: args.contactPreference ?? "email",
      phoneNumber: args.phoneNumber,
      timezone: args.timezone ?? "UTC",
      hasCompletedOnboarding: true,
    });

    // Schedule welcome email to run immediately in the background
    await ctx.scheduler.runAfter(0, internal.reminders.sendWelcomeEmail, {
      userId,
    });

    return {
      success: true,
      spiritualSeason: args.spiritualSeason,
      studyTimePreference: args.studyTimePreference ?? "morning",
      contactPreference: args.contactPreference ?? "email",
    };
  },
});

/**
 * Updates user's reminder preferences from the profile page.
 */
export const updateNotificationPreferences = mutation({
  args: {
    studyTimePreference: v.string(),
    contactPreference: v.string(),
    phoneNumber: v.optional(v.string()),
    timezone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    await ctx.db.patch(userId, {
      studyTimePreference: args.studyTimePreference,
      contactPreference: args.contactPreference,
      phoneNumber: args.phoneNumber,
      timezone: args.timezone,
    });
  },
});

/**
 * Deletes duplicate entries in the authVerificationCodes table for the active dev bypass code.
 * Prevents Convex Auth unique() query check from crashing during dev login.
 */
export const cleanupDevBypassCodes = mutation({
  args: {},
  handler: async (ctx) => {
    const bypassCode = process.env.AUTH_DEV_BYPASS_CODE;
    if (!bypassCode) return;

    // Hash the bypass code using SHA-256 to match the database representation
    const encoder = new TextEncoder();
    const data = encoder.encode(bypassCode);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashedCode = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

    const duplicates = await ctx.db
      .query("authVerificationCodes")
      .withIndex("code", (q) => q.eq("code", hashedCode))
      .collect();

    for (const doc of duplicates) {
      await ctx.db.delete(doc._id);
    }
  },
});

/**
 * One-off migration mutation to force all users to sign in again
 * and re-complete onboarding preferences.
 */
export const resetAllUsersOnboardingAndSessions = mutation({
  args: {},
  handler: async (ctx) => {
    // 1. Reset onboarding flag for all users
    const users = await ctx.db.query("users").collect();
    let userCount = 0;
    for (const user of users) {
      if (user.isAnonymous) continue;
      await ctx.db.patch(user._id, {
        hasCompletedOnboarding: false,
      });
      userCount++;
    }

    // 2. Invalidate all active user sessions
    const sessions = await ctx.db.query("authSessions").collect();
    let sessionCount = 0;
    for (const session of sessions) {
      await ctx.db.delete(session._id);
      sessionCount++;
    }

    // 3. Clear all refresh tokens
    const refreshTokens = await ctx.db.query("authRefreshTokens").collect();
    let tokenCount = 0;
    for (const token of refreshTokens) {
      await ctx.db.delete(token._id);
      tokenCount++;
    }

    console.log(`[Migration] Reset onboarding for ${userCount} users. Invalidated ${sessionCount} sessions and ${tokenCount} refresh tokens.`);
    return {
      usersReset: userCount,
      sessionsInvalidated: sessionCount,
      tokensCleared: tokenCount,
    };
  },
});

