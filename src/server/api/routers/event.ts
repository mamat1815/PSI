// src/server/api/routers/event.ts
import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { env } from "~/env";

export const eventRouter = createTRPCRouter({

  //MEnampilkan semua event yang dimiliki oleh organisasi yang sedang login
  getAll: protectedProcedure.query(({ ctx }) => {
    if (ctx.session.user.role !== 'Organisasi') throw new TRPCError({ code: 'UNAUTHORIZED' });
    return ctx.db.event.findMany({
      where: { organizerId: ctx.session.user.id },
      include: { skills: true },
      orderBy: { date: 'desc' },
    });
  }),

  getAiRecommendation: protectedProcedure
    .input(z.object({ eventId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const event = await ctx.db.event.findUnique({
        where: { id: input.eventId, organizerId: ctx.session.user.id },
        include: { feedback: true, skills: true },
      });

      if (!event) throw new TRPCError({ code: 'NOT_FOUND' });
      if (event.aiRecommendation) return event.aiRecommendation;

      const ratings = event.feedback.map((f: any) => f.rating);
      const averageRating = ratings.length > 0 ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length : 0;
      const comments = event.feedback.map((f: any) => f.comment).filter(Boolean).slice(0, 15);
      const skillsDeveloped = event.skills.map((s: any) => s.name).join(', ');

      const prompt = `Anda adalah seorang analis ahli untuk UACAD. Berikan analisis mendalam dan rekomendasi strategis berdasarkan data event berikut. **Perintah Penting:** Langsung berikan output dalam format HTML tanpa teks pembuka atau penutup. Mulai jawaban Anda langsung dengan tag <h3>. **Data Mentah:** - Nama Event: ${event.title} - Deskripsi: ${event.description} - Keterampilan (Skills) yang Diasah: ${skillsDeveloped || 'Tidak ada'} - Rating Rata-rata: ${averageRating.toFixed(2)} dari 5 (${ratings.length} suara) - Kutipan Komentar: ${comments.length > 0 ? comments.map((c: any) => `- "${c}"`).join('\n') : '- Tidak ada komentar.'} **Struktur HTML yang Wajib Diikuti:** <h3>Analisis Sentimen & Skill</h3><ul><li><strong>Ringkasan Sentimen:</strong> (Jelaskan sentimen umum dari peserta berdasarkan komentar dan rating).</li><li><strong>Kesesuaian Skill:</strong> (Analisis apakah event ini berhasil mengasah skill yang ditargetkan. Jika tidak ada feedback, asumsikan netral).</li></ul><h3>Rekomendasi Strategis</h3><ul><li><strong>Keputusan:</strong> (Berikan salah satu dari tiga keputusan berikut: <strong>LAYAK DILANJUTKAN</strong>, <strong>PERLU EVALUASI ULANG</strong>, atau <strong>SEBAIKNYA TIDAK DILANJUTKAN</strong>).</li><li><strong>Langkah Konkret:</strong> (Berikan 2-4 poin langkah-langkah dalam bentuk list <li>...</li>. Kaitkan rekomendasi dengan skill yang ditargetkan).</li></ul><h3>Kesimpulan Eksekutif</h3><p>(Berikan kesimpulan akhir dalam satu paragraf singkat).</p>`;

      try {
        const apiKey = env.GEMINI_API_KEY;
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
        const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };
        const response = await fetch(apiUrl, {method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)});
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const result = await response.json();
        const recommendationText = result.candidates?.[0]?.content?.parts?.[0]?.text;

        if (recommendationText) {
          await ctx.db.event.update({ where: { id: input.eventId }, data: { aiRecommendation: recommendationText }});
          return recommendationText;
        } else {
          return "Gagal memproses rekomendasi dari AI.";
        }
      } catch (error) {
        console.error("Gemini API call failed:", error);
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Gagal menghubungi layanan AI.' });
      }
    }),
    
  getByIdWithFeedback: protectedProcedure
  .input(z.object({ id: z.string() }))
  .query(async ({ ctx, input }) => {
    if (ctx.session.user.role !== 'Organisasi') throw new TRPCError({ code: 'UNAUTHORIZED' });
    return ctx.db.event.findUnique({
      where: { id: input.id, organizerId: ctx.session.user.id },
      include: {
        feedback: { include: { user: { select: { name: true, image: true } } }, orderBy: { createdAt: 'desc' } },
        skills: true,
      },
    });
  }),

  getPublic: publicProcedure.query(async ({ ctx }) => {
    const userId = ctx.session?.user?.id;
    
    const events = await ctx.db.event.findMany({
      where: { status: 'PUBLISHED', date: { gte: new Date() } },
      include: { 
        organizer: { select: { name: true } },
        skills: true,
        participants: userId ? {
          where: { userId: userId },
          select: { userId: true }
        } : false,
        _count: {
          select: { participants: true }
        }
      },
      orderBy: { date: 'asc' },
    });

    // Tambahkan field isRegistered untuk setiap event
    return events.map((event: any) => ({
      ...event,
      isRegistered: userId ? 
        event.participants.some((p: any) => p.userId === userId) : false,
    }));
  }),

  // Prosedur untuk mendaftarkan user ke sebuah event
  register: protectedProcedure
    .input(z.object({ eventId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "Mahasiswa") {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      // Cek apakah event ada
      const event = await ctx.db.event.findUnique({
        where: { id: input.eventId },
        include: {
          participants: true,
        },
      });

      if (!event) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Event tidak ditemukan" });
      }

      // Cek apakah sudah terdaftar menggunakan EventParticipant
      const existingParticipation = await ctx.db.eventParticipant.findUnique({
        where: {
          eventId_userId: {
            eventId: input.eventId,
            userId: ctx.session.user.id
          }
        }
      });

      if (existingParticipation) {
        throw new TRPCError({ 
          code: "BAD_REQUEST", 
          message: "Anda sudah terdaftar untuk event ini" 
        });
      }

      // Cek deadline registrasi
      if (event.registrationDeadline && new Date() > event.registrationDeadline) {
        throw new TRPCError({ 
          code: "BAD_REQUEST", 
          message: "Batas waktu pendaftaran telah berakhir" 
        });
      }

      // Cek kapasitas maksimum (gunakan _count dari participants EventParticipant)
      const participantCount = await ctx.db.eventParticipant.count({
        where: { eventId: input.eventId }
      });

      if (event.maxParticipants && participantCount >= event.maxParticipants) {
        throw new TRPCError({ 
          code: "BAD_REQUEST", 
          message: "Event sudah mencapai kapasitas maksimum" 
        });
      }

      // Daftarkan user ke event menggunakan EventParticipant
      return ctx.db.eventParticipant.create({
        data: {
          eventId: input.eventId,
          userId: ctx.session.user.id,
          status: 'PENDING'
        }
      });
    }),
  create: protectedProcedure
    .input(z.object({
      title: z.string().min(3),
      description: z.string(),
      date: z.date(),
      timeStart: z.string(),
      timeEnd: z.string(),
      location: z.string().min(1),
      image: z.string().nullable().optional(),
      maxParticipants: z.number().nullable().optional(),
      registrationDeadline: z.date().nullable().optional(),
      skills: z.array(z.object({ value: z.string(), label: z.string() })),
      status: z.enum(['DRAFT', 'PUBLISHED']),
    }))
    .mutation(async ({ ctx, input }) => {
      if(ctx.session.user.role !== 'Organisasi') throw new TRPCError({code: 'UNAUTHORIZED'});
      const { skills, ...eventData } = input;
      const skillConnectOrCreate = skills.map(skill => ({
        where: { name: skill.label },
        create: { name: skill.label },
      }));
      return ctx.db.event.create({
        data: { ...eventData, organizerId: ctx.session.user.id, skills: { connectOrCreate: skillConnectOrCreate } },
      });
    }),

  update: protectedProcedure
    .input(z.object({ 
        id: z.string(), 
        title: z.string().min(3), 
        description: z.string(), 
        date: z.date(), 
        timeStart: z.string(),
        timeEnd: z.string(),
        location: z.string().min(1), 
        image: z.string().nullable().optional(),
        maxParticipants: z.number().nullable().optional(),
        registrationDeadline: z.date().nullable().optional(),
        skills: z.array(z.object({ value: z.string(), label: z.string() })),
        status: z.enum(['DRAFT', 'PUBLISHED']) 
    }))
    .mutation(async({ctx, input}) => { 
        if(ctx.session.user.role !== 'Organisasi') throw new TRPCError({code: 'UNAUTHORIZED'});
        const { id, skills, ...data } = input; 
        const event = await ctx.db.event.findFirst({where:{id, organizerId: ctx.session.user.id}}); 
        if(!event) throw new TRPCError({code:'NOT_FOUND'}); 

        const skillConnectOrCreate = skills.map(skill => ({
            where: { name: skill.label },
            create: { name: skill.label },
        }));

        return ctx.db.event.update({
            where:{id}, 
            data:{ ...data, skills: { set: [], connectOrCreate: skillConnectOrCreate } }
        });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
        if(ctx.session.user.role !== 'Organisasi') throw new TRPCError({code: 'UNAUTHORIZED'});
        const event = await ctx.db.event.findFirst({where:{id: input.id, organizerId:ctx.session.user.id}}); 
        if(!event) throw new TRPCError({code:'NOT_FOUND'}); 
        return ctx.db.event.delete({ where: { id: input.id } });
    }),
  getOrgEvents: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.session.user.role !== 'Organisasi') {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }

    return ctx.db.event.findMany({
      where: { organizerId: ctx.session.user.id },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                nim: true,
                skills: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        },
        skills: {
          select: {
            name: true
          }
        },
        _count: {
          select: {
            participants: true
          }
        }
      },
      orderBy: { date: 'desc' },
    });
  }),

  // Update status peserta event
  updateParticipantStatus: protectedProcedure
    .input(z.object({
      eventId: z.string(),
      userId: z.string(),
      status: z.enum(['PENDING', 'ACCEPTED', 'REJECTED'])
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== 'Organisasi') {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }

      // Verify that the event belongs to this organization
      const event = await ctx.db.event.findFirst({
        where: { 
          id: input.eventId, 
          organizerId: ctx.session.user.id 
        }
      });

      if (!event) {
        throw new TRPCError({ 
          code: 'NOT_FOUND', 
          message: 'Event not found or you do not have permission to modify it' 
        });
      }

      // Update participant status using EventParticipant model
      return ctx.db.eventParticipant.update({
        where: {
          eventId_userId: {
            eventId: input.eventId,
            userId: input.userId
          }
        },
        data: {
          status: input.status,
          updatedAt: new Date()
        }
      });
    }),

  // Get events that the student is participating in
  getStudentEvents: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.session.user.role !== 'Mahasiswa') {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }

    const participations = await ctx.db.eventParticipant.findMany({
      where: { userId: ctx.session.user.id },
      include: {
        event: {
          include: {
            organizer: {
              select: { name: true }
            },
            skills: {
              select: { name: true }
            },
            _count: {
              select: { participants: true }
            },
            feedback: {
              where: { userId: ctx.session.user.id },
              select: {
                id: true,
                rating: true,
                comment: true,
                createdAt: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Transform to ensure proper date serialization
    return participations.map(participation => ({
      ...participation,
      createdAt: participation.createdAt.toISOString(),
      updatedAt: participation.updatedAt.toISOString(),
      event: {
        ...participation.event,
        date: participation.event.date.toISOString(),
        registrationDeadline: participation.event.registrationDeadline?.toISOString() ?? null,
        createdAt: participation.event.createdAt.toISOString(),
        updatedAt: participation.event.updatedAt.toISOString(),
        feedback: participation.event.feedback.map(f => ({
          ...f,
          createdAt: f.createdAt.toISOString()
        }))
      }
    }));
  }),
});
