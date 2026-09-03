import { v } from "convex/values";
import { action, internalMutation, internalQuery, mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

// ─── FLUTTERWAVE CONFIG & HELPERS ──────────────────────────────────────────

const getFlutterwaveSecretKey = () => {
  const key = process.env.FLUTTERWAVE_SECRET_KEY;
  if (!key) throw new Error("Missing FLUTTERWAVE_SECRET_KEY");
  return key;
};

// ─── LEMON SQUEEZY CONFIGS (COMMENTED OUT) ─────────────────────────────────
/*
const getStoreApiKey = () => {
  const key = process.env.LEMON_SQUEEZY_API_KEY;
  if (!key) throw new Error("Missing LEMON_SQUEEZY_API_KEY");
  return key;
};
*/

// ─── ACTIONS ───────────────────────────────────────────────────────────────

// ─── FLUTTERWAVE ACTIONS ────────────────────────────────────────────────────

export const initializeOneTimeDonation = action({
  args: {
    currency: v.string(), // "USD" | "NGN"
    triggerContext: v.string(),
    amountMinor: v.number(), // cents or kobo
    spiritualSeason: v.optional(v.string()), // passed from frontend if available
    returnUrl: v.string(), // URL to return to after payment
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (args.currency === "USD" && args.amountMinor < 100) {
      throw new Error("USD minimum is $1.00");
    }
    if (args.currency === "NGN" && args.amountMinor < 100000) {
      throw new Error("NGN minimum is ₦1,000");
    }
    if (args.amountMinor <= 0) {
      throw new Error("Amount must be greater than zero");
    }

    const donationId: Id<"donations"> = await ctx.runMutation(
      internal.donations.createInitializedDonationFlutterwave,
      {
        userId: userId || undefined,
        currency: args.currency,
        amountMinor: args.amountMinor,
        donationType: "one_time",
        triggerContext: args.triggerContext,
        spiritualSeason: args.spiritualSeason,
      }
    );

    const userEmail = await ctx.runQuery(internal.donations.getUserEmail, { userId: userId || undefined });

    try {
      const response: Response = await fetch("https://api.flutterwave.com/v3/payments", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getFlutterwaveSecretKey()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tx_ref: donationId,
          amount: (args.amountMinor / 100).toString(),
          currency: args.currency,
          redirect_url: args.returnUrl,
          meta: {
            donationId: donationId,
            ...(userId ? { userId } : {}),
            ...(args.spiritualSeason ? { spiritualSeason: args.spiritualSeason } : {}),
          },
          customer: {
            email: userEmail || "anonymous@lampstand.com",
          },
          customizations: {
            title: "LampStand Support",
            description: "One-time donation to LampStand",
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Flutterwave API error: ${response.statusText}`);
      }

      const responseData = (await response.json()) as { data: { link: string } };
      const checkoutUrl: string = responseData.data.link;

      await ctx.runMutation(internal.donations.updateDonationCheckoutFlutterwave, {
        donationId,
        checkoutUrl,
      });

      return { checkoutUrl, donationId };
    } catch (error) {
      await ctx.runMutation(internal.donations.failDonationFlutterwave, {
        donationId,
        failureReason: "flw_checkout_failed",
      });
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error("Failed to generate checkout: " + errorMessage);
    }
  },
});

export const initializeMonthlyDonation = action({
  args: {
    tierKey: v.string(), // "tier_1", "tier_2", etc.
    triggerContext: v.string(),
    spiritualSeason: v.optional(v.string()),
    returnUrl: v.string(), // URL to return to after payment
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    const planData: { flutterwavePlanId: string; currency: string; amount: number; displayLabel: string } | null = await ctx.runQuery(
      internal.donations.getFlutterwaveSubscriptionPlan,
      { tierKey: args.tierKey }
    );
    
    if (!planData || !planData.flutterwavePlanId) {
      throw new Error("No subscription plan found for " + args.tierKey);
    }

    const amountMinor = Math.round(planData.amount * 100);

    const donationId: Id<"donations"> = await ctx.runMutation(
      internal.donations.createInitializedDonationFlutterwave,
      {
        userId: userId || undefined,
        currency: planData.currency,
        amountMinor,
        donationType: "monthly",
        triggerContext: args.triggerContext,
        spiritualSeason: args.spiritualSeason,
        flutterwavePlanId: planData.flutterwavePlanId,
      }
    );

    const userEmail = await ctx.runQuery(internal.donations.getUserEmail, { userId: userId || undefined });

    try {
      const response: Response = await fetch("https://api.flutterwave.com/v3/payments", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getFlutterwaveSecretKey()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tx_ref: donationId,
          amount: planData.amount.toString(),
          currency: planData.currency,
          payment_plan: planData.flutterwavePlanId,
          redirect_url: args.returnUrl,
          meta: {
            donationId: donationId,
            ...(userId ? { userId } : {}),
            ...(args.spiritualSeason ? { spiritualSeason: args.spiritualSeason } : {}),
          },
          customer: {
            email: userEmail || "anonymous@lampstand.com",
          },
          customizations: {
            title: "LampStand Support",
            description: `Monthly subscription - ${planData.displayLabel}`,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Flutterwave API error: ${response.statusText}`);
      }

      const responseData = (await response.json()) as { data: { link: string } };
      const checkoutUrl: string = responseData.data.link;

      await ctx.runMutation(internal.donations.updateDonationCheckoutFlutterwave, {
        donationId,
        checkoutUrl,
      });

      return { checkoutUrl, donationId };
    } catch (error) {
      await ctx.runMutation(internal.donations.failDonationFlutterwave, {
        donationId,
        failureReason: "flw_checkout_failed",
      });
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error("Failed to generate checkout: " + errorMessage);
    }
  },
});

export const verifyDonationByTransactionId = action({
  args: {
    transactionId: v.string(),
  },
  handler: async (ctx, args) => {
    const response = await fetch(`https://api.flutterwave.com/v3/transactions/${args.transactionId}/verify`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getFlutterwaveSecretKey()}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch transaction from Flutterwave");
    }

    const verificationData = await response.json();
    const status = verificationData.data?.status;
    const donationId = verificationData.data?.meta?.donationId || verificationData.data?.tx_ref;
    const paymentChannel = verificationData.data?.payment_type;

    if (status === "successful" && donationId) {
      await ctx.runMutation(internal.donations.completeDonationFlutterwave, {
        donationId: donationId as Id<"donations">,
        transactionId: args.transactionId,
        paymentChannel,
      });
      return { status: "completed" };
    }

    return { status: "pending" };
  },
});

export const cancelSubscription = action({
  args: { subscriptionId: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthenticated");

    const response = await fetch(`https://api.flutterwave.com/v3/subscriptions/${args.subscriptionId}/cancel`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${getFlutterwaveSecretKey()}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to cancel subscription on Flutterwave");
    }

    await ctx.runMutation(internal.donations.handleFlutterwaveSubscriptionCancelled, {
      subscriptionId: args.subscriptionId,
    });

    return { success: true };
  },
});

// ─── LEMON SQUEEZY ACTIONS (COMMENTED OUT) ─────────────────────────────────
/*
export const initializeOneTimeDonation = action({
  args: {
    currency: v.string(), // "USD" | "NGN"
    triggerContext: v.string(),
    amountMinor: v.number(), // cents or kobo
    spiritualSeason: v.optional(v.string()), // passed from frontend if available
    returnUrl: v.string(), // URL to return to after payment
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthenticated");

    if (args.currency === "USD" && args.amountMinor < 100) {
      throw new Error("USD minimum is $1.00");
    }
    if (args.currency === "NGN" && args.amountMinor < 100000) {
      throw new Error("NGN minimum is ₦1,000");
    }

    const variantData: { storeId: string; variantId: string } | null = await ctx.runQuery(internal.donations.getPwywVariant, {
      currency: args.currency,
    });
    
    if (!variantData) throw new Error("No PWYW variant found for " + args.currency);

    const donationId: Id<"donations"> = await ctx.runMutation(internal.donations.createInitializedDonation, {
      userId,
      currency: args.currency,
      amountMinor: args.amountMinor,
      donationType: "one_time",
      triggerContext: args.triggerContext,
      spiritualSeason: args.spiritualSeason,
      storeId: variantData.storeId,
      variantId: variantData.variantId,
    });

    try {
      const response: Response = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
        method: "POST",
        headers: {
          Accept: "application/vnd.api+json",
          "Content-Type": "application/vnd.api+json",
          Authorization: `Bearer ${getStoreApiKey()}`,
        },
        body: JSON.stringify({
          data: {
            type: "checkouts",
            attributes: {
              custom_price: args.amountMinor,
              product_options: {
                receipt_button_text: "Return to Lampstand",
                receipt_link_url: args.returnUrl,
                redirect_url: args.returnUrl,
              },
              checkout_data: {
                custom: {
                  donationId: donationId,
                  userId: userId,
                  ...(args.spiritualSeason ? { spiritualSeason: args.spiritualSeason } : {}),
                },
              },
            },
            relationships: {
              store: {
                data: {
                  type: "stores",
                  id: variantData.storeId,
                },
              },
              variant: {
                data: {
                  type: "variants",
                  id: variantData.variantId,
                },
              },
            },
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Lemon Squeezy API error: ${response.statusText}`);
      }

      const responseData: any = await response.json();
      const checkoutUrl: string = responseData.data.attributes.url;
      const checkoutId: string = responseData.data.id;

      await ctx.runMutation(internal.donations.updateDonationCheckout, {
        donationId,
        checkoutUrl,
        checkoutId,
      });

      return { checkoutUrl, donationId };
    } catch (error: any) {
      await ctx.runMutation(internal.donations.failDonation, {
        donationId,
        failureReason: "ls_checkout_failed",
      });
      throw new Error("Failed to generate checkout: " + error.message);
    }
  },
});

export const initializeMonthlyDonation = action({
  args: {
    storeId: v.string(),
    tierKey: v.string(),
    triggerContext: v.string(),
    spiritualSeason: v.optional(v.string()),
    returnUrl: v.string(), // URL to return to after payment
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthenticated");

    const variantData: { storeId: string; variantId: string; currency: string; amountMinor: number; } | null = await ctx.runQuery(internal.donations.getSubscriptionVariant, {
      storeId: args.storeId,
      tierKey: args.tierKey,
    });
    
    if (!variantData) throw new Error("No subscription variant found for " + args.tierKey);

    const donationId: Id<"donations"> = await ctx.runMutation(internal.donations.createInitializedDonation, {
      userId,
      currency: variantData.currency,
      amountMinor: variantData.amountMinor,
      donationType: "monthly",
      triggerContext: args.triggerContext,
      spiritualSeason: args.spiritualSeason,
      storeId: args.storeId,
      variantId: variantData.variantId,
    });

    try {
      const response: Response = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
        method: "POST",
        headers: {
          Accept: "application/vnd.api+json",
          "Content-Type": "application/vnd.api+json",
          Authorization: `Bearer ${getStoreApiKey()}`,
        },
        body: JSON.stringify({
          data: {
            type: "checkouts",
            attributes: {
              product_options: {
                receipt_button_text: "Return to Lampstand",
                receipt_link_url: args.returnUrl,
                redirect_url: args.returnUrl,
              },
              checkout_data: {
                custom: {
                  donationId: donationId,
                  userId: userId,
                  ...(args.spiritualSeason ? { spiritualSeason: args.spiritualSeason } : {}),
                },
              },
            },
            relationships: {
              store: {
                data: {
                  type: "stores",
                  id: args.storeId,
                },
              },
              variant: {
                data: {
                  type: "variants",
                  id: variantData.variantId,
                },
              },
            },
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Lemon Squeezy API error: ${response.statusText}`);
      }

      const responseData: any = await response.json();
      const checkoutUrl: string = responseData.data.attributes.url;
      const checkoutId: string = responseData.data.id;

      await ctx.runMutation(internal.donations.updateDonationCheckout, {
        donationId,
        checkoutUrl,
        checkoutId,
      });

      return { checkoutUrl, donationId };
    } catch (error: any) {
      await ctx.runMutation(internal.donations.failDonation, {
        donationId,
        failureReason: "ls_checkout_failed",
      });
      throw new Error("Failed to generate checkout: " + error.message);
    }
  },
});

export const verifyDonationByOrderId = action({
  args: {
    orderId: v.string(),
  },
  handler: async (ctx, args) => {
    const response = await fetch(`https://api.lemonsqueezy.com/v1/orders/${args.orderId}`, {
      method: "GET",
      headers: {
        Accept: "application/vnd.api+json",
        Authorization: `Bearer ${getStoreApiKey()}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch order from Lemon Squeezy");
    }

    const orderData = await response.json();
    const status = orderData.data.attributes.status;
    const donationId = orderData.data.attributes.first_order_item?.custom?.donationId;

    if (status === "paid" && donationId) {
      await ctx.runMutation(internal.donations.completeDonation, {
        donationId: donationId as any,
        orderId: args.orderId,
      });
      return { status: "completed" };
    }

    return { status: "pending" };
  },
});

export const getSubscriptionPortalUrl = action({
  args: { subscriptionId: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthenticated");

    const response = await fetch(`https://api.lemonsqueezy.com/v1/subscriptions/${args.subscriptionId}`, {
      headers: {
        Accept: "application/vnd.api+json",
        Authorization: `Bearer ${getStoreApiKey()}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch subscription from Lemon Squeezy");
    }

    const data = await response.json();
    const portalUrl = data.data.attributes.urls.customer_portal;
    return portalUrl as string;
  },
});
*/

