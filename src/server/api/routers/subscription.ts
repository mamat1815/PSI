import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { env } from "~/env.js";

// Midtrans configuration
const midtransClient = require('midtrans-client');

let snap: any = null;

// Only initialize Midtrans if credentials are available
if (env.MIDTRANS_SERVER_KEY && env.MIDTRANS_CLIENT_KEY && 
    env.MIDTRANS_SERVER_KEY !== "SB-Mid-server-temp" && 
    env.MIDTRANS_CLIENT_KEY !== "SB-Mid-client-temp") {
  snap = new midtransClient.Snap({
    isProduction: env.MIDTRANS_IS_PRODUCTION || false,
    serverKey: env.MIDTRANS_SERVER_KEY,
    clientKey: env.MIDTRANS_CLIENT_KEY,
  });
}

export const subscriptionRouter = createTRPCRouter({
  // Get current subscription status
  getCurrentSubscription: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const { user } = ctx.session;
        
        // Only for organizations
        if (user.role !== "Organisasi") {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Only organizations can have subscriptions"
          });
        }

        const organization = await ctx.db.organisasi.findUnique({
          where: { email: user.email! },
          include: {
            subscriptions: {
              where: { isActive: true },
              orderBy: { createdAt: 'desc' },
              take: 1
            }
          }
        });

        if (!organization) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Organization not found"
          });
        }

        return {
          currentPlan: organization.subscriptionPlan,
          subscriptionExpiry: organization.subscriptionExpiry,
          isActive: organization.subscriptions.length > 0 && 
                   organization.subscriptions[0]?.endDate > new Date(),
          subscription: organization.subscriptions[0] || null
        };

      } catch (error) {
        console.error("Error getting subscription:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get subscription status"
        });
      }
    }),

  // Create payment for PRO subscription
  createProSubscription: protectedProcedure
    .input(z.object({
      months: z.number().min(1).max(12).default(1)
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const { user } = ctx.session;
        
        if (user.role !== "Organisasi") {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Only organizations can subscribe to PRO"
          });
        }

        const organization = await ctx.db.organisasi.findUnique({
          where: { email: user.email! }
        });

        if (!organization) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Organization not found"
          });
        }

        // Check if already has active PRO subscription
        const activeSubscription = await ctx.db.subscription.findFirst({
          where: {
            organizationId: organization.id,
            isActive: true,
            endDate: { gt: new Date() }
          }
        });

        if (activeSubscription) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Organization already has an active PRO subscription"
          });
        }

        // Price calculation (in IDR)
        const pricePerMonth = 99000; // 99k IDR per month
        const totalAmount = pricePerMonth * input.months;
        const orderId = `UACAD-PRO-${organization.id}-${Date.now()}`;

        // Create payment record
        const payment = await ctx.db.payment.create({
          data: {
            amount: totalAmount,
            currency: "IDR",
            status: "PENDING",
            midtransOrderId: orderId,
            organizationId: organization.id
          }
        });

        // Midtrans transaction details
        const parameter = {
          transaction_details: {
            order_id: orderId,
            gross_amount: totalAmount
          },
          credit_card: {
            secure: true
          },
          customer_details: {
            first_name: organization.name,
            email: organization.email,
            phone: organization.contact || ""
          },
          item_details: [{
            id: "PRO_SUBSCRIPTION",
            price: pricePerMonth,
            quantity: input.months,
            name: `UACAD PRO Subscription - ${input.months} Month${input.months > 1 ? 's' : ''}`
          }],
          callbacks: {
            finish: `${process.env.NEXTAUTH_URL}/subscription/success`
          }
        };

        // Create Midtrans transaction
        if (!snap) {
          // Development mode - create a simulated payment
          console.log("⚠️ Development Mode: Midtrans not configured, creating simulated payment");
          
          // In development, we'll create a simulated payment that can be manually confirmed
          return {
            paymentId: payment.id,
            snapRedirectUrl: null,
            simulatedPayment: true,
            message: "Development mode: Payment created successfully. Use Super Admin to confirm payment manually.",
            orderId: payment.midtransOrderId
          };
        }

        const transaction = await snap.createTransaction(parameter);

        return {
          paymentId: payment.id,
          snapToken: transaction.token,
          snapRedirectUrl: transaction.redirect_url,
          amount: totalAmount,
          months: input.months
        };

      } catch (error) {
        console.error("Error creating PRO subscription:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create subscription payment"
        });
      }
    }),

  // Handle payment callback from Midtrans
  handlePaymentCallback: protectedProcedure
    .input(z.object({
      orderId: z.string(),
      transactionStatus: z.string(),
      transactionId: z.string().optional(),
      paymentType: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const payment = await ctx.db.payment.findUnique({
          where: { midtransOrderId: input.orderId },
          include: { organization: true }
        });

        if (!payment) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Payment not found"
          });
        }

        let paymentStatus: "PENDING" | "PAID" | "FAILED" | "EXPIRED" = "PENDING";
        
        switch (input.transactionStatus) {
          case "capture":
          case "settlement":
            paymentStatus = "PAID";
            break;
          case "pending":
            paymentStatus = "PENDING";
            break;
          case "deny":
          case "cancel":
          case "failure":
            paymentStatus = "FAILED";
            break;
          case "expire":
            paymentStatus = "EXPIRED";
            break;
        }

        // Update payment status
        await ctx.db.payment.update({
          where: { id: payment.id },
          data: {
            status: paymentStatus,
            midtransTransactionId: input.transactionId,
            paymentMethod: input.paymentType,
            paidAt: paymentStatus === "PAID" ? new Date() : null
          }
        });

        // If payment is successful, create/update subscription
        if (paymentStatus === "PAID") {
          const months = Math.floor(payment.amount / 99000); // Calculate months based on amount
          const startDate = new Date();
          const endDate = new Date();
          endDate.setMonth(endDate.getMonth() + months);

          // Create subscription
          const subscription = await ctx.db.subscription.create({
            data: {
              plan: "PRO",
              startDate,
              endDate,
              isActive: true,
              organizationId: payment.organizationId
            }
          });

          // Update payment with subscription reference
          await ctx.db.payment.update({
            where: { id: payment.id },
            data: { subscriptionId: subscription.id }
          });

          // Update organization subscription status
          await ctx.db.organisasi.update({
            where: { id: payment.organizationId },
            data: {
              subscriptionPlan: "PRO",
              subscriptionExpiry: endDate
            }
          });
        }

        return { success: true, status: paymentStatus };

      } catch (error) {
        console.error("Error handling payment callback:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to process payment callback"
        });
      }
    }),

  // Get subscription plans and pricing
  getSubscriptionPlans: protectedProcedure
    .query(async () => {
      return {
        plans: [
          {
            id: "FREE",
            name: "Free Plan",
            price: 0,
            currency: "IDR",
            features: [
              "Rekomendasi berdasarkan minat dasar",
              "Analisis event standar",
              "Maksimal 5 event per bulan",
              "Support komunitas"
            ],
            limitations: [
              "Tidak ada rekomendasi AI otomatis",
              "Analisis terbatas",
              "Fitur analytics dasar"
            ]
          },
          {
            id: "PRO",
            name: "Pro Plan",
            price: 99000,
            currency: "IDR",
            period: "month",
            features: [
              "🤖 Rekomendasi Event Otomatis berbasis AI",
              "📊 Analisis Lanjutan per Event",
              "👁️ Tracking Views & Engagement",
              "📈 Analytics seperti Instagram Insights",
              "🎯 Targeting audience berdasarkan aspirasi",
              "📱 Real-time feedback analysis",
              "📧 Email marketing integration",
              "🔄 Unlimited events",
              "⚡ Priority support"
            ],
            popular: true
          }
        ]
      };
    }),

  // Cancel subscription
  cancelSubscription: protectedProcedure
    .mutation(async ({ ctx }) => {
      try {
        const { user } = ctx.session;
        
        if (user.role !== "Organisasi") {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Only organizations can cancel subscriptions"
          });
        }

        const organization = await ctx.db.organisasi.findUnique({
          where: { email: user.email! }
        });

        if (!organization) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Organization not found"
          });
        }

        // Deactivate current subscription
        await ctx.db.subscription.updateMany({
          where: {
            organizationId: organization.id,
            isActive: true
          },
          data: {
            isActive: false,
            endDate: new Date() // End immediately
          }
        });

        // Update organization to FREE plan
        await ctx.db.organisasi.update({
          where: { id: organization.id },
          data: {
            subscriptionPlan: "FREE",
            subscriptionExpiry: null
          }
        });

        return { success: true };

      } catch (error) {
        console.error("Error canceling subscription:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to cancel subscription"
        });
      }
    })
});
