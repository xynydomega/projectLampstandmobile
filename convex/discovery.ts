import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Category display order as per spec
const CATEGORY_ORDER = [
  "Fear & Anxiety",
  "Loss & Grief",
  "Identity & Worth",
  "Faith & Doubt",
  "Pressure & Endurance",
  "Relationships & Community",
];

// ── Queries ────────────────────────────────────────────────────────────────

/**
 * Returns all 31 paths with interest counts and whether this user has tapped each.
 * Live path is always first; Coming Soon ordered by category.
 */
export const getPathsDiscoveryScreen = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);

    const allPaths = await ctx.db.query("paths").collect();

    // Load all counts in one pass
    const allCounts = await ctx.db.query("pathInterestCounts").collect();
    const countMap = new Map(allCounts.map((c) => [c.pathId, c.totalTaps]));

    // Load this user's tapped paths (if authenticated)
    const tappedPathIds = new Set<string>();
    if (userId) {
      const taps = await ctx.db
        .query("pathInterestTaps")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .collect();
      taps.forEach((t) => tappedPathIds.add(t.pathId));
    }

    const livePaths = allPaths.filter((p) => p.isLive);
    const comingSoonPaths = allPaths.filter((p) => !p.isLive);

    // Sort coming soon by category order, then alphabetically within category
    comingSoonPaths.sort((a, b) => {
      const aIdx = CATEGORY_ORDER.indexOf(a.category);
      const bIdx = CATEGORY_ORDER.indexOf(b.category);
      if (aIdx !== bIdx) return aIdx - bIdx;
      return a.title.localeCompare(b.title);
    });

    const format = (p: typeof allPaths[number]) => ({
      pathId: p._id,
      title: p.title,
      description: p.description,
      category: p.category,
      isLive: p.isLive,
      totalTaps: countMap.get(p._id) ?? 0,
      userHasTapped: tappedPathIds.has(p._id),
    });

    return [...livePaths.map(format), ...comingSoonPaths.map(format)];
  },
});

/**
 * Returns the interest count for a single path.
 * Used to update a single card counter without reloading the whole screen.
 */
export const getPathInterestCount = query({
  args: { pathId: v.id("paths") },
  handler: async (ctx, args) => {
    const record = await ctx.db
      .query("pathInterestCounts")
      .withIndex("by_pathId", (q) => q.eq("pathId", args.pathId))
      .first();
    return record?.totalTaps ?? 0;
  },
});

/**
 * Returns all paths the current user has tapped.
 */
export const getUserTappedPaths = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("pathInterestTaps")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
  },
});

// ── Mutations ──────────────────────────────────────────────────────────────

/**
 * Records that a user tapped a Coming Soon path card.
 * Deduplicates silently. Increments counter atomically in same mutation.
 */
export const recordTap = mutation({
  args: { pathId: v.id("paths") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const path = await ctx.db.get(args.pathId);
    if (!path) throw new Error("PATH_NOT_FOUND");
    if (path.isLive) throw new Error("PATH_IS_LIVE");

    // Idempotency — return existing tap without incrementing counter
    const existing = await ctx.db
      .query("pathInterestTaps")
      .withIndex("by_userId_pathId", (q) =>
        q.eq("userId", userId).eq("pathId", args.pathId)
      )
      .first();

    const countRecord = await ctx.db
      .query("pathInterestCounts")
      .withIndex("by_pathId", (q) => q.eq("pathId", args.pathId))
      .first();

    if (existing) {
      return {
        tapId: existing._id,
        isNew: false,
        totalTaps: countRecord?.totalTaps ?? 0,
      };
    }

    // Snapshot spiritual season at tap time
    const user = await ctx.db.get(userId);

    const tapId = await ctx.db.insert("pathInterestTaps", {
      userId,
      pathId: args.pathId,
      spiritualSeason: user?.spiritualSeason,
      emailOptIn: false,
      tappedAt: Date.now(),
    });

    // Atomically increment the counter in the same mutation
    const newTotal = (countRecord?.totalTaps ?? 0) + 1;
    if (countRecord) {
      await ctx.db.patch(countRecord._id, { totalTaps: newTotal });
    } else {
      await ctx.db.insert("pathInterestCounts", {
        pathId: args.pathId,
        totalTaps: 1,
      });
    }

    return { tapId, isNew: true, totalTaps: newTotal };
  },
});

/**
 * Stores the user's email opt-in for a Coming Soon path notification.
 * Must be called after recordTap — requires an existing tap record.
 */
export const submitNotificationEmail = mutation({
  args: {
    pathId: v.id("paths"),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Basic email format validation
    if (!args.email.includes("@") || !args.email.includes(".")) {
      throw new Error("INVALID_EMAIL");
    }

    const tap = await ctx.db
      .query("pathInterestTaps")
      .withIndex("by_userId_pathId", (q) =>
        q.eq("userId", userId).eq("pathId", args.pathId)
      )
      .first();

    if (!tap) throw new Error("TAP_NOT_FOUND");

    await ctx.db.patch(tap._id, {
      emailOptIn: true,
      notificationEmail: args.email.toLowerCase().trim(),
    });

    return { tapId: tap._id, emailOptIn: true };
  },
});
