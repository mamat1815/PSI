import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const userRouter = createTRPCRouter({
  getSkills: protectedProcedure.query(({ ctx }) => {
    if (ctx.session.user.role !== "Mahasiswa") {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: { skills: { select: { name: true } } }
    });
  }),
});
