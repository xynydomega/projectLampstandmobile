import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, MutationCtx, query, QueryCtx } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";

type AdminCtx = QueryCtx | MutationCtx;

const DAY_MS = 24 * 60 * 60 * 1000;
const SPIRITUAL_SEASONS = [
  "uncertain_future",
  "pressure_stress",
  "struggling_to_trust",
  "waiting",
  "distant_from_god",
  "none",
] as const;

async function requireAdmin(ctx: AdminCtx) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Not authenticated");

  const user = await ctx.db.get(userId);
  if (!user || user.role !== "admin") {
    throw new Error("Forbidden: admin access required");
  }

  return userId;
}

export const bootstrapFirstAdmin = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existingAdmin = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "admin"))
      .first();

    if (existingAdmin) {
      throw new Error("An admin already exists");
    }

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    await ctx.db.patch(userId, { role: "admin" });
    return { success: true, userId };
  },
});

export const getOverviewMetrics = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const users = await ctx.db.query("users").collect();
    const userIds = new Set(
      users.filter((user) => user.isAnonymous !== true).map((user) => user._id),
    );
    const registeredUsers = users.filter((user) => user.isAnonymous !== true);
    const userPaths = await ctx.db.query("userPaths").collect();
    const completions = await ctx.db.query("userSessionCompletions").collect();
    const donations = await ctx.db.query("donations").collect();
    const waitlist = await ctx.db.query("waitlist").collect();

    let activeJourneys = 0;
    let completedJourneys = 0;
    for (const userPath of userPaths) {
      if (!userIds.has(userPath.userId)) continue;
      if (userPath.status === "active") activeJourneys++;
      if (userPath.status === "complete") completedJourneys++;
    }

    const donationByStatus = {
      initialized: 0,
      pending_verification: 0,
      completed: 0,
      failed: 0,
      abandoned: 0,
    };
    let totalUSDMinor = 0;
    let totalNGNMinor = 0;

    for (const donation of donations) {
      if (donation.status in donationByStatus) {
        donationByStatus[donation.status as keyof typeof donationByStatus]++;
      }
      if (donation.status !== "completed") continue;
      if (donation.currency === "USD") totalUSDMinor += donation.amountMinor;
      if (donation.currency === "NGN") totalNGNMinor += donation.amountMinor;
    }

    const completedOnboarding = registeredUsers.filter(
      (user) => user.hasCompletedOnboarding === true,
    ).length;

    return {
      totalUsers: registeredUsers.length,
      completedOnboarding,
      onboardingCompletionRate: registeredUsers.length
        ? Math.round((completedOnboarding / registeredUsers.length) * 100)
        : 0,
      activeJourneys,
      completedJourneys,
      totalSessionCompletions: completions.length,
      waitlistCount: waitlist.length,
      donations: {
        count: donations.length,
        totalUSDMinor,
        totalNGNMinor,
        byStatus: donationByStatus,
      },
    };
  },
});

export const getPathStats = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const paths = await ctx.db.query("paths").collect();
    const userPaths = await ctx.db.query("userPaths").collect();
    const interestCounts = await ctx.db.query("pathInterestCounts").collect();

    const statsByPath = new Map<
      string,
      { enrolledCount: number; activeCount: number; completedCount: number }
    >();
    for (const userPath of userPaths) {
      const stats = statsByPath.get(userPath.pathId) ?? {
        enrolledCount: 0,
        activeCount: 0,
        completedCount: 0,
      };
      stats.enrolledCount++;
      if (userPath.status === "active") stats.activeCount++;
      if (userPath.status === "complete") stats.completedCount++;
      statsByPath.set(userPath.pathId, stats);
    }

    const interestCountByPath = new Map(
      interestCounts.map((count) => [count.pathId, count.totalTaps]),
    );

    return paths.map((path) => {
      const stats = statsByPath.get(path._id) ?? {
        enrolledCount: 0,
        activeCount: 0,
        completedCount: 0,
      };

      return {
        pathId: path._id,
        title: path.title,
        category: path.category,
        isLive: path.isLive,
        totalDays: path.totalDays,
        ...stats,
        completionRate: stats.enrolledCount
          ? Math.round((stats.completedCount / stats.enrolledCount) * 100)
          : 0,
        interestTapCount: interestCountByPath.get(path._id) ?? 0,
      };
    });
  },
});

export const getSessionCompletionsTrend = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const now = new Date();
    const start = Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() - 29,
    );
    const completions = await ctx.db
      .query("userSessionCompletions")
      .withIndex("by_completedAt", (q) => q.gte("completedAt", start))
      .collect();
    const counts = new Map<string, number>();

    for (const completion of completions) {
      if (completion.completedAt < start) continue;
      const date = new Date(completion.completedAt).toISOString().slice(0, 10);
      counts.set(date, (counts.get(date) ?? 0) + 1);
    }

    return Array.from({ length: 30 }, (_, index) => {
      const date = new Date(start + index * DAY_MS).toISOString().slice(0, 10);
      return { date, count: counts.get(date) ?? 0 };
    });
  },
});

export const getSpiritualSeasonDistribution = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const users = await ctx.db.query("users").collect();
    const counts = new Map<string, number>();
    for (const season of SPIRITUAL_SEASONS) counts.set(season, 0);
    counts.set("unspecified", 0);

    for (const user of users) {
      if (user.isAnonymous === true) continue;
      const season = user.spiritualSeason ?? "unspecified";
      counts.set(season, (counts.get(season) ?? 0) + 1);
    }

    return Array.from(counts, ([season, count]) => ({ season, count }));
  },
});

export const getFeedbackSignals = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const sessionPulses = await ctx.db.query("sessionPulses").collect();
    const pathDebriefs = await ctx.db.query("pathDebriefs").collect();
    const sessionPulsesQ1 = {
      didnt_connect: 0,
      it_was_helpful: 0,
      landed_deeply: 0,
    };
    const pathDebriefsQ1 = {
      more_grounded: 0,
      clearer_understanding: 0,
      not_sure: 0,
      didnt_feel_much: 0,
    };
    const pathDebriefsQ2 = {
      much_deeper: 0,
      similar_to_others: 0,
      not_what_expected: 0,
      first_time_engaging: 0,
    };
    const pathDebriefsQ3 = {
      start_another: 0,
      need_a_break: 0,
      not_sure: 0,
    };

    for (const pulse of sessionPulses) {
      if (pulse.q1Response in sessionPulsesQ1) {
        sessionPulsesQ1[pulse.q1Response as keyof typeof sessionPulsesQ1]++;
      }
    }
    for (const debrief of pathDebriefs) {
      if (debrief.q1Response in pathDebriefsQ1) {
        pathDebriefsQ1[debrief.q1Response as keyof typeof pathDebriefsQ1]++;
      }
      if (debrief.q2Response in pathDebriefsQ2) {
        pathDebriefsQ2[debrief.q2Response as keyof typeof pathDebriefsQ2]++;
      }
      if (debrief.q3Response in pathDebriefsQ3) {
        pathDebriefsQ3[debrief.q3Response as keyof typeof pathDebriefsQ3]++;
      }
    }

    return {
      sessionPulsesQ1,
      pathDebriefsQ1,
      pathDebriefsQ2,
      pathDebriefsQ3,
      totalPulses: sessionPulses.length,
      totalDebriefs: pathDebriefs.length,
    };
  },
});

export const getUserDirectory = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const users = await ctx.db
      .query("users")
      .order("desc")
      .paginate(args.paginationOpts);
    const paths = await ctx.db.query("paths").collect();
    const pathsById = new Map(paths.map((path) => [path._id, path]));

    const page = [];
    for (const user of users.page) {
      if (user.isAnonymous === true) continue;

      const [latestCompletion, latestPath] = await Promise.all([
        ctx.db
          .query("userSessionCompletions")
          .withIndex("by_userId_completedAt", (q) => q.eq("userId", user._id))
          .order("desc")
          .first(),
        ctx.db
          .query("userPaths")
          .withIndex("by_userId_startedAt", (q) => q.eq("userId", user._id))
          .order("desc")
          .first(),
      ]);

        let lastSession = "None";

        if (latestCompletion) {
          const pathTitle =
            pathsById.get(latestCompletion.pathId)?.title ?? "Unknown Path";
          const date = new Date(latestCompletion.completedAt).toLocaleDateString(
            "en-US",
            { year: "numeric", month: "short", day: "numeric" },
          );
          lastSession = `${pathTitle} - Completed Day ${latestCompletion.dayNumber} (${date})`;
        } else if (latestPath) {
          const pathTitle = pathsById.get(latestPath.pathId)?.title ?? "Unknown Path";
          const date = new Date(latestPath.startedAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          });
          lastSession = `${pathTitle} - Started Day ${latestPath.currentDay} (${date})`;
        }

        page.push({
          userId: user._id,
          name:
            [user.firstName, user.lastName].filter(Boolean).join(" ") ||
            user.name ||
            "Anonymous",
          email: user.email || "No Email",
          phoneNumber: user.phoneNumber || "No Phone Number",
          lastSession,
        });
    }

    return {
      ...users,
      page,
    };
  },
});

export const getAllUsersForExport = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const users = await ctx.db.query("users").order("desc").collect();
    const paths = await ctx.db.query("paths").collect();
    const pathsById = new Map(paths.map((path) => [path._id, path]));

    const rows = [];
    for (const user of users) {
      if (user.isAnonymous === true) continue;

      const [latestCompletion, latestPath] = await Promise.all([
        ctx.db
          .query("userSessionCompletions")
          .withIndex("by_userId_completedAt", (q) => q.eq("userId", user._id))
          .order("desc")
          .first(),
        ctx.db
          .query("userPaths")
          .withIndex("by_userId_startedAt", (q) => q.eq("userId", user._id))
          .order("desc")
          .first(),
      ]);

      let lastSession = "None";

      if (latestCompletion) {
        const pathTitle = pathsById.get(latestCompletion.pathId)?.title ?? "Unknown Path";
        const date = new Date(latestCompletion.completedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
        lastSession = `${pathTitle} - Completed Day ${latestCompletion.dayNumber} (${date})`;
      } else if (latestPath) {
        const pathTitle = pathsById.get(latestPath.pathId)?.title ?? "Unknown Path";
        const date = new Date(latestPath.startedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
        lastSession = `${pathTitle} - Started Day ${latestPath.currentDay} (${date})`;
      }

      rows.push({
        name: [user.firstName, user.lastName].filter(Boolean).join(" ") || user.name || "Anonymous",
        email: user.email || "No Email",
        phoneNumber: user.phoneNumber || "No Phone Number",
        lastSession,
      });
    }

    return rows;
  },
});
