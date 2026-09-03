import { v } from "convex/values";
import { action, internalAction, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { Resend as ResendAPI } from "resend";
import { Id } from "./_generated/dataModel";

// Helper to map preference value to a user-friendly label in the email
const MAP_STUDY_TIME_LABEL: Record<string, string> = {
  morning: "Early Morning",
  early_morning: "Early Morning",
  afternoon: "Afternoon",
  evening: "Evening",
  bed: "Before Bed",
  before_bed: "Before Bed",
};

// Helper to map preference value to a lowercase version for body copy
const MAP_STUDY_TIME_BODY: Record<string, string> = {
  morning: "early morning",
  early_morning: "early morning",
  afternoon: "afternoon",
  evening: "evening",
  bed: "before bed",
  before_bed: "before bed",
};

/**
 * Helper to calculate local midnight UTC timestamp for a given timezone.
 */
function getLocalMidnightUtc(timezone: string): number {
  try {
    const localTimeStr = new Date().toLocaleString("en-US", { timeZone: timezone });
    const localDate = new Date(localTimeStr);
    localDate.setHours(0, 0, 0, 0);
    return Date.now() - (new Date(localTimeStr).getTime() - localDate.getTime());
  } catch {
    // Fallback if timezone is invalid
    const fallback = new Date();
    fallback.setUTCHours(0, 0, 0, 0);
    return fallback.getTime();
  }
}

/**
 * Helper to calculate the current local hour in a given timezone.
 */
function getLocalHour(timezone: string): number {
  try {
    const localTimeStr = new Date().toLocaleString("en-US", { timeZone: timezone });
    return new Date(localTimeStr).getHours();
  } catch {
    return new Date().getUTCHours();
  }
}

/**
 * Helper to wrap email bodies in a clean, beautiful HTML layout.
 */
function wrapHtmlEmail(firstName: string, bodyContent: string, ctaUrl: string, ctaText: string, unsubscribeUrl: string, siteUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Lampstand</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background-color: #f7fafc;
            color: #2d3748;
            margin: 0;
            padding: 0;
            line-height: 1.6;
          }
          .container {
            max-width: 580px;
            margin: 40px auto;
            background: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
            overflow: hidden;
            border: 1px solid #edf2f7;
          }
          .header {
            padding: 32px 32px 16px 32px;
            text-align: left;
          }
          .logo {
            font-size: 24px;
            font-weight: 700;
            color: #1a365d;
            letter-spacing: -0.5px;
          }
          .content {
            padding: 0 32px 32px 32px;
            font-size: 16px;
            color: #4a5568;
          }
          .content p {
            margin-bottom: 20px;
          }
          .cta-container {
            margin: 32px 0;
            text-align: left;
          }
          .btn-primary {
            display: inline-block;
            background-color: #2b6cb0;
            color: #ffffff !important;
            padding: 12px 28px;
            font-size: 16px;
            font-weight: 600;
            text-decoration: none;
            border-radius: 8px;
            text-align: center;
          }
          .footer {
            background-color: #f7fafc;
            padding: 24px 32px;
            border-top: 1px solid #edf2f7;
            font-size: 12px;
            color: #a0aec0;
            line-height: 1.8;
          }
          .footer a {
            color: #718096;
            text-decoration: underline;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="${siteUrl}/logo.png" alt="Logo" style="height: 24px; width: auto; vertical-align: middle; display: inline-block; margin-right: 8px;" />
            <span class="logo" style="vertical-align: middle;">LAMPSTAND</span>
          </div>
          <div class="content">
            ${bodyContent}
            <div class="cta-container">
              <a href="${ctaUrl}" class="btn-primary" target="_blank">${ctaText}</a>
            </div>
          </div>
          <div class="footer">
            You're receiving this because you created a Lampstand account. 
            <br>
            <a href="${unsubscribeUrl}">Unsubscribe</a> · <a href="${unsubscribeUrl}">Update reminder settings</a>
          </div>
        </div>
      </body>
    </html>
  `;
}

// ─────────────────────────────────────────────────────────────────────────────
// Queries & Mutations
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns users eligible for daily or re-engagement reminders.
 * Runs in a query context.
 */
export const getEligibleUsersForReminders = internalQuery({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    const eligible: Array<{
      userId: Id<"users">;
      email: string;
      firstName: string;
      studyTimePreference: string;
      timezone: string;
      reminderType: "daily" | "reengagement";
      currentDay: number;
      pathTitle: string;
    }> = [];

    for (const user of users) {
      // 1. Must be authenticated with email notifications opt-in
      if (!user.email || !user.hasCompletedOnboarding) continue;
      const contactPref = user.contactPreference ?? "email";
      if (contactPref !== "email" && contactPref !== "both") continue;

      const timezone = user.timezone ?? "UTC";
      const studyTime = user.studyTimePreference ?? "morning";

      // 2. Map study preference to target local hour
      let targetHour = 6;
      if (studyTime === "afternoon") targetHour = 12;
      else if (studyTime === "evening") targetHour = 18;
      else if (studyTime === "bed" || studyTime === "before_bed") targetHour = 20;

      const localHour = getLocalHour(timezone);
      if (localHour !== targetHour) continue;

      // 3. User must have an active path
      const activePath = await ctx.db
        .query("userPaths")
        .withIndex("by_userId", (q) => q.eq("userId", user._id))
        .filter((q) => q.eq(q.field("status"), "active"))
        .first();

      if (!activePath) continue;

      const path = await ctx.db.get(activePath.pathId);
      if (!path) continue;

      // 4. Check if they completed a session since local midnight today
      const localMidnight = getLocalMidnightUtc(timezone);
      const completedToday = await ctx.db
        .query("userSessionCompletions")
        .withIndex("by_userId", (q) => q.eq("userId", user._id))
        .filter((q) => q.gte(q.field("completedAt"), localMidnight))
        .first();

      if (completedToday) continue;

      // 5. Determine whether they are in a re-engagement window (48h inactivity)
      const lastCompletion = await ctx.db
        .query("userSessionCompletions")
        .withIndex("by_userId", (q) => q.eq("userId", user._id))
        .order("desc")
        .first();

      const lastActiveTime = lastCompletion ? lastCompletion.completedAt : activePath.startedAt;
      const hoursInactive = (Date.now() - lastActiveTime) / (1000 * 60 * 60);

      const name = user.firstName || user.name || "friend";

      if (hoursInactive >= 48) {
        // Trigger Re-engagement if not already sent for this inactivity gap
        const alreadySentForGap = user.lastReengagementSentAt && user.lastReengagementSentAt > lastActiveTime;
        if (!alreadySentForGap) {
          eligible.push({
            userId: user._id,
            email: user.email,
            firstName: name,
            studyTimePreference: studyTime,
            timezone,
            reminderType: "reengagement",
            currentDay: activePath.currentDay,
            pathTitle: path.title,
          });
        }
      } else {
        // Normal daily reminder
        eligible.push({
          userId: user._id,
          email: user.email,
          firstName: name,
          studyTimePreference: studyTime,
          timezone,
          reminderType: "daily",
          currentDay: activePath.currentDay,
          pathTitle: path.title,
          });
      }
    }

    return eligible;
  },
});

/**
 * Records that a re-engagement reminder was successfully sent to the user.
 */
export const updateReengagementSent = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      lastReengagementSentAt: Date.now(),
    });
  },
});

/**
 * Returns full profile info for sending the Welcome email.
 */
export const getWelcomeEmailData = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user || !user.email) return null;
    return {
      email: user.email,
      firstName: user.firstName || user.name || "friend",
      studyTimePreference: user.studyTimePreference ?? "morning",
    };
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// Actions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Action to send a welcome email immediately on signup.
 */
export const sendWelcomeEmail = internalAction({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    // Disable reminders in production unless explicitly enabled via environment variable
    const isProd = process.env.SITE_URL && !process.env.SITE_URL.includes("localhost");
    const enableReminders = process.env.ENABLE_REMINDERS === "true";
    if (isProd && !enableReminders) {
      console.log("[Reminders] Welcome email disabled in production.");
      return;
    }

    const apiKey = process.env.AUTH_RESEND_KEY;
    if (!apiKey) {
      console.warn("[Reminders] AUTH_RESEND_KEY not set. Skipping Welcome email.");
      return;
    }

    const userData = await ctx.runQuery(internal.reminders.getWelcomeEmailData, {
      userId: args.userId,
    });
    if (!userData) return;

    const resend = new ResendAPI(apiKey);

    const devRedirect = process.env.AUTH_DEV_EMAIL_REDIRECT;
    const toAddress = devRedirect ? devRedirect : userData.email;
    const isRedirect = devRedirect && devRedirect !== userData.email;
    const fromAddress = devRedirect
      ? "LampStand <onboarding@resend.dev>"
      : "LampStand <no-reply@lampstandapp.net>";

    const studyTimeLabel = MAP_STUDY_TIME_LABEL[userData.studyTimePreference] || "Early Morning";

    const subject = isRedirect
      ? `[DEV] To: ${userData.email} | Welcome to Lampstand, ${userData.firstName}`
      : `Welcome to Lampstand, ${userData.firstName}`;

    const bodyContent = `
      <p>Hi ${userData.firstName},</p>
      <p>Welcome to Lampstand.</p>
      <p>You've just taken a step that a lot of people talk about but few actually take — choosing to go deeper with Scripture in a structured, intentional way.</p>
      <p>Lampstand isn't a devotional. It's not a Bible reading plan. It's a guided formation journey — designed to help you see God's character clearly in Scripture, and to help that clarity change how you respond to real life.</p>
      <p>Your first journey is ready for you.</p>
      <h3>Trust in Uncertainty — a 7-day formation path</h3>
      <p>Over the next seven days, you'll move through a guided sequence that addresses one of the most honest human struggles there is — what it means to trust God when the future is unclear.</p>
      <p>Each session takes about 10 minutes. One a day. That's it.</p>
      <p><strong>You've chosen ${studyTimeLabel} as your study time.</strong></p>
      <p>We'll send you a gentle reminder each day at that time — but only if you haven't already completed your session. If you show up before we remind you, you won't hear from us that day.</p>
      <p>A few things worth knowing before you start:</p>
      <ul>
        <li><strong>This is not about being consistent enough.</strong> If you miss a day, your journey is still there. You just pick up where you left off.</li>
        <li><strong>This is not about knowing enough.</strong> You don't need theological training. You just need to show up.</li>
        <li><strong>This is about formation, not information.</strong> Our hope is that you trust Him more — especially when things are hard.</li>
      </ul>
      <p>We'll be with you every step of the way.</p>
      <p>See you on Day 1.</p>
      <p>— The Lampstand Team</p>
    `;

    const siteUrl = process.env.SITE_URL || "http://localhost:3000";
    const ctaUrl = `${siteUrl}/paths`;
    const unsubscribeUrl = `${siteUrl}/profile`;

    const html = wrapHtmlEmail(userData.firstName, bodyContent, ctaUrl, "Begin Day 1", unsubscribeUrl, siteUrl);

    const { error } = await resend.emails.send({
      from: fromAddress,
      to: [toAddress],
      subject,
      html,
    });

    if (error) {
      console.error("[Reminders] Error sending Welcome email:", error);
    } else {
      console.log(`[Reminders] Sent Welcome email to ${userData.email} (Redirected: ${isRedirect})`);
    }
  },
});

/**
 * Hourly Cron Action that performs checks and sends reminders.
 */
export const checkAndSendReminders = internalAction({
  args: {},
  handler: async (ctx) => {
    // Disable reminders in production unless explicitly enabled via environment variable
    const isProd = process.env.SITE_URL && !process.env.SITE_URL.includes("localhost");
    const enableReminders = process.env.ENABLE_REMINDERS === "true";
    if (isProd && !enableReminders) {
      console.log("[Reminders] Reminders disabled in production.");
      return;
    }

    const apiKey = process.env.AUTH_RESEND_KEY;
    if (!apiKey) {
      console.warn("[Reminders] AUTH_RESEND_KEY not set. Skipping hourly reminders check.");
      return;
    }

    const eligibleUsers = await ctx.runQuery(
      internal.reminders.getEligibleUsersForReminders
    );

    if (eligibleUsers.length === 0) {
      console.log("[Reminders] Sweep completed: 0 users eligible this hour.");
      return;
    }

    const resend = new ResendAPI(apiKey);
    const siteUrl = process.env.SITE_URL || "http://localhost:3000";
    const devRedirect = process.env.AUTH_DEV_EMAIL_REDIRECT;

    for (const item of eligibleUsers) {
      const toAddress = devRedirect ? devRedirect : item.email;
      const isRedirect = devRedirect && devRedirect !== item.email;
      const fromAddress = devRedirect
        ? "LampStand <onboarding@resend.dev>"
        : "LampStand <no-reply@lampstandapp.net>";

      let subject = "";
      let bodyContent = "";
      let ctaText = "Continue My Journey";
      const ctaUrl = `${siteUrl}/my-journey`;

      const studyTimeLower = MAP_STUDY_TIME_BODY[item.studyTimePreference] || "morning";

      if (item.reminderType === "daily") {
        // Daily Reminder Days 1 - 7
        const day = item.currentDay;
        ctaText = day === 7 ? "Complete Your Journey" : `Continue Day ${day}`;

        if (day === 1) {
          subject = `Your first session is ready, ${item.firstName}.`;
          bodyContent = `
            <p>Hi ${item.firstName},</p>
            <p>Your ${studyTimeLower} session is ready. Day 1 of Trust in Uncertainty is waiting for you.</p>
            <p>Today you'll name something most of us carry quietly — the weight of not knowing what comes next, and the tendency to reach for control when we can't see the path ahead.</p>
            <p><strong>Today's session:</strong> When the Future Feels Uncertain<br><strong>Scripture:</strong> Proverbs 3:5–6<br><strong>Time needed:</strong> About 10 minutes</p>
            <p>One session. Ten minutes. That's all today asks of you.</p>
          `;
          ctaText = "Begin Day 1";
        } else if (day === 2) {
          subject = `Day 2 is ready — God sees what you cannot see.`;
          bodyContent = `
            <p>Hi ${item.firstName},</p>
            <p>You showed up yesterday. That matters.</p>
            <p>Day 2 is ready for you at your chosen ${studyTimeLower} time.</p>
            <p><strong>Today's session:</strong> God Sees What We Cannot See<br><strong>Scripture:</strong> Isaiah 55:8–9<br><strong>Formation focus:</strong> God's perspective is higher than ours — and that's not a dismissal of your confusion. It's what makes trust possible.</p>
            <p>Ten minutes. One truth. That's today.</p>
          `;
        } else if (day === 3) {
          subject = `Day 3 — what does it look like to stop striving?`;
          bodyContent = `
            <p>Hi ${item.firstName},</p>
            <p>Day 3 of your journey is ready.</p>
            <p><strong>Today's session:</strong> Trusting God's Care<br><strong>Scripture:</strong> Matthew 6:25–34<br><strong>Formation focus:</strong> Jesus speaks directly into worry — not by dismissing it, but by pointing to a God who actively provides and cares.</p>
          `;
        } else if (day === 4) {
          subject = `Day 4 — God can handle your most honest prayers.`;
          bodyContent = `
            <p>Hi ${item.firstName},</p>
            <p>Day 4 is waiting for you. This one might be the most honest session of the journey.</p>
            <p><strong>Today's session:</strong> Honest Prayer in Uncertainty<br><strong>Scripture:</strong> Psalm 13<br><strong>Formation focus:</strong> God is not threatened by doubt or fear. He welcomes honest prayer — and that honesty is an act of trust, not a failure of faith.</p>
            <p>This is a session worth sitting with.</p>
          `;
        } else if (day === 5) {
          subject = `Day 5 — what does faithful waiting actually look like?`;
          bodyContent = `
            <p>Hi ${item.firstName},</p>
            <p>You're more than halfway through your journey. Day 5 is ready.</p>
            <p><strong>Today's session:</strong> Waiting for God's Timing<br><strong>Scripture:</strong> Habakkuk 2:3<br><strong>Formation focus:</strong> Delay is not silence. God's faithfulness operates on a timeline that is different from ours — and that is not indifference. It is sovereignty.</p>
          `;
        } else if (day === 6) {
          subject = `Day 6 — trust is a choice. Today you practise it.`;
          bodyContent = `
            <p>Hi ${item.firstName},</p>
            <p>One session away from finishing. Day 6 is ready for you.</p>
            <p><strong>Today's session:</strong> Practising Trust<br><strong>Scripture:</strong> Psalm 56:3<br><strong>Formation focus:</strong> Trust is not just a feeling — it is a decision made in the moment of fear. Today's session gives you something concrete to take into your next difficult moment.</p>
          `;
        } else if (day === 7) {
          subject = `Day 7 — your final session is ready. You've almost made it.`;
          bodyContent = `
            <p>Hi ${item.firstName},</p>
            <p>This is it. Day 7 — the last session of your first formation journey.</p>
            <p><strong>Today's session:</strong> Anchored in God's Faithfulness<br><strong>Scripture:</strong> Hebrews 10:23<br><strong>Formation focus:</strong> After seven days of naming the struggle, seeing God's character, and practising trust — today you settle into something solid.</p>
            <p>Whatever brought you to Lampstand seven days ago — we hope something has shifted. Not because you read the right things, but because you kept showing up.</p>
          `;
        } else {
          // Fallback if day is somehow out of bounds
          subject = `Your daily session is ready, ${item.firstName}.`;
          bodyContent = `<p>Hi ${item.firstName},</p><p>Day ${day} of ${item.pathTitle} is waiting for you.</p>`;
        }
      } else {
        // Re-engagement (Email 3)
        subject = `Life got full. That's okay.`;
        bodyContent = `
          <p>Hi ${item.firstName},</p>
          <p>Life gets full. We know.</p>
          <p>Your Lampstand journey is still exactly where you left it — nothing has been lost, nothing has been reset. Whenever you're ready to pick up where you left off, it's waiting for you.</p>
          <p>You're on Day ${item.currentDay} of ${item.pathTitle}.</p>
          <p>We'll keep sending your gentle reminder at your chosen time (${MAP_STUDY_TIME_LABEL[item.studyTimePreference] || "Early Morning"}) whenever you're ready to return — you don't need to change anything.</p>
          <br>
          <p><strong>There's no streak to protect here.</strong> No penalty for missing a day. No pressure to catch up. Lampstand isn't about consistency as a performance — it's about formation, at the pace you can actually show up for.</p>
          <p>If today is that day, we're glad. If it's tomorrow, that's fine too.</p>
        `;
        ctaText = "Continue Where You Left Off";
      }

      if (isRedirect) {
        subject = `[DEV] To: ${item.email} | ${subject}`;
      }

      const html = wrapHtmlEmail(item.firstName, bodyContent, ctaUrl, ctaText, `${siteUrl}/profile`, siteUrl);

      try {
        const { error } = await resend.emails.send({
          from: fromAddress,
          to: [toAddress],
          subject,
          html,
        });

        if (error) {
          console.error(`[Reminders] Error sending reminder to ${item.email}:`, error);
        } else {
          console.log(`[Reminders] Sent ${item.reminderType} reminder to ${item.email} (Redirected: ${isRedirect})`);
          if (item.reminderType === "reengagement") {
            await ctx.runMutation(internal.reminders.updateReengagementSent, {
              userId: item.userId,
            });
          }
        }
      } catch (err) {
        console.error(`[Reminders] Exception while sending to ${item.email}:`, err);
      }
    }
  },
});