// ─── MUTATIONS ─────────────────────────────────────────────────────────────

export const recordDonationSkip = mutation({
  args: {
    triggerContext: v.string(),
    spiritualSeason: v.optional(v.string()),
    pathDebriefQ1Response: v.optional(v.string()),
    pathId: v.optional(v.id("paths")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthenticated");

    await ctx.db.insert("donationSkips", {
      userId,
      pathId: args.pathId,
      triggerContext: args.triggerContext,
      spiritualSeason: args.spiritualSeason,
      pathDebriefQ1Response: args.pathDebriefQ1Response,
      skippedAt: Date.now(),
    });
  },
});

export const markStaleDonationsAbandoned = internalMutation({
  args: {},
  handler: async (ctx) => {
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    
    const staleDonations = await ctx.db
      .query("donations")
      .withIndex("by_status", (q) => q.eq("status", "initialized"))
      .take(100);

    let count = 0;
    for (const donation of staleDonations) {
      if (donation.initializedAt < oneDayAgo) {
        await ctx.db.patch(donation._id, {
          status: "abandoned",
        });
        count++;
      }
    }
    
    return { abandoned: count, hasMore: staleDonations.length === 100 };
  },
});

// ─── QUERIES ───────────────────────────────────────────────────────────────

export const getDonationConfig = query({
  args: {
    countryCode: v.optional(v.string()),
    currency: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const currency = args.currency || "USD";
    
    const plans = await ctx.db
      .query("flutterwavePlanMaps")
      .withIndex("by_currency_donationType", (q) => 
        q.eq("currency", currency)
      )
      .take(100);
      
    const activePlans = plans.filter(v => v.isActive);

    return {
      currency,
      variants: activePlans.map(p => ({
        storeId: "flutterwave", // client helper fallback
        tierKey: p.tierKey,
        donationType: p.donationType,
        amountMinor: Math.round(p.amount * 100),
        displayLabel: p.displayLabel,
      })),
    };
  },
});

export const getActiveSubscription = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const donations = await ctx.db
      .query("donations")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("donationType"), "monthly"))
      .order("desc")
      .collect();

    const activeSub = donations.find(
      d => d.status === "completed" && (d.flutterwaveSubscriptionId || d.lemonSqueezySubscriptionId)
    );
    
    if (!activeSub) return null;

    return {
      id: activeSub._id,
      amountMinor: activeSub.amountMinor,
      displayAmountLabel: activeSub.displayAmountLabel,
      subscriptionId: (activeSub.flutterwaveSubscriptionId || activeSub.lemonSqueezySubscriptionId)!,
      failureReason: activeSub.failureReason,
    };
  },
});

