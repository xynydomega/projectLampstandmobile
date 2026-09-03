import { convexAuth } from "@convex-dev/auth/server";
import { ResendOTP } from "./otp/ResendOTP";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [ResendOTP],
  session: {
    totalDurationMs: 1000 * 60 * 60 * 24 * 365,
    inactiveDurationMs: 1000 * 60 * 60 * 24 * 365,
  },
});
