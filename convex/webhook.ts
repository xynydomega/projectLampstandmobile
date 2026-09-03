import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

// ─── FLUTTERWAVE WEBHOOK ───────────────────────────────────────────────────

export const flutterwaveWebhook = httpAction(async (ctx, req) => {
  const signature = req.headers.get("verif-hash");
  const secretHash = process.env.FLUTTERWAVE_WEBHOOK_SECRET;

  if (!secretHash) {
    console.error("Missing FLUTTERWAVE_WEBHOOK_SECRET environment variable");
    return new Response("Webhook secret not configured", { status: 500 });
  }

  if (!signature || signature !== secretHash) {
    return new Response("Invalid signature", { status: 401 });
  }

  const rawBodyBuffer = await req.arrayBuffer();
  const rawBody = new TextDecoder().decode(rawBodyBuffer);
  
  let body;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const event = body.event;
  const data = body.data;

  if (!event || !data) {
    return new Response("Malformed payload", { status: 400 });
  }

  try {
    if (event === "charge.completed") {
      const status = data.status;
      const donationId = data.meta?.donationId || data.tx_ref;
      const transactionId = data.id?.toString();
      const paymentPlanId = data.payment_plan?.toString();
      // Flutterwave occasionally attaches subscription reference in different fields depending on webhook version
      const subscriptionId = data.subscription?.toString() || data.meta?.subscriptionId;

      if (status === "successful" && donationId) {
        await ctx.runMutation(internal.donations.handleFlutterwavePaymentCompleted, {
          donationId: donationId as Id<"donations">,
          transactionId: transactionId,
          paymentPlanId: paymentPlanId,
          flutterwaveSubscriptionId: subscriptionId,
        });
      }
    } else if (event === "subscription.cancelled") {
      const subscriptionId = data.id?.toString() || data.subscription_id?.toString();
      
      if (subscriptionId) {
        await ctx.runMutation(internal.donations.handleFlutterwaveSubscriptionCancelled, {
          subscriptionId: subscriptionId,
        });
      }
    }
  } catch (error) {
    // Log errors but return 200 to acknowledge receipt and prevent Flutterwave from retrying endlessly
    console.error("Error processing Flutterwave webhook:", error);
  }

  return new Response("OK", { status: 200 });
});

// ─── LEMON SQUEEZY WEBHOOK (COMMENTED OUT) ─────────────────────────────────
/*
export const lemonSqueezyWebhook = httpAction(async (ctx, req) => {
  const signature = req.headers.get("X-Signature");
  if (!signature) {
    return new Response("Missing signature", { status: 400 });
  }

  const rawBodyBuffer = await req.arrayBuffer();
  const rawBody = new TextDecoder().decode(rawBodyBuffer);
  let body;
  try {
    body = JSON.parse(rawBody);
  } catch (e) {
    return new Response("Invalid JSON", { status: 400 });
  }

  let isValid = false;
  const secrets = [
    process.env.LEMON_SQUEEZY_WEBHOOK_SECRET_USD,
    process.env.LEMON_SQUEEZY_WEBHOOK_SECRET_NGN
  ];

  const encoder = new TextEncoder();

  for (const s of secrets) {
    if (!s) continue;
    
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(s),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    
    const signatureBytes = await crypto.subtle.sign(
      "HMAC",
      key,
      rawBodyBuffer
    );
    
    const digestHex = Array.from(new Uint8Array(signatureBytes))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");
      
    if (digestHex === signature) {
      isValid = true;
      break;
    }
  }

  if (!isValid) {
    return new Response("Invalid signature", { status: 400 });
  }

  const eventName = body.meta?.event_name;
  const donationId = body.meta?.custom_data?.donationId;

  try {
    if (eventName === "order_created" || eventName === "order_updated") {
      const status = body.data?.attributes?.status;
      const orderId = body.data?.id;
      if (donationId) {
        await ctx.runMutation(internal.donations.handleOrderCreated, {
          donationId: donationId as any,
          orderId: orderId.toString(),
          isPaid: status === "paid",
        });
      }
    } else if (
      eventName === "subscription_created" || 
      eventName === "subscription_updated" ||
      eventName === "subscription_cancelled" ||
      eventName === "subscription_expired"
    ) {
      const status = body.data?.attributes?.status;
      const subscriptionId = body.data?.id;
      if (donationId || subscriptionId) {
        await ctx.runMutation(internal.donations.handleSubscriptionUpdated, {
          donationId: donationId ? (donationId as any) : undefined,
          subscriptionId: subscriptionId.toString(),
          status: status,
        });
      }
    } else if (eventName === "subscription_payment_failed") {
      const subscriptionId = body.data?.attributes?.subscription_id;
      if (subscriptionId) {
        await ctx.runMutation(internal.donations.handleSubscriptionFailed, {
          subscriptionId: subscriptionId.toString(),
        });
      }
    }
  } catch (e) {
    // Log but still return 200 so Lemon Squeezy does not retry indefinitely
    console.error("Webhook handler error:", e);
  }

  return new Response("OK", { status: 200 });
});
*/
