import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const aspirationRouter = createTRPCRouter({
  submit: protectedProcedure
    .input(z.object({
      category: z.string().min(1, "Kategori harus dipilih"),
      content: z.string().min(10, "Aspirasi minimal 10 karakter"),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "Mahasiswa") {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      return ctx.db.aspirasi.create({
        data: {
          category: input.category,
          content: input.content,
          userId: ctx.session.user.id,
        },
      });
    }),
});