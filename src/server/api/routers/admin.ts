import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";

// Helper function to verify SuperAdmin role
async function requireSuperAdmin(ctx: any) {
  if (!ctx.session?.user || ctx.session.user.role !== "SuperAdmin") {
    throw new TRPCError({
      code: "UNAUTHORIZED", 
      message: "Only SuperAdmin can access this resource"
    });
  }
  return ctx.session.user;
}

export const adminRouter = createTRPCRouter({
  getDashboardStats: protectedProcedure
    .query(async ({ ctx }) => {
      await requireSuperAdmin(ctx);

      // Get current date info
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      // Get total organizations
      const totalOrganizations = await ctx.db.organisasi.count();

      // Get PRO subscriptions count
      const proSubscriptions = await ctx.db.organisasi.count({
        where: {
          subscriptionPlan: "PRO",
          subscriptionExpiry: {
            gte: new Date()
          }
        }
      });

      // Get monthly revenue
      const monthlyPayments = await ctx.db.payment.findMany({
        where: {
          status: "PAID",
          createdAt: {
            gte: startOfMonth,
            lte: endOfMonth
          }
        }
      });

      const monthlyRevenue = monthlyPayments.reduce((sum, payment) => {
        return sum + payment.amount;
      }, 0);

      // Get pending payments
      const pendingPayments = await ctx.db.payment.count({
        where: {
          status: "PENDING"
        }
      });

      return {
        totalOrganizations,
        proSubscriptions,
        monthlyRevenue,
        pendingPayments
      };
    }),

  getRecentPayments: protectedProcedure
    .query(async ({ ctx }) => {
      await requireSuperAdmin(ctx);

      const payments = await ctx.db.payment.findMany({
        take: 10,
        orderBy: {
          createdAt: "desc"
        },
        include: {
          organization: {
            select: {
              name: true
            }
          },
          subscription: true
        }
      });

      return payments.map(payment => ({
        id: payment.id,
        organizationName: payment.organization.name,
        amount: payment.amount,
        duration: payment.subscription ? 
          Math.round((new Date(payment.subscription.endDate).getTime() - new Date(payment.subscription.startDate).getTime()) / (1000 * 60 * 60 * 24 * 30)) : 1,
        status: payment.status,
        createdAt: payment.createdAt,
        midtransOrderId: payment.midtransOrderId
      }));
    }),

  getPaymentDetails: protectedProcedure
    .input(z.object({
      paymentId: z.string()
    }))
    .query(async ({ input, ctx }) => {
      await requireSuperAdmin(ctx);

      const payment = await ctx.db.payment.findUnique({
        where: { id: input.paymentId },
        include: {
          organization: true,
          subscription: true
        }
      });

      if (!payment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Payment not found"
        });
      }

      return payment;
    }),

  confirmPayment: protectedProcedure
    .input(z.object({
      paymentId: z.string()
    }))
    .mutation(async ({ input, ctx }) => {
      await requireSuperAdmin(ctx);

      const payment = await ctx.db.payment.findUnique({
        where: { id: input.paymentId },
        include: { 
          organization: true,
          subscription: true
        }
      });

      if (!payment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Payment not found"
        });
      }

      if (payment.status === "PAID") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Payment already confirmed"
        });
      }

      // Calculate subscription expiry
      const currentExpiry = payment.organization.subscriptionExpiry || new Date();
      const newExpiry = new Date(Math.max(currentExpiry.getTime(), Date.now()));
      
      // If there's a subscription, use its duration, otherwise default to 1 month
      const duration = payment.subscription ? 
        Math.round((new Date(payment.subscription.endDate).getTime() - new Date(payment.subscription.startDate).getTime()) / (1000 * 60 * 60 * 24 * 30)) : 1;
      
      newExpiry.setMonth(newExpiry.getMonth() + duration);

      // Update payment and organization
      await ctx.db.$transaction([
        ctx.db.payment.update({
          where: { id: input.paymentId },
          data: { 
            status: "PAID",
            paidAt: new Date()
          }
        }),
        ctx.db.organisasi.update({
          where: { id: payment.organizationId },
          data: {
            subscriptionPlan: "PRO",
            subscriptionExpiry: newExpiry
          }
        })
      ]);

      return { success: true, message: "Payment confirmed successfully" };
    }),

  getAllOrganizations: protectedProcedure
    .input(z.object({
      page: z.number().default(1),
      limit: z.number().default(20),
      search: z.string().optional()
    }))
    .query(async ({ input, ctx }) => {
      await requireSuperAdmin(ctx);

      const { page, limit, search } = input;
      const skip = (page - 1) * limit;

      const where = search ? {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } }
        ]
      } : {};

      const [organizations, total] = await Promise.all([
        ctx.db.organisasi.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            name: true,
            email: true,
            subscriptionPlan: true,
            subscriptionExpiry: true,
            createdAt: true,
            _count: {
              select: {
                payments: true,
                events: true
              }
            }
          }
        }),
        ctx.db.organisasi.count({ where })
      ]);

      return {
        organizations,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page
      };
    }),

  getPaymentHistory: protectedProcedure
    .input(z.object({
      page: z.number().default(1),
      limit: z.number().default(20),
      status: z.enum(["PENDING", "PAID", "FAILED", "EXPIRED"]).optional(),
      organizationId: z.string().optional()
    }))
    .query(async ({ input, ctx }) => {
      await requireSuperAdmin(ctx);

      const { page, limit, status, organizationId } = input;
      const skip = (page - 1) * limit;

      const where: any = {};
      if (status) where.status = status;
      if (organizationId) where.organizationId = organizationId;

      const [payments, total] = await Promise.all([
        ctx.db.payment.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          include: {
            organization: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }),
        ctx.db.payment.count({ where })
      ]);

      return {
        payments,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page
      };
    }),

  getSystemStats: protectedProcedure
    .query(async ({ ctx }) => {
      await requireSuperAdmin(ctx);

      const [
        totalOrganizations,
        totalUsers,
        totalEvents,
        totalAspirations,
        revenueThisMonth,
        revenueLastMonth
      ] = await Promise.all([
        ctx.db.organisasi.count(),
        ctx.db.user.count(),
        ctx.db.event.count(),
        ctx.db.aspirasi.count(),
        ctx.db.payment.aggregate({
          where: {
            status: "PAID",
            createdAt: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            }
          },
          _sum: { amount: true }
        }),
        ctx.db.payment.aggregate({
          where: {
            status: "PAID",
            createdAt: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
              lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            }
          },
          _sum: { amount: true }
        })
      ]);

      const currentRevenue = revenueThisMonth._sum?.amount || 0;
      const lastRevenue = revenueLastMonth._sum?.amount || 0;
      const revenueGrowth = lastRevenue > 0 
        ? ((currentRevenue - lastRevenue) / lastRevenue) * 100 
        : currentRevenue > 0 ? 100 : 0;

      return {
        totalOrganizations,
        totalUsers,
        totalEvents,
        totalAspirations,
        currentRevenue,
        revenueGrowth: Math.round(revenueGrowth * 100) / 100
      };
    })
});
