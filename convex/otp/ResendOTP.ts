import { Email } from "@convex-dev/auth/providers/Email";
import { Resend as ResendAPI } from "resend";
import { RandomReader, generateRandomString } from "@oslojs/crypto/random";

/**
 * Custom Resend OTP provider.
 * Generates a 4-digit numeric code to match the existing UI (4 input boxes).
 * Code is valid for 15 minutes.
 *
 * ── DEV BYPASS ──────────────────────────────────────────────────────────────
 * Set AUTH_DEV_BYPASS_CODE in your Convex env to skip email sending entirely.
 * The fixed code will be printed to the Convex dashboard logs.
 *
 *   npx convex env set AUTH_DEV_BYPASS_CODE 0000
 *
 * Then use the "⚡ Dev Login" button on the sign-in page to authenticate in
 * one click without waiting for an email.
 *
 * ── RESEND SANDBOX NOTE ─────────────────────────────────────────────────────
 * Resend's sandbox (onboarding@resend.dev) only delivers to the account
 * owner's email. Until a custom domain is verified at resend.com/domains,
 * all OTPs are redirected to AUTH_DEV_EMAIL_REDIRECT (set in Convex env vars).
 *
 * To get your OTP code when testing with a non-owner email:
 *   1. Open the Convex dashboard → your deployment → Logs
 *   2. Look for a log line: [OTP] code: XXXX
 *   3. Enter that code in the app
 *
 * In production (once a domain is verified), set AUTH_DEV_EMAIL_REDIRECT=""
 * and update the `from` address below — the redirect logic will be skipped.
 * ────────────────────────────────────────────────────────────────────────────
 */
export const ResendOTP = Email({
  id: "resend-otp",
  apiKey: process.env.AUTH_RESEND_KEY,
  maxAge: 60 * 15, // 15 minutes

  async generateVerificationToken() {
    // ── Dev bypass: always use the fixed code so it's predictable ──────────
    if (process.env.AUTH_DEV_BYPASS_CODE) {
      return process.env.AUTH_DEV_BYPASS_CODE;
    }

    const random: RandomReader = {
      read(bytes) {
        crypto.getRandomValues(bytes);
      },
    };
    // 4 digits to match the 4-box OTP UI
    return generateRandomString(random, "0123456789", 4);
  },

  async sendVerificationRequest({ identifier: email, provider, token }) {
    // ── Dev bypass: skip email, just log to Convex dashboard ───────────────
    if (process.env.AUTH_DEV_BYPASS_CODE) {
      console.log(
        `[DEV BYPASS] OTP for ${email} | code: ${token} (no email sent)`
      );
      return;
    }

    const resend = new ResendAPI(provider.apiKey);

    // If a redirect address is configured, use it (dev/sandbox mode).
    // Otherwise send directly to the user (production with verified domain).
    const devRedirect = process.env.AUTH_DEV_EMAIL_REDIRECT;
    const to = devRedirect ? devRedirect : email;
    const isRedirecting = devRedirect && devRedirect !== email;

    // Always log the code to the Convex dashboard for easy retrieval
    console.log(
      `[OTP] code: ${token} → ${isRedirecting ? `${email} (redirected to ${to})` : email}`
    );

    const fromAddress = devRedirect
      ? "LampStand <onboarding@resend.dev>"
      : "LampStand <no-reply@lampstandapp.net>";

    const { error } = await resend.emails.send({
      from: fromAddress,
      to: [to],
      subject: isRedirecting
        ? `[DEV] OTP for ${email} — code: ${token}`
        : "Your LampStand verification code",
      text: isRedirecting
        ? `[DEV MODE]\n\nThis OTP was intended for: ${email}\nCode: ${token}\n\nCheck the Convex dashboard logs for the code if you are not the account owner.\n\nExpires in 15 minutes.`
        : `Your verification code is: ${token}\n\nThis code expires in 15 minutes. Do not share it with anyone.`,
    });

    if (error) {
      throw new Error(JSON.stringify(error));
    }
  },
});