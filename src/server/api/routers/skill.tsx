// src/server/api/routers/skill.ts
import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";

export const skillRouter = createTRPCRouter({
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.db.skill.findMany({
      orderBy: { name: 'asc' },
    });
  }),
  create: publicProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      // Menggunakan upsert untuk membuat skill jika belum ada, atau mengabaikannya jika sudah ada.
      return ctx.db.skill.upsert({
        where: { name: input.name },
        update: {},
        create: { name: input.name },
      });
    }),
});