// ─── INTERNAL FLUTTERWAVE MUTATIONS & QUERIES ──────────────────────────────

export const getUserEmail = internalQuery({
  args: { userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    if (!args.userId) return "";
    const user = await ctx.db.get(args.userId);
    return user?.email || "";
  },
});

export const getFlutterwavePwywPlan = internalQuery({
  args: { currency: v.string() },
  handler: async (ctx, args) => {
    const plans = await ctx.db
      .query("flutterwavePlanMaps")
      .withIndex("by_currency_donationType", (q) => 
        q.eq("currency", args.currency).eq("donationType", "one_time")
      )
      .take(100);
      
    const active = plans.find(p => p.isActive);
    if (!active) return null;
    return {
      amount: active.amount,
      displayLabel: active.displayLabel,
    };
  }
});

export const getFlutterwaveSubscriptionPlan = internalQuery({
  args: { tierKey: v.string() },
  handler: async (ctx, args) => {
    const plan = await ctx.db
      .query("flutterwavePlanMaps")
      .withIndex("by_tierKey", (q) => 
        q.eq("tierKey", args.tierKey)
      )
      .first();
      
    if (!plan || !plan.isActive) return null;
    
    return {
      flutterwavePlanId: plan.flutterwavePlanId || "",
      currency: plan.currency,
      amount: plan.amount,
      displayLabel: plan.displayLabel,
    };
  }
});

export const createInitializedDonationFlutterwave = internalMutation({
  args: {
    userId: v.optional(v.id("users")),
    currency: v.string(),
    amountMinor: v.number(),
    donationType: v.string(),
    triggerContext: v.string(),
    spiritualSeason: v.optional(v.string()),
    flutterwavePlanId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let formatted = `${args.currency} ${(args.amountMinor / 100).toLocaleString()}`;
    if (args.currency === "USD") {
      formatted = `$${(args.amountMinor / 100).toFixed(2)}`;
    } else if (args.currency === "NGN") {
      formatted = `₦${(args.amountMinor / 100).toLocaleString()}`;
    } else if (args.currency === "GBP") {
      formatted = `£${(args.amountMinor / 100).toLocaleString()}`;
    } else if (args.currency === "EUR") {
      formatted = `€${(args.amountMinor / 100).toLocaleString()}`;
    } else if (args.currency === "CAD") {
      formatted = `C$${(args.amountMinor / 100).toLocaleString()}`;
    } else if (args.currency === "AUD") {
      formatted = `A$${(args.amountMinor / 100).toLocaleString()}`;
    } else if (args.currency === "JPY") {
      formatted = `¥${(args.amountMinor / 100).toLocaleString()}`;
    }
      
    return await ctx.db.insert("donations", {
      userId: args.userId,
      triggerContext: args.triggerContext,
      currency: args.currency,
      amountMinor: args.amountMinor,
      donationType: args.donationType,
      displayAmountLabel: formatted,
      spiritualSeason: args.spiritualSeason,
      provider: "flutterwave",
      flutterwavePlanId: args.flutterwavePlanId,
      status: "initialized",
      initializedAt: Date.now(),
    });
  }
});

export const updateDonationCheckoutFlutterwave = internalMutation({
  args: {
    donationId: v.id("donations"),
    checkoutUrl: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.donationId, {
      flutterwaveCheckoutUrl: args.checkoutUrl,
    });
  }
});

export const failDonationFlutterwave = internalMutation({
  args: {
    donationId: v.id("donations"),
    failureReason: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.donationId, {
      status: "failed",
      failureReason: args.failureReason,
    });
  }
});

export const completeDonationFlutterwave = internalMutation({
  args: {
    donationId: v.id("donations"),
    transactionId: v.string(),
    paymentChannel: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.donationId, {
      status: "completed",
      flutterwaveTransactionId: args.transactionId,
      paymentChannel: args.paymentChannel,
      verifiedAt: Date.now(),
    });
  }
});

export const handleFlutterwavePaymentCompleted = internalMutation({
  args: { 
    donationId: v.id("donations"), 
    transactionId: v.string(), 
    paymentPlanId: v.optional(v.string()),
    flutterwaveSubscriptionId: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const donation = await ctx.db.get(args.donationId);
    if (!donation) return;
    
    const now = Date.now();
    await ctx.db.patch(args.donationId, {
      status: "completed",
      flutterwaveTransactionId: args.transactionId,
      flutterwaveSubscriptionId: args.flutterwaveSubscriptionId,
      verifiedAt: now,
      lastWebhookEventAt: now,
    });
  }
});

export const handleFlutterwaveSubscriptionCancelled = internalMutation({
  args: { 
    subscriptionId: v.string(), 
  },
  handler: async (ctx, args) => {
    const donation = await ctx.db
      .query("donations")
      .withIndex("by_flutterwaveSubscriptionId", q => q.eq("flutterwaveSubscriptionId", args.subscriptionId))
      .first();

    if (!donation) {
      console.error("Donation not found for subscription cancellation", args.subscriptionId);
      return;
    }
    
    await ctx.db.patch(donation._id, {
      status: "cancelled",
      lastWebhookEventAt: Date.now(),
    });
  }
});

// ─── INTERNAL LEMON SQUEEZY MUTATIONS & QUERIES (COMMENTED OUT) ───────────
/*
export const getPwywVariant = internalQuery({
  args: { currency: v.string() },
  handler: async (ctx, args) => {
    const variants = await ctx.db
      .query("lemonSqueezyVariantMaps")
      .withIndex("by_currency_donationType", (q) => 
        q.eq("currency", args.currency).eq("donationType", "one_time")
      )
      .take(100);
      
    const active = variants.find(v => v.isActive);
    if (!active) return null;
    return {
      storeId: active.storeId,
      variantId: active.lemonSqueezyVariantId,
    };
  }
});

export const getSubscriptionVariant = internalQuery({
  args: { storeId: v.string(), tierKey: v.string() },
  handler: async (ctx, args) => {
    const variant = await ctx.db
      .query("lemonSqueezyVariantMaps")
      .withIndex("by_storeId_tierKey", (q) => 
        q.eq("storeId", args.storeId).eq("tierKey", args.tierKey)
      )
      .first();
      
    if (!variant || !variant.isActive) return null;
    
    return {
      storeId: variant.storeId,
      variantId: variant.lemonSqueezyVariantId,
      currency: variant.currency,
      amountMinor: variant.amountMinor,
    };
  }
});

export const createInitializedDonation = internalMutation({
  args: {
    userId: v.id("users"),
    currency: v.string(),
    amountMinor: v.number(),
    donationType: v.string(),
    triggerContext: v.string(),
    spiritualSeason: v.optional(v.string()),
    storeId: v.string(),
    variantId: v.string(),
  },
  handler: async (ctx, args) => {
    const formatted = args.currency === "USD" 
      ? `$${(args.amountMinor / 100).toFixed(2)}` 
      : `₦${(args.amountMinor / 100).toLocaleString()}`;
      
    return await ctx.db.insert("donations", {
      userId: args.userId,
      triggerContext: args.triggerContext,
      currency: args.currency,
      amountMinor: args.amountMinor,
      donationType: args.donationType,
      displayAmountLabel: formatted,
      spiritualSeason: args.spiritualSeason,
      provider: "lemon_squeezy",
      lemonSqueezyStoreId: args.storeId,
      lemonSqueezyVariantId: args.variantId,
      lemonSqueezyCheckoutId: "", 
      status: "initialized",
      initializedAt: Date.now(),
    });
  }
});

export const updateDonationCheckout = internalMutation({
  args: {
    donationId: v.id("donations"),
    checkoutUrl: v.string(),
    checkoutId: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.donationId, {
      lemonSqueezyCheckoutUrl: args.checkoutUrl,
      lemonSqueezyCheckoutId: args.checkoutId,
    });
  }
});

export const failDonation = internalMutation({
  args: {
    donationId: v.id("donations"),
    failureReason: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.donationId, {
      status: "failed",
      failureReason: args.failureReason,
    });
  }
});

export const completeDonation = internalMutation({
  args: {
    donationId: v.id("donations"),
    orderId: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.donationId, {
      status: "completed",
      lemonSqueezyOrderId: args.orderId,
      verifiedAt: Date.now(),
    });
  }
});

export const handleOrderCreated = internalMutation({
  args: { donationId: v.id("donations"), orderId: v.string(), isPaid: v.boolean() },
  handler: async (ctx, args) => {
    const donation = await ctx.db.get(args.donationId);
    if (!donation) return;
    
    const newStatus = args.isPaid || donation.status === "completed" ? "completed" : "pending_verification";
    const now = Date.now();
    
    await ctx.db.patch(args.donationId, {
      status: newStatus,
      lemonSqueezyOrderId: args.orderId,
      ...(args.isPaid && donation.status !== "completed" ? { verifiedAt: now } : {}),
      lastWebhookEventAt: now,
    });
  }
});

export const handleSubscriptionUpdated = internalMutation({
  args: { 
    donationId: v.optional(v.id("donations")), 
    subscriptionId: v.string(), 
    status: v.string() 
  },
  handler: async (ctx, args) => {
    let donation = await ctx.db
      .query("donations")
      .withIndex("by_subscriptionId", q => q.eq("lemonSqueezySubscriptionId", args.subscriptionId))
      .first();

    if (!donation && args.donationId) {
      donation = await ctx.db.get(args.donationId);
    }

    if (!donation) {
      console.error("Donation not found for subscription update", args.subscriptionId);
      return;
    }
    
    let newStatus = donation.status;
    if (args.status === "active" || args.status === "past_due") {
      newStatus = "completed";
    } else if (args.status === "cancelled" || args.status === "expired" || args.status === "unpaid") {
      newStatus = "cancelled";
    } else if (donation.status !== "completed") {
      newStatus = "pending_verification";
    }
    
    await ctx.db.patch(donation._id, {
      lemonSqueezySubscriptionId: args.subscriptionId,
      status: newStatus,
      lastWebhookEventAt: Date.now(),
    });
  }
});

export const handleSubscriptionFailed = internalMutation({
  args: { subscriptionId: v.string() },
  handler: async (ctx, args) => {
    const donation = await ctx.db
      .query("donations")
      .withIndex("by_subscriptionId", q => q.eq("lemonSqueezySubscriptionId", args.subscriptionId))
      .first();
      
    if (!donation) return;
    
    await ctx.db.patch(donation._id, {
      failureReason: "subscription_payment_failed",
      lastWebhookEventAt: Date.now(),
    });
  }
});
*/
