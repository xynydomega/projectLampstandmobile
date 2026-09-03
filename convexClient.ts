import { ConvexReactClient } from "convex/react";

const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL;
if (!convexUrl) {
  throw new Error(
    "Missing EXPO_PUBLIC_CONVEX_URL - check .env.local (expected https://outstanding-capybara-733.convex.cloud for staging or https://exciting-dodo-656.convex.cloud for prod)"
  );
}

export const convex = new ConvexReactClient(convexUrl);
