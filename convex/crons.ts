import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Mark initialized donations that are more than 24h old as abandoned.
// Run this hourly.
crons.interval(
  "mark stale donations abandoned",
  { hours: 1 },
  internal.donations.markStaleDonationsAbandoned,
  {}
);

// Check and send email/WhatsApp session reminders to active users.
// Run this hourly.
crons.interval(
  "send hourly session reminders",
  { hours: 1 },
  internal.reminders.checkAndSendReminders,
  {}
);

export default crons;
