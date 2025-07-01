import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const skillRouter = createTRPCRouter({
  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.db.skill.findMany({ orderBy: { name: 'asc' } });
  }),
  create: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.skill.upsert({
        where: { name: input.name },
        update: {},
        create: { name: input.name },
      });
    }),
});
