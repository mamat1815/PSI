import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const aspirationRouter = createTRPCRouter({
  submit: protectedProcedure
    .input(z.object({
      category: z.string().min(1, "Kategori harus dipilih"),
      content: z.string().min(10, "Aspirasi minimal 10 karakter"),
      organizerId: z.string().min(1, "Organisasi tujuan harus dipilih"),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "Mahasiswa") {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      // Verify that the organizerId exists
      const organization = await ctx.db.organisasi.findFirst({
        where: { id: input.organizerId }
      });

      if (!organization) {
        throw new TRPCError({ 
          code: "NOT_FOUND", 
          message: "Organisasi tidak ditemukan" 
        });
      }

      return ctx.db.aspirasi.create({
        data: {
          category: input.category,
          content: input.content,
          userId: ctx.session.user.id,
          organizerId: input.organizerId,
          status: "PENDING",
        },
      });
    }),

  // Get aspirations for current user
  getMyAspirations: protectedProcedure
    .query(async ({ ctx }) => {
      if (ctx.session.user.role !== "Mahasiswa") {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      return ctx.db.aspirasi.findMany({
        where: { userId: ctx.session.user.id },
        include: {
          organizer: {
            select: {
              name: true,
            }
          }
        },
        orderBy: { createdAt: "desc" },
      });
    }),

  // Get aspirations for an organization
  getForOrganization: protectedProcedure
    .query(async ({ ctx }) => {
      if (ctx.session.user.role !== "Organisasi") {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      return ctx.db.aspirasi.findMany({
        where: { organizerId: ctx.session.user.id },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            }
          }
        },
        orderBy: { createdAt: "desc" },
      });
    }),

  // Respond to aspiration (for organizations)
  respond: protectedProcedure
    .input(z.object({
      aspirationId: z.string(),
      response: z.string().min(1, "Respons tidak boleh kosong"),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "Organisasi") {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const aspiration = await ctx.db.aspirasi.findFirst({
        where: { 
          id: input.aspirationId,
          organizerId: ctx.session.user.id 
        }
      });

      if (!aspiration) {
        throw new TRPCError({ 
          code: "NOT_FOUND", 
          message: "Aspirasi tidak ditemukan" 
        });
      }

      return ctx.db.aspirasi.update({
        where: { id: input.aspirationId },
        data: {
          status: "RESPONDED",
          response: input.response,
          updatedAt: new Date(),
        },
      });
    }),
});