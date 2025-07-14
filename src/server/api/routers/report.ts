// src/server/api/routers/report.ts
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { env } from "~/env.js";

// Helper function to clean AI response
function cleanJsonResponse(text: string): string {
  return text
    .replace(/```json\s*/g, '')
    .replace(/```\s*/g, '')
    .replace(/^[^[\{]*/, '') // Remove any text before [ or {
    .replace(/[^}\]]*$/, '') // Remove any text after } or ]
    .trim();
}

export const reportRouter = createTRPCRouter({
  /**
   * Mengambil data event, mengirimkannya ke Gemini AI, dan meminta
   * output JSON yang terstruktur untuk chart.
   */
  getEventChartData: protectedProcedure
    .query(async ({ ctx }) => {
      if (ctx.session.user.role !== 'Organisasi') throw new TRPCError({ code: 'UNAUTHORIZED' });

      const events = await ctx.db.event.findMany({
        where: { organizerId: ctx.session.user.id },
        include: { _count: { select: { feedback: true } }, feedback: true },
      });

      const processedEvents = events.map(e => ({
        name: e.title,
        participantCount: e._count.feedback, // Asumsi jumlah feedback = jumlah partisipan
        averageRating: e.feedback.length > 0 ? e.feedback.reduce((acc, f) => acc + f.rating, 0) / e.feedback.length : 0,
      }));

      const prompt = `
        Berdasarkan data event berikut dalam format JSON: ${JSON.stringify(processedEvents)}.
        Tugas Anda adalah menganalisis data ini dan mengembalikannya dalam format JSON array yang bisa langsung digunakan oleh library chart 'recharts'.
        Setiap objek dalam array harus memiliki properti: 'name' (String, nama event), 'partisipan' (Number, jumlah peserta), dan 'rating' (Number, rating rata-rata).
        Contoh output: [{"name": "Webinar AI", "partisipan": 50, "rating": 4.5}, {"name": "Workshop Desain", "partisipan": 30, "rating": 4.8}]
        PENTING: Berikan HANYA JSON array mentah tanpa markdown formatting, tanpa backticks, tanpa kata "json", dan tanpa teks penjelasan apapun. Mulai langsung dengan [ dan akhiri dengan ].
      `;

      try {
        const apiKey = env.GEMINI_API_KEY;
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
        const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };
        const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (!response.ok) throw new Error("Gagal menghubungi Gemini API");
        
        const result = await response.json();
        let jsonString = result.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!jsonString) return [];
        
        // Bersihkan response dari markdown formatting
        jsonString = cleanJsonResponse(jsonString);
        
        return JSON.parse(jsonString);

      } catch (error) {
        console.error("AI Chart Data Generation Failed:", error);
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Gagal menghasilkan data chart.' });
      }
    }),

  /**
   * Mengambil data aspirasi, menganalisis sentimennya dengan Gemini AI,
   * dan mengembalikan data terstruktur untuk pie chart.
   */
  getAspirationSentimentData: protectedProcedure
    .query(async ({ ctx }) => {
      // Untuk demo, kita ambil semua aspirasi. Di aplikasi nyata, Anda bisa memfilternya.
      const aspirations = await ctx.db.aspirasi.findMany({ select: { content: true }, take: 50 });

      const prompt = `
        Analisis sentimen dari setiap aspirasi mahasiswa berikut: ${JSON.stringify(aspirations.map((a: { content: string }) => a.content))}.
        Klasifikasikan setiap aspirasi ke dalam salah satu dari tiga kategori: "Positif", "Netral", atau "Negatif".
        Setelah itu, hitung jumlah total untuk setiap kategori sentimen.
        Kembalikan hasilnya dalam format JSON array yang bisa langsung digunakan oleh library chart 'recharts' untuk pie chart.
        Setiap objek dalam array harus memiliki properti: 'name' (String, nama sentimen) dan 'value' (Number, jumlah aspirasi).
        Contoh output: [{"name": "Positif", "value": 25}, {"name": "Netral", "value": 15}, {"name": "Negatif", "value": 10}]
        PENTING: Berikan HANYA JSON array mentah tanpa markdown formatting, tanpa backticks, tanpa kata "json", dan tanpa teks penjelasan apapun. Mulai langsung dengan [ dan akhiri dengan ].
      `;

       try {
        const apiKey = env.GEMINI_API_KEY;
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
        const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };
        const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (!response.ok) throw new Error("Gagal menghubungi Gemini API");
        
        const result = await response.json();
        let jsonString = result.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!jsonString) return [];
        
        // Bersihkan response dari markdown formatting
        jsonString = cleanJsonResponse(jsonString);
        
        return JSON.parse(jsonString);

      } catch (error) {
        console.error("AI Sentiment Analysis Failed:", error);
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Gagal menganalisis sentimen.' });
      }
    }),
});