/**
 * Test action to send a preview of any email type directly to a target address.
 * Run using: npx convex run reminders:sendReminderPreview '{"email": "your-email@gmail.com", "type": "daily", "day": 1}'
 */
export const sendReminderPreview = action({
  args: {
    email: v.string(),
    type: v.union(v.literal("welcome"), v.literal("daily"), v.literal("reengagement")),
    day: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.AUTH_RESEND_KEY;
    if (!apiKey) {
      throw new Error("AUTH_RESEND_KEY not set");
    }

    const resend = new ResendAPI(apiKey);
    const siteUrl = process.env.SITE_URL || "http://localhost:3000";

    let subject = "";
    let bodyContent = "";
    let ctaText = "Continue My Journey ";
    let ctaUrl = `${siteUrl}/my-journey`;

    if (args.type === "welcome") {
      subject = "Welcome to Lampstand, John";
      bodyContent = `
        <p>Hi John,</p>
        <p>Welcome to Lampstand.</p>
        <p>You've just taken a step that a lot of people talk about but few actually take — choosing to go deeper with Scripture in a structured, intentional way.</p>
        <p>Lampstand isn't a devotional. It's not a Bible reading plan. It's a guided formation journey — designed to help you see God's character clearly in Scripture, and to help that clarity change how you respond to real life.</p>
        <p>Your first journey is ready for you.</p>
        <h3>Trust in Uncertainty — a 7-day formation path</h3>
        <p>Over the next seven days, you'll move through a guided sequence that addresses one of the most honest human struggles there is — what it means to trust God when the future is unclear.</p>
        <p>Each session takes about 10 minutes. One a day. That's it.</p>
        <p><strong>You've chosen Early Morning as your study time.</strong></p>
        <p>We'll send you a gentle reminder each day at that time — but only if you haven't already completed your session.</p>
      `;
      ctaText = "Begin Day 1 ";
      ctaUrl = `${siteUrl}/paths`;
    } else if (args.type === "reengagement") {
      subject = "Life got full. That's okay.";
      bodyContent = `
        <p>Hi John,</p>
        <p>Life gets full. We know.</p>
        <p>Your Lampstand journey is still exactly where you left it — nothing has been lost, nothing has been reset. Whenever you're ready to pick up where you left off, it's waiting for you.</p>
        <p>You're on Day 3 of Trust in Uncertainty.</p>
        <p>We'll keep sending your gentle reminder at your chosen time (Early Morning) whenever you're ready to return — you don't need to change anything.</p>
        <br>
        <p><strong>There's no streak to protect here.</strong> No pressure to catch up. Lampstand isn't about consistency as a performance — it's about formation, at the pace you can actually show up for.</p>
      `;
      ctaText = "Continue Where You Left Off ";
    } else {
      const day = args.day ?? 1;
      ctaText = day === 7 ? "Complete Your Journey " : `Continue Day ${day} `;

      if (day === 1) {
        subject = "Your first session is ready, John.";
        bodyContent = `
          <p>Hi John,</p>
          <p>Your morning session is ready. Day 1 of Trust in Uncertainty is waiting for you.</p>
          <p>Today you'll name something most of us carry quietly — the weight of not knowing what comes next, and the tendency to reach for control when we can't see the path ahead.</p>
          <p><strong>Today's session:</strong> When the Future Feels Uncertain<br><strong>Scripture:</strong> Proverbs 3:5–6<br><strong>Time needed:</strong> About 10 minutes</p>
        `;
        ctaText = "Begin Day 1 ";
      } else if (day === 2) {
        subject = "Day 2 is ready — God sees what you cannot see.";
        bodyContent = `
          <p>Hi John,</p>
          <p>You showed up yesterday. That matters.</p>
          <p>Day 2 is ready for you at your chosen morning time.</p>
          <p><strong>Today's session:</strong> God Sees What We Cannot See<br><strong>Scripture:</strong> Isaiah 55:8–9<br><strong>Formation focus:</strong> God's perspective is higher than ours — and that's not a dismissal of your confusion. It's what makes trust possible.</p>
        `;
      } else if (day === 3) {
        subject = "Day 3 — what does it look like to stop striving?";
        bodyContent = `
          <p>Hi John,</p>
          <p>Day 3 of your journey is ready.</p>
          <p><strong>Today's session:</strong> Trusting God's Care<br><strong>Scripture:</strong> Matthew 6:25–34<br><strong>Formation focus:</strong> Jesus speaks directly into worry — not by dismissing it, but by pointing to a God who actively provides and cares.</p>
        `;
      } else if (day === 4) {
        subject = "Day 4 — God can handle your most honest prayers.";
        bodyContent = `
          <p>Hi John,</p>
          <p>Day 4 is waiting for you. This one might be the most honest session of the journey.</p>
          <p><strong>Today's session:</strong> Honest Prayer in Uncertainty<br><strong>Scripture:</strong> Psalm 13<br><strong>Formation focus:</strong> God is not threatened by doubt or fear. He welcomes honest prayer — and that honesty is an act of trust, not a failure of faith.</p>
        `;
      } else if (day === 5) {
        subject = "Day 5 — what does faithful waiting actually look like?";
        bodyContent = `
          <p>Hi John,</p>
          <p>You're more than halfway through your journey. Day 5 is ready.</p>
          <p><strong>Today's session:</strong> Waiting for God's Timing<br><strong>Scripture:</strong> Habakkuk 2:3<br><strong>Formation focus:</strong> Delay is not silence. God's faithfulness operates on a timeline that is different from ours — and that is not indifference. It is sovereignty.</p>
        `;
      } else if (day === 6) {
        subject = "Day 6 — trust is a choice. Today you practise it.";
        bodyContent = `
          <p>Hi John,</p>
          <p>One session away from finishing. Day 6 is ready for you.</p>
          <p><strong>Today's session:</strong> Practising Trust<br><strong>Scripture:</strong> Psalm 56:3<br><strong>Formation focus:</strong> Trust is not just a choice — it is a decision made in the moment of fear.</p>
        `;
      } else {
        subject = "Day 7 — your final session is ready. You've almost made it.";
        bodyContent = `
          <p>Hi John,</p>
          <p>This is it. Day 7 — the last session of your first formation journey.</p>
          <p><strong>Today's session:</strong> Anchored in God's Faithfulness<br><strong>Scripture:</strong> Hebrews 10:23<br><strong>Formation focus:</strong> After seven days of naming the struggle, seeing God's character, and practising trust — today you settle into something solid.</p>
        `;
      }
    }

    const html = wrapHtmlEmail("John", bodyContent, ctaUrl, ctaText, `${siteUrl}/profile`, siteUrl);

    const { error } = await resend.emails.send({
      from: "LampStand <onboarding@resend.dev>",
      to: [args.email],
      subject: `[PREVIEW] ${subject}`,
      html,
    });

    if (error) {
      throw new Error(JSON.stringify(error));
    }
  },
});



