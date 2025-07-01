// src/server/api/routers/auth.ts
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";

// Fungsi pembantu untuk mencari kunci secara case-insensitive
const findKey = (obj: Record<string, any>, targetKey: string): string | undefined => {
    const lowerTarget = targetKey.toLowerCase();
    return Object.keys(obj).find(k => k.trim().toLowerCase() === lowerTarget);
};

export const authRouter = createTRPCRouter({
  registerMahasiswa: publicProcedure
    .input(z.object({
        name: z.string().min(3, "Nama minimal 3 karakter"),
        nim: z.string().min(8, "NIM minimal 8 karakter"),
        email: z.string().email("Format email tidak valid"),
        password: z.string().min(8, "Password minimal 8 karakter"),
        schedule: z.array(z.record(z.string(), z.any())).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
        const { name, nim, email, password, schedule } = input;
        
        const existingUser = await ctx.db.user.findFirst({ where: { OR: [{ email }, { nim }] } });
        if (existingUser) {
            throw new TRPCError({ code: "CONFLICT", message: "Email atau NIM sudah terdaftar." });
        }
        
        const hashedPassword = await bcrypt.hash(password, 12);
        
        const user = await ctx.db.user.create({
            data: { name, nim, email, password: hashedPassword, role: 'Mahasiswa' },
        });

        if (schedule && schedule.length > 0) {
            const scheduleData = schedule.map(item => {
                const hariKey = findKey(item, 'hari');
                const waktuKey = findKey(item, 'waktu');
                const mataKuliahKey = findKey(item, 'mata kuliah');
                const ruanganKey = findKey(item, 'ruangan');
                const dosenKey = findKey(item, 'dosen');

                const waktu = waktuKey ? String(item[waktuKey] ?? '') : '';
                const [jamMulai, jamSelesai] = waktu.split('-').map(s => s.trim());
                
                return {
                  hari: hariKey ? String(item[hariKey] ?? '') : '',
                  jamMulai: jamMulai ?? '',
                  jamSelesai: jamSelesai ?? '',
                  mataKuliah: mataKuliahKey ? String(item[mataKuliahKey] ?? '') : '',
                  ruangan: ruanganKey ? String(item[ruanganKey] ?? '') : '',
                  dosen: dosenKey ? String(item[dosenKey] ?? '') : '',
                  userId: user.id,
                };
            }).filter(item => item.mataKuliah);
            
            if (scheduleData.length > 0) {
                await ctx.db.jadwalKuliah.createMany({ data: scheduleData });
            }
        }

        return { success: true };
    }),

  registerOrganisasi: publicProcedure
    .input(z.object({
        name: z.string().min(3, "Nama organisasi minimal 3 karakter"),
        email: z.string().email("Format email tidak valid"),
        password: z.string().min(8, "Password minimal 8 karakter"),
        category: z.string(),
        description: z.string(),
        contact: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
        const { name, email, password, category, description, contact } = input;
        
        const existingOrgByName = await ctx.db.organisasi.findUnique({ where: { name } });
        if (existingOrgByName) {
            throw new TRPCError({ code: "CONFLICT", message: "Nama organisasi sudah digunakan." });
        }
        
        const existingOrgByEmail = await ctx.db.organisasi.findUnique({ where: { email } });
        if (existingOrgByEmail) {
            throw new TRPCError({ code: "CONFLICT", message: "Email sudah terdaftar." });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        
        await ctx.db.organisasi.create({
            data: { name, email, password: hashedPassword, category, description, contact },
        });

        return { success: true };
    }),
});
