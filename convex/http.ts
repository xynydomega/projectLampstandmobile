import { httpRouter } from "convex/server";
import { auth } from "./auth";
import { flutterwaveWebhook } from "./webhook";
// import { lemonSqueezyWebhook } from "./webhook";

const http = httpRouter();

// Register all Convex Auth HTTP routes (token refresh, sign-out, OAuth callbacks, etc.)
auth.addHttpRoutes(http);

http.route({
  path: "/flutterwave-webhook",
  method: "POST",
  handler: flutterwaveWebhook,
});

/*
http.route({
  path: "/lemon-squeezy-webhook",
  method: "POST",
  handler: lemonSqueezyWebhook,
});
*/

export default http;
