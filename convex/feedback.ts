import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation } from "./_generated/server";
import { v } from "convex/values";

const PULSE_Q1_VALUES = ["didnt_connect", "it_was_helpful", "landed_deeply"] as const;
const DEBRIEF_Q1_VALUES = ["more_grounded", "clearer_understanding", "not_sure", "didnt_feel_much"] as const;
const DEBRIEF_Q2_VALUES = ["much_deeper", "similar_to_others", "not_what_expected", "first_time_engaging"] as const;
const DEBRIEF_Q3_VALUES = ["start_another", "need_a_break", "not_sure"] as const;

/**
 * Records a formation signal after a session is completed.
 * Written once per user per session — subsequent calls return the existing record.
 */
export const submitSessionPulse = mutation({
  args: {
    sessionId: v.id("sessions"),
    q1Response: v.string(),
    q2Text: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    if (!PULSE_Q1_VALUES.includes(args.q1Response as typeof PULSE_Q1_VALUES[number])) {
      throw new Error("INVALID_Q1_RESPONSE");
    }

    // Verify the session was actually completed by this user
    const completion = await ctx.db
      .query("userSessionCompletions")
      .withIndex("by_userId_sessionId", (q) =>
        q.eq("userId", userId).eq("sessionId", args.sessionId)
      )
      .first();

    if (!completion) throw new Error("SESSION_NOT_COMPLETED");

    // Idempotency — return existing record without writing again
    const existing = await ctx.db
      .query("sessionPulses")
      .withIndex("by_userId_sessionId", (q) =>
        q.eq("userId", userId).eq("sessionId", args.sessionId)
      )
      .first();

    if (existing) {
      return { pulseId: existing._id, isNew: false };
    }

    // Snapshot spiritual season from user profile at write time
    const user = await ctx.db.get(userId);
    const spiritualSeason = user?.spiritualSeason;

    const pulseId = await ctx.db.insert("sessionPulses", {
      userId,
      pathId: completion.pathId,
      sessionId: args.sessionId,
      dayNumber: completion.dayNumber,
      q1Response: args.q1Response,
      q2Text: args.q2Text,
      spiritualSeason,
      submittedAt: Date.now(),
    });

    return { pulseId, isNew: true };
  },
});

/**
 * Records the user's full formation reflection after completing all 7 days.
 * Written once per user per path — subsequent calls return the existing record.
 */
export const submitPathDebrief = mutation({
  args: {
    pathId: v.id("paths"),
    q1Response: v.string(),
    q2Response: v.string(),
    q3Response: v.string(),
    q4Text: v.optional(v.string()),
    wasSkipped: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    if (!DEBRIEF_Q1_VALUES.includes(args.q1Response as typeof DEBRIEF_Q1_VALUES[number])) {
      throw new Error("INVALID_Q1_RESPONSE");
    }
    if (!DEBRIEF_Q2_VALUES.includes(args.q2Response as typeof DEBRIEF_Q2_VALUES[number])) {
      throw new Error("INVALID_Q2_RESPONSE");
    }
    if (!DEBRIEF_Q3_VALUES.includes(args.q3Response as typeof DEBRIEF_Q3_VALUES[number])) {
      throw new Error("INVALID_Q3_RESPONSE");
    }

    // Verify the path is actually complete
    const userPath = await ctx.db
      .query("userPaths")
      .withIndex("by_userId_pathId", (q) =>
        q.eq("userId", userId).eq("pathId", args.pathId)
      )
      .first();

    if (!userPath || userPath.status !== "complete") {
      throw new Error("PATH_NOT_COMPLETE");
    }

    // Idempotency
    const existing = await ctx.db
      .query("pathDebriefs")
      .withIndex("by_userId_pathId", (q) =>
        q.eq("userId", userId).eq("pathId", args.pathId)
      )
      .first();

    if (existing) {
      return { debriefId: existing._id, isNew: false };
    }

    const user = await ctx.db.get(userId);
    const spiritualSeason = user?.spiritualSeason;

    const debriefId = await ctx.db.insert("pathDebriefs", {
      userId,
      pathId: args.pathId,
      q1Response: args.q1Response,
      q2Response: args.q2Response,
      q3Response: args.q3Response,
      q4Text: args.q4Text,
      wasSkipped: args.wasSkipped,
      spiritualSeason,
      submittedAt: Date.now(),
    });

    return { debriefId, isNew: true };
  },
});
