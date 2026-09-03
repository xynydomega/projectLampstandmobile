import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ── Queries ────────────────────────────────────────────────────────────────

/**
 * Returns everything the Home screen needs in one call.
 * Called every time the user opens the app or returns to Home.
 */
export const getHomeState = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { state: "unauthenticated" as const };

    // Find the user's most recent active or completed path
    const userPath = await ctx.db
      .query("userPaths")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .first();

    if (!userPath) {
      return { state: "no_path" as const };
    }

    const path = await ctx.db.get(userPath.pathId);
    if (!path) return { state: "no_path" as const };

    if (userPath.status === "complete") {
      return {
        state: "complete" as const,
        pathId: userPath.pathId,
        pathTitle: path.title,
        userPathId: userPath._id,
      };
    }

    // Active path — find today's session
    const todaySession = await ctx.db
      .query("sessions")
      .withIndex("by_pathId_dayNumber", (q) =>
        q.eq("pathId", userPath.pathId).eq("dayNumber", userPath.currentDay)
      )
      .first();

    const todayDone = userPath.completedDays.includes(userPath.currentDay);

    return {
      state: "active" as const,
      pathId: userPath.pathId,
      pathTitle: path.title,
      currentDay: userPath.currentDay,
      totalDays: path.totalDays,
      todayDone,
      sessionId: todayDone ? undefined : todaySession?._id,
      userPathId: userPath._id,
      completedDays: userPath.completedDays,
    };
  },
});

/**
 * Returns the single live path. Used by the journey detail page
 * so the client doesn't need a Convex ID in the URL.
 */
export const getLivePath = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("paths")
      .withIndex("by_isLive", (q) => q.eq("isLive", true))
      .first();
  },
});


export const getPathOverviewFromSession = query({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);

    if (!session) {
      throw new Error("SESSION_NOT_FOUND");
    }

    const path = await ctx.db.get(session.pathId);

    if (!path) {
      throw new Error("PATH_NOT_FOUND");
    }

    return {
      pathId: path._id,
    };
  },
});

/**
 * Returns path metadata + all 7 session titles with the user's lock status.
 * Used on the Path Overview screen before starting or to review progress.
 */
export const getPathOverview = query({
  args: { pathId: v.id("paths") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    const path = await ctx.db.get(args.pathId);
    if (!path) throw new Error("PATH_NOT_FOUND");

    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_pathId", (q) => q.eq("pathId", args.pathId))
      .order("asc")
      .collect();

    // Sort by dayNumber to guarantee order
    const sortedSessions = sessions.sort((a, b) => a.dayNumber - b.dayNumber);

    let completedDays: number[] = [];
    let currentDay = 1;
    let userPathId: string | undefined;
    let startedAt: number | null = null;

    if (userId) {
      const userPath = await ctx.db
        .query("userPaths")
        .withIndex("by_userId_pathId", (q) =>
          q.eq("userId", userId).eq("pathId", args.pathId)
        )
        .first();

      if (userPath) {
        completedDays = userPath.completedDays;
        currentDay = userPath.currentDay;
        userPathId = userPath._id;
        startedAt = userPath.startedAt;
      }
    }

    return {
      pathId: path._id,
      title: path.title,
      description: path.description,
      isLive: path.isLive,
      totalDays: path.totalDays,
      category: path.category,
      userPathId,
      startedAt,
      sessions: sortedSessions.map((s) => {
        const calculatedCurrentDay = startedAt ? Math.floor((Date.now() - startedAt) / 86400000) + 1 : 1;
        const timeUnlocked = s.dayNumber <= calculatedCurrentDay;
        return {
          sessionId: s._id,
          dayNumber: s.dayNumber,
          title: s.title,
          status: completedDays.includes(s.dayNumber)
            ? ("completed" as const)
            : (s.dayNumber === currentDay && timeUnlocked)
              ? ("available" as const)
              : ("locked" as const),
        };
      }),
    };
  },
});

/**
 * Returns session content if the user is allowed to see it.
 * Enforces the lock rule server-side.
 */
export const getSessionContent = query({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null; // session expired — page renders "Session not found" gracefully

    const session = await ctx.db.get(args.sessionId);
    if (!session) throw new Error("SESSION_NOT_FOUND");

    const userPath = await ctx.db
      .query("userPaths")
      .withIndex("by_userId_pathId", (q) =>
        q.eq("userId", userId).eq("pathId", session.pathId)
      )
      .first();

    if (!userPath) throw new Error("NO_ACTIVE_PATH");

    const isCompleted = userPath.completedDays.includes(session.dayNumber);
    
    // Check if the real-world time has elapsed enough to unlock this day
    const calculatedCurrentDay = Math.floor((Date.now() - userPath.startedAt) / 86400000) + 1;
    const timeUnlocked = session.dayNumber <= calculatedCurrentDay;

    const isAvailable = session.dayNumber === userPath.currentDay && timeUnlocked && !isCompleted;

    if (!isCompleted && !isAvailable) {
      throw new Error("SESSION_LOCKED");
    }

    return {
      ...session,
      sessionStatus: isCompleted ? ("completed" as const) : ("available" as const),
    };
  },
});

/**
 * Returns a user's current progress on a specific path.
 */
export const getUserPathProgress = query({
  args: { pathId: v.id("paths") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    return await ctx.db
      .query("userPaths")
      .withIndex("by_userId_pathId", (q) =>
        q.eq("userId", userId).eq("pathId", args.pathId)
      )
      .first();
  },
});

// ── Mutations ──────────────────────────────────────────────────────────────

/**
 * Creates a new active journey for the user on a given path.
 * Enforces: path must be live, user can only have one active path at a time.
 */
export const startPath = mutation({
  args: { pathId: v.id("paths") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const path = await ctx.db.get(args.pathId);
    if (!path) throw new Error("PATH_NOT_FOUND");
    if (!path.isLive) throw new Error("PATH_NOT_LIVE");

    // Check if the user already has a record for this specific path
    const existingForThisPath = await ctx.db
      .query("userPaths")
      .withIndex("by_userId_pathId", (q) =>
        q.eq("userId", userId).eq("pathId", args.pathId)
      )
      .first();

    if (existingForThisPath) {
      // Return the existing record rather than creating a duplicate
      return {
        userPathId: existingForThisPath._id,
        currentDay: existingForThisPath.currentDay,
        isNew: false,
      };
    }

    // Check for any other active path (only one active path at a time)
    const activeUserPath = await ctx.db
      .query("userPaths")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();

    if (activeUserPath) {
      throw new Error("PATH_ALREADY_ACTIVE");
    }

    const userPathId = await ctx.db.insert("userPaths", {
      userId,
      pathId: args.pathId,
      currentDay: 1,
      completedDays: [],
      status: "active",
      startedAt: Date.now(),
    });

    return { userPathId, currentDay: 1, isNew: true };
  },
});

/**
 * Marks the current session as done, unlocks the next day,
 * and marks the path complete if this was Day 7.
 * Fully idempotent — duplicate taps are ignored.
 */
export const completeSession = mutation({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const session = await ctx.db.get(args.sessionId);
    if (!session) throw new Error("SESSION_NOT_FOUND");

    const userPath = await ctx.db
      .query("userPaths")
      .withIndex("by_userId_pathId", (q) =>
        q.eq("userId", userId).eq("pathId", session.pathId)
      )
      .first();

    // Idempotency: check BEFORE the status guard so that a second call
    // after Day 7 (when status is already "complete") returns silently
    // rather than throwing NO_ACTIVE_PATH.
    const existingCompletion = await ctx.db
      .query("userSessionCompletions")
      .withIndex("by_userId_sessionId", (q) =>
        q.eq("userId", userId).eq("sessionId", args.sessionId)
      )
      .first();

    if (existingCompletion && userPath) {
      return {
        nextDay: userPath.currentDay,
        pathComplete: userPath.status === "complete",
        completedDays: userPath.completedDays,
        isNew: false,
      };
    }

    // Now enforce that the path is active before any write
    if (!userPath || userPath.status !== "active") {
      throw new Error("NO_ACTIVE_PATH");
    }

    // Enforce sequential unlock — must be the current day
    if (session.dayNumber !== userPath.currentDay) {
      throw new Error("SESSION_LOCKED");
    }

    // Write the immutable completion event
    await ctx.db.insert("userSessionCompletions", {
      userId,
      pathId: session.pathId,
      sessionId: args.sessionId,
      dayNumber: session.dayNumber,
      completedAt: Date.now(),
    });

    const updatedCompletedDays = [...userPath.completedDays, session.dayNumber];
    const path = await ctx.db.get(session.pathId);
    const totalDays = path?.totalDays ?? 7;
    const pathComplete = updatedCompletedDays.length === totalDays;
    const nextDay = session.dayNumber + 1;

    await ctx.db.patch(userPath._id, {
      completedDays: updatedCompletedDays,
      currentDay: nextDay,
      status: pathComplete ? "complete" : "active",
      ...(pathComplete ? { completedAt: Date.now() } : {}),
    });

    return {
      nextDay,
      pathComplete,
      completedDays: updatedCompletedDays,
      isNew: true,
    };
  },
});
