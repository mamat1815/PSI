// src/server/api/routers/event.ts
import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { env } from "~/env";

export const eventRouter = createTRPCRouter({
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

      const ratings = event.feedback.map(f => f.rating);
      const averageRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
      const comments = event.feedback.map(f => f.comment).filter(Boolean).slice(0, 15);
      const skillsDeveloped = event.skills.map(s => s.name).join(', ');

      const prompt = `Anda adalah seorang analis ahli untuk UACAD. Berikan analisis mendalam dan rekomendasi strategis berdasarkan data event berikut. **Perintah Penting:** Langsung berikan output dalam format HTML tanpa teks pembuka atau penutup. Mulai jawaban Anda langsung dengan tag <h3>. **Data Mentah:** - Nama Event: ${event.title} - Deskripsi: ${event.description} - Keterampilan (Skills) yang Diasah: ${skillsDeveloped || 'Tidak ada'} - Rating Rata-rata: ${averageRating.toFixed(2)} dari 5 (${ratings.length} suara) - Kutipan Komentar: ${comments.length > 0 ? comments.map(c => `- "${c}"`).join('\n') : '- Tidak ada komentar.'} **Struktur HTML yang Wajib Diikuti:** <h3>Analisis Sentimen & Skill</h3><ul><li><strong>Ringkasan Sentimen:</strong> (Jelaskan sentimen umum dari peserta berdasarkan komentar dan rating).</li><li><strong>Kesesuaian Skill:</strong> (Analisis apakah event ini berhasil mengasah skill yang ditargetkan. Jika tidak ada feedback, asumsikan netral).</li></ul><h3>Rekomendasi Strategis</h3><ul><li><strong>Keputusan:</strong> (Berikan salah satu dari tiga keputusan berikut: <strong>LAYAK DILANJUTKAN</strong>, <strong>PERLU EVALUASI ULANG</strong>, atau <strong>SEBAIKNYA TIDAK DILANJUTKAN</strong>).</li><li><strong>Langkah Konkret:</strong> (Berikan 2-4 poin langkah-langkah dalam bentuk list <li>...</li>. Kaitkan rekomendasi dengan skill yang ditargetkan).</li></ul><h3>Kesimpulan Eksekutif</h3><p>(Berikan kesimpulan akhir dalam satu paragraf singkat).</p>`;

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

  getPublic: publicProcedure.query(({ ctx }) => {
    return ctx.db.event.findMany({
      where: { status: 'PUBLISHED', date: { gte: new Date() } },
      include: { organizer: { select: { name: true } } },
      orderBy: { date: 'asc' },
    });
  }),

  // Prosedur untuk mendaftarkan user ke sebuah event
  register: protectedProcedure
    .input(z.object({ eventId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "Mahasiswa") {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      return ctx.db.event.update({
        where: { id: input.eventId },
        data: {
          participants: {
            connect: { id: ctx.session.user.id },
          },
        },
      });
    }),
  create: protectedProcedure
    .input(z.object({
      title: z.string().min(3),
      description: z.string(),
      date: z.date(),
      location: z.string().min(1),
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
        location: z.string().min(1), 
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
});

// // src/server/api/routers/event.ts
// import { z } from "zod";
// import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
// import { TRPCError } from "@trpc/server";
// import { env } from "~/env.js";

// export const eventRouter = createTRPCRouter({
//   /**
//    * Mengambil semua event yang dimiliki oleh organisasi yang sedang login.
//    * Termasuk data relasi ke skills.
//    */
//   getAll: protectedProcedure.query(async ({ ctx }) => {
//     return ctx.db.event.findMany({
//       where: { organizerId: ctx.session.user.id },
//       orderBy: { date: 'desc' },
//     });
//   }),

//   /**
//    * Mengambil detail satu event spesifik, termasuk semua feedback dan skill terkait.
//    */
//   getByIdWithFeedback: protectedProcedure
//     .input(z.object({ id: z.string() }))
//     .query(async ({ ctx, input }) => {
//       if (ctx.session.user.role !== 'Organisasi') {
//         throw new TRPCError({ code: 'UNAUTHORIZED' });
//       }
//       return ctx.db.event.findUnique({
//         where: { id: input.id, organizerId: ctx.session.user.id },
//         include: {
//           feedback: {
//             include: {
//               user: {
//                 select: { name: true, image: true },
//               },
//             },
//             orderBy: { createdAt: 'desc' },
//           },
//           skills: true,
//         },
//       });
//     }),

//   /**
//    * Membuat event baru.
//    */
//   create: protectedProcedure
//     .input(z.object({
//       title: z.string().min(3, "Judul minimal 3 karakter"),
//       description: z.string().min(10, "Deskripsi minimal 10 karakter"),
//       date: z.date(),
//       location: z.string().min(1, "Lokasi tidak boleh kosong"),
//       skills: z.array(z.object({ id: z.string(), name: z.string() })),
//       status: z.enum(['DRAFT', 'PUBLISHED']),
//     }))
//     .mutation(async ({ ctx, input }) => {
//             if (ctx.session.user.role !== 'Organisasi') {
//         throw new TRPCError({ code: 'UNAUTHORIZED' });
//       }
      
//       const { skills, ...eventData } = input;

//       const skillConnectOrCreate = skills.map(skill => ({
//           where: { name: skill.name },
//           create: { name: skill.name },
//       }));

//       return ctx.db.event.create({
//         data: {
//           ...eventData,
//           organizerId: ctx.session.user.id,
//           skills: {
//             connectOrCreate: skillConnectOrCreate,
//           },
//         },
//       });
//     }),

//   /**
//    * Memperbarui event yang sudah ada.
//    */
//   update: protectedProcedure
//     .input(z.object({ 
//         id: z.string(), 
//         title: z.string().min(3), 
//         description: z.string().min(10), 
//         date: z.date(), 
//         location: z.string().min(1), 
//         skills: z.array(z.object({ id: z.string(), name: z.string() })),
//         status: z.enum(['DRAFT', 'PUBLISHED']) 
//     }))
//     .mutation(async({ctx, input}) => { 
//         const { id, skills, ...data } = input; 
//         const event = await ctx.db.event.findFirst({where:{id, organizerId: ctx.session.user.id}}); 
//         if(!event) throw new TRPCError({code:'NOT_FOUND'}); 
        
//         const skillConnectOrCreate = skills.map(skill => ({
//             where: { name: skill.name },
//             create: { name: skill.name },
//         }));

//         return ctx.db.event.update({
//             where:{id}, 
//             data:{
//                 ...data, 
//                 organizerId:ctx.session.user.id,
//                 skills: {
//                     set: [], // Hapus relasi skill lama untuk diganti dengan yang baru
//                     connectOrCreate: skillConnectOrCreate,
//                 },
//             }
//         })
//     }),
  
//   /**
//    * Menghapus event.
//    */
//   delete: protectedProcedure
//     .input(z.object({id: z.string()}))
//     .mutation(async({ctx, input}) => {
//         const event = await ctx.db.event.findFirst({where:{id: input.id, organizerId:ctx.session.user.id}}); 
//         if(!event) throw new TRPCError({code:'NOT_FOUND'}); 
//         return ctx.db.event.delete({where:{id: input.id}});
//     }),

//   /**
//    * Menghasilkan rekomendasi dari Gemini AI berdasarkan feedback event,
//    * lalu menyimpannya ke database untuk penggunaan di masa depan.
//    */
//   getAiRecommendation: protectedProcedure
//     .input(z.object({ eventId: z.string() }))
//     .mutation(async ({ ctx, input }) => {
//       const event = await ctx.db.event.findUnique({
//         where: { id: input.eventId, organizerId: ctx.session.user.id },
//         include: { feedback: true, skills: true },
//       });

//       if (!event) throw new TRPCError({ code: 'NOT_FOUND' });
//       if (event.aiRecommendation) return event.aiRecommendation;

//       const ratings = event.feedback.map(f => f.rating);
//       const averageRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
//       const comments = event.feedback.map(f => f.comment).filter(Boolean).slice(0, 15);
//       const skillsDeveloped = event.skills.map(s => s.name).join(', ');

//       const prompt = `
//         Anda adalah analis ahli untuk UACAD. Berikan analisis mendalam dan rekomendasi strategis berdasarkan data event berikut.

//         **Data Mentah:**
//         - Nama Event: ${event.title}
//         - Deskripsi: ${event.description}
//         - Keterampilan (Skills) yang Diasah: ${skillsDeveloped || 'Tidak ada'}
//         - Rating Rata-rata: ${averageRating.toFixed(2)} dari 5 (${ratings.length} suara)
//         - Kutipan Komentar:
//         ${comments.length > 0 ? comments.map(c => `- "${c}"`).join('\n') : '- Tidak ada komentar.'}

//         **Perintah Penting:**
//         Langsung berikan output dalam format HTML tanpa teks pembuka atau penutup. Mulai jawaban Anda langsung dengan tag <h3>.

//         **Struktur HTML yang Wajib Diikuti:**
//         <h3>Analisis Sentimen & Skill</h3>
//         <ul>
//           <li><strong>Ringkasan Sentimen:</strong> (Jelaskan sentimen umum dari peserta berdasarkan komentar dan rating).</li>
//           <li><strong>Kesesuaian Skill:</strong> (Analisis apakah event ini berhasil mengasah skill yang ditargetkan. Jika tidak ada feedback, asumsikan netral).</li>
//         </ul>

//         <h3>Rekomendasi Strategis</h3>
//         <ul>
//             <li><strong>Keputusan:</strong> (Berikan salah satu dari tiga keputusan berikut: <strong>LAYAK DILANJUTKAN</strong>, <strong>PERLU EVALUASI ULANG</strong>, atau <strong>SEBAIKNYA TIDAK DILANJUTKAN</strong>).</li>
//             <li><strong>Langkah Konkret:</strong> (Berikan 2-4 poin langkah-langkah dalam bentuk list <li>...</li>. Kaitkan rekomendasi dengan skill yang ditargetkan).</li>
//         </ul>

//         <h3>Kesimpulan Eksekutif</h3>
//         <p>(Berikan kesimpulan akhir dalam satu paragraf singkat).</p>
//       `;

//       try {
//         const apiKey = env.GEMINI_API_KEY;
//         const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
//         const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };
//         const response = await fetch(apiUrl, {method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)});
//         if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
//         const result = await response.json();
//         const recommendationText = result.candidates?.[0]?.content?.parts?.[0]?.text;

//         if (recommendationText) {
//           await ctx.db.event.update({ where: { id: input.eventId }, data: { aiRecommendation: recommendationText }});
//           return recommendationText;
//         } else {
//           return "Gagal memproses rekomendasi dari AI.";
//         }
//       } catch (error) {
//         console.error("Gemini API call failed:", error);
//         throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Gagal menghubungi layanan AI.' });
//       }
//     }),
// });
