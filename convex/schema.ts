import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  // ── Convex Auth tables ─────────────────────────────────────────────────
  ...authTables,

  // ── System 1: Auth & Onboarding ────────────────────────────────────────
  // Central user record. Extends Convex Auth defaults with profile + onboarding.
  users: defineTable({
    // Populated by Convex Auth automatically
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    image: v.optional(v.string()),
    name: v.optional(v.string()),
    isAnonymous: v.optional(v.boolean()),
    role: v.optional(v.union(v.literal("user"), v.literal("admin"))),

    // Profile — collected on /onboarding step 1
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),

    // Onboarding — collected on /onboarding step 2
    hasCompletedOnboarding: v.optional(v.boolean()),
    // One of: uncertain_future | pressure_stress | struggling_to_trust |
    //         waiting | distant_from_god | none
    spiritualSeason: v.optional(v.string()),
    // 2-letter country code, e.g. "NG", "US"
    region: v.optional(v.string()),

    // Reminders & Preferences
    studyTimePreference: v.optional(v.string()),
    contactPreference: v.optional(v.string()),
    timezone: v.optional(v.string()),
    lastReengagementSentAt: v.optional(v.number()),
  }).index("email", ["email"])
    .index("by_studyTimePreference", ["studyTimePreference"])
    .index("by_role", ["role"]),

  // ── System 2: Formation Progression Engine ─────────────────────────────

  // Master catalog of all paths (live and coming soon)
  paths: defineTable({
    title: v.string(),
    description: v.string(),
    // true = available to start; false = Coming Soon
    isLive: v.boolean(),
    // Always 7 in prototype
    totalDays: v.number(),
    // e.g. "Fear & Anxiety", "Loss & Grief"
    category: v.string(),
  }).index("by_isLive", ["isLive"]),

  // One session per day per path
  sessions: defineTable({
    pathId: v.id("paths"),
    dayNumber: v.number(),
    title: v.string(),

    // ── Rich content fields (optional until seeded) ──────────────────────
    // Scripture
    scriptureReference: v.optional(v.string()),  // e.g. "Proverbs 3:5–6, NKJV"
    scriptureVerse: v.optional(v.string()),       // the verse text
    scriptureContext: v.optional(v.string()),     // historical/background paragraph

    // Insight into God's character
    insightText: v.optional(v.string()),

    // Personal application
    applicationText: v.optional(v.string()),

    // Reflection questions (array of strings)
    reflectionQuestions: v.optional(v.array(v.string())),

    // Guided prayer
    guidedPrayer: v.optional(v.string()),
  }).index("by_pathId", ["pathId"])
    .index("by_pathId_dayNumber", ["pathId", "dayNumber"]),

  // A user's personal journey through a path
  userPaths: defineTable({
    userId: v.id("users"),
    pathId: v.id("paths"),
    currentDay: v.number(),
    completedDays: v.array(v.number()),
    // "active" | "complete"
    status: v.string(),
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
  }).index("by_userId", ["userId"])
    .index("by_userId_pathId", ["userId", "pathId"])
    .index("by_userId_startedAt", ["userId", "startedAt"]),

  // Immutable event log — written once when a session is completed
  userSessionCompletions: defineTable({
    userId: v.id("users"),
    pathId: v.id("paths"),
    sessionId: v.id("sessions"),
    dayNumber: v.number(),
    completedAt: v.number(),
  }).index("by_userId", ["userId"])
    .index("by_userId_sessionId", ["userId", "sessionId"])
    .index("by_userId_completedAt", ["userId", "completedAt"])
    .index("by_completedAt", ["completedAt"]),

  // ── System 3: Session Feedback ─────────────────────────────────────────

  // Quick formation signal after each session (Days 1–7)
  sessionPulses: defineTable({
    userId: v.id("users"),
    pathId: v.id("paths"),
    sessionId: v.id("sessions"),
    dayNumber: v.number(),
    // "didnt_connect" | "it_was_helpful" | "landed_deeply"
    q1Response: v.string(),
    q2Text: v.optional(v.string()),
    // Snapshot of user's spiritual season at write time
    spiritualSeason: v.optional(v.string()),
    submittedAt: v.number(),
  }).index("by_userId", ["userId"])
    .index("by_userId_sessionId", ["userId", "sessionId"])
    .index("by_pathId_dayNumber", ["pathId", "dayNumber"])
    .index("by_spiritualSeason", ["spiritualSeason"]),

  // Deep formation reflection after Day 7
  pathDebriefs: defineTable({
    userId: v.id("users"),
    pathId: v.id("paths"),
    // "more_grounded" | "clearer_understanding" | "not_sure" | "didnt_feel_much"
    q1Response: v.string(),
    // "much_deeper" | "similar_to_others" | "not_what_expected" | "first_time_engaging"
    q2Response: v.string(),
    // "start_another" | "need_a_break" | "not_sure"
    q3Response: v.string(),
    q4Text: v.optional(v.string()),
    wasSkipped: v.boolean(),
    spiritualSeason: v.optional(v.string()),
    submittedAt: v.number(),
  }).index("by_userId", ["userId"])
    .index("by_userId_pathId", ["userId", "pathId"])
    .index("by_q1Response", ["q1Response"])
    .index("by_q3Response", ["q3Response"]),

  // ── System 4: Path Discovery Signals ───────────────────────────────────

  // One record per user per Coming Soon path tapped
  pathInterestTaps: defineTable({
    userId: v.id("users"),
    pathId: v.id("paths"),
    spiritualSeason: v.optional(v.string()),
    emailOptIn: v.boolean(),
    notificationEmail: v.optional(v.string()),
    tappedAt: v.number(),
  }).index("by_userId", ["userId"])
    .index("by_userId_pathId", ["userId", "pathId"])
    .index("by_pathId", ["pathId"])
    .index("by_spiritualSeason", ["spiritualSeason"]),

  // Pre-computed counter per path for fast reads
  pathInterestCounts: defineTable({
    pathId: v.id("paths"),
    totalTaps: v.number(),
  }).index("by_pathId", ["pathId"]),

  // ── System 5: Donations (schema only — no mutations yet) ───────────────

  donations: defineTable({
    userId: v.optional(v.id("users")),
    pathId: v.optional(v.id("paths")),
    triggerContext: v.string(), // "post_debrief" | "profile_tab"
    currency: v.string(), // "USD" | "NGN"
    amountMinor: v.number(),
    donationType: v.string(), // "one_time" | "monthly"
    displayAmountLabel: v.string(),
    pathDebriefQ1Response: v.optional(v.string()),
    spiritualSeason: v.optional(v.string()),
    provider: v.union(v.literal("lemon_squeezy"), v.literal("flutterwave")),
    
    // Lemon Squeezy fields (retained for reference)
    lemonSqueezyStoreId: v.optional(v.string()),
    lemonSqueezyVariantId: v.optional(v.string()),
    lemonSqueezyCheckoutId: v.optional(v.string()),
    lemonSqueezyCheckoutUrl: v.optional(v.string()),
    lemonSqueezyOrderId: v.optional(v.string()),
    lemonSqueezySubscriptionId: v.optional(v.string()),
    lemonSqueezyCustomerId: v.optional(v.string()),

    // Flutterwave fields
    flutterwaveTransactionId: v.optional(v.string()),
    flutterwaveRef: v.optional(v.string()),
    flutterwavePlanId: v.optional(v.string()),
    flutterwaveSubscriptionId: v.optional(v.string()),
    flutterwaveCheckoutUrl: v.optional(v.string()),
    flutterwaveCheckoutId: v.optional(v.string()),
    flutterwaveCustomerId: v.optional(v.string()),

    paymentChannel: v.optional(v.string()),
    status: v.string(), // "initialized" | "pending_verification" | "completed" | "failed" | "abandoned"
    failureReason: v.optional(v.string()),
    initializedAt: v.number(),
    verifiedAt: v.optional(v.number()),
    lastWebhookEventAt: v.optional(v.number()),
  }).index("by_userId", ["userId"])
    .index("by_orderId", ["lemonSqueezyOrderId"])
    .index("by_subscriptionId", ["lemonSqueezySubscriptionId"])
    .index("by_flutterwaveSubscriptionId", ["flutterwaveSubscriptionId"])
    .index("by_flutterwaveRef", ["flutterwaveRef"])
    .index("by_status", ["status"]),

  donationSkips: defineTable({
    userId: v.id("users"),
    pathId: v.optional(v.id("paths")),
    triggerContext: v.string(),
    pathDebriefQ1Response: v.optional(v.string()),
    spiritualSeason: v.optional(v.string()),
    skippedAt: v.number(),
  }).index("by_userId", ["userId"])
    .index("by_triggerContext", ["triggerContext"]),

  lemonSqueezyCustomerMaps: defineTable({
    userId: v.id("users"),
    lemonSqueezyStoreId: v.string(),
    lemonSqueezyCustomerId: v.string(),
    email: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_userId_storeId", ["userId", "lemonSqueezyStoreId"]),

  lemonSqueezyVariantMaps: defineTable({
    storeId: v.string(),
    currency: v.string(), // "USD" | "NGN"
    donationType: v.string(), // "one_time" | "monthly"
    tierKey: v.string(),
    amountMinor: v.number(),
    displayLabel: v.string(),
    lemonSqueezyVariantId: v.string(),
    isActive: v.boolean(),
    createdAt: v.number(),
  }).index("by_storeId_tierKey", ["storeId", "tierKey"])
    .index("by_currency_donationType", ["currency", "donationType"]),

  flutterwavePlanMaps: defineTable({
    currency: v.string(), // "USD" | "NGN"
    donationType: v.string(), // "one_time" | "monthly"
    tierKey: v.string(),
    amount: v.number(), // standard unit, e.g. 2500 for NGN 2,500
    displayLabel: v.string(),
    flutterwavePlanId: v.optional(v.string()), // only for monthly subscriptions
    isActive: v.boolean(),
    createdAt: v.number(),
  }).index("by_currency_donationType", ["currency", "donationType"])
    .index("by_tierKey", ["tierKey"]),

  waitlist: defineTable({
    email: v.string(),
    joinedAt: v.number(),
  }).index("by_email", ["email"]),
});
