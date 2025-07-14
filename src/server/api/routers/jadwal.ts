// src/server/api/routers/jadwal.ts
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const jadwalRouter = createTRPCRouter({
  getMine: protectedProcedure.query(({ ctx }) => {
    // Pastikan hanya mahasiswa yang bisa mengakses jadwal mereka sendiri
    if (ctx.session.user.role !== "Mahasiswa") {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return ctx.db.jadwalKuliah.findMany({
      where: {
        userId: ctx.session.user.id,
      },
      // Urutkan berdasarkan hari dan jam mulai jika diperlukan
      // orderBy: [{ hari: 'asc' }, { jamMulai: 'asc' }],
    });
  }),
});