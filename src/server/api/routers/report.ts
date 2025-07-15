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

  // Get detailed report statistics
  getDetailedReportData: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const { user } = ctx.session;
        let organizationId: string | null = null;

        // Get organization ID based on user role
        if (user.role === "Organisasi") {
          const organization = await ctx.db.organisasi.findFirst({
            where: { email: user.email! }
          });
          organizationId = organization?.id || null;
        } else {
          const userWithMembership = await ctx.db.user.findUnique({
            where: { id: user.id },
            include: { memberships: true }
          });
          organizationId = userWithMembership?.memberships[0]?.organizationId || null;
        }

        if (!organizationId) {
          return {
            eventPerformance: [],
            participantDemographics: [],
            skillDemand: [],
            monthlyTrends: [],
            topEvents: [],
            participantGrowth: [],
            eventCategories: [],
            feedbackAnalysis: []
          };
        }

        // Get events with detailed data
        const events = await ctx.db.event.findMany({
          where: { organizerId: organizationId },
          include: {
            skills: true,
            participants: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true
                  }
                }
              }
            },
            feedback: true,
            _count: {
              select: {
                participants: true,
                feedback: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        });

        // Event Performance Analysis
        const eventPerformance = events.map(event => {
          const acceptedParticipants = event.participants.filter(p => p.status === 'ACCEPTED').length;
          const averageRating = event.feedback.length > 0 
            ? event.feedback.reduce((sum, f) => sum + f.rating, 0) / event.feedback.length 
            : 0;
          
          return {
            name: event.title,
            registered: event._count.participants,
            attended: acceptedParticipants,
            rating: Number(averageRating.toFixed(1)),
            feedbackCount: event._count.feedback,
            completionRate: event._count.participants > 0 
              ? Number(((acceptedParticipants / event._count.participants) * 100).toFixed(1))
              : 0,
            date: event.date
          };
        }).slice(0, 10);

        // Participant Demographics (by role/type)
        const allParticipants = events.flatMap(event => event.participants);
        const roleCount = allParticipants.reduce((acc, participant) => {
          const role = participant.user.role || 'Unknown';
          acc[role] = (acc[role] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const participantDemographics = Object.entries(roleCount).map(([role, count]) => ({
          role,
          count,
          percentage: Number(((count / allParticipants.length) * 100).toFixed(1))
        }));

        // Skill Demand Analysis
        const skillCount = events.flatMap(event => event.skills).reduce((acc, skill) => {
          acc[skill.name] = (acc[skill.name] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const skillDemand = Object.entries(skillCount)
          .map(([skill, demand]) => ({ skill, demand }))
          .sort((a, b) => b.demand - a.demand)
          .slice(0, 10);

        // Monthly Trends (last 12 months)
        const monthlyTrends = [];
        for (let i = 11; i >= 0; i--) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          const monthName = date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
          
          const monthEvents = events.filter(event => {
            const eventDate = new Date(event.createdAt);
            return eventDate.getMonth() === date.getMonth() && 
                   eventDate.getFullYear() === date.getFullYear();
          });

          const monthParticipants = monthEvents.reduce((sum, event) => 
            sum + event.participants.filter(p => p.status === 'ACCEPTED').length, 0);

          monthlyTrends.push({
            month: monthName,
            events: monthEvents.length,
            participants: monthParticipants,
            avgRating: monthEvents.length > 0 
              ? Number((monthEvents.reduce((sum, event) => {
                  const eventRating = event.feedback.length > 0 
                    ? event.feedback.reduce((s, f) => s + f.rating, 0) / event.feedback.length 
                    : 0;
                  return sum + eventRating;
                }, 0) / monthEvents.length).toFixed(1))
              : 0
          });
        }

        // Top Performing Events
        const topEvents = events
          .filter(event => event.feedback.length > 0)
          .map(event => ({
            id: event.id,
            title: event.title,
            participants: event.participants.filter(p => p.status === 'ACCEPTED').length,
            rating: Number((event.feedback.reduce((sum, f) => sum + f.rating, 0) / event.feedback.length).toFixed(1)),
            date: event.date,
            feedbackCount: event.feedback.length
          }))
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 5);

        // Participant Growth Over Time
        const participantGrowth = [];
        let cumulativeParticipants = 0;
        
        for (let i = 11; i >= 0; i--) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          const monthName = date.toLocaleDateString('id-ID', { month: 'short' });
          
          const monthParticipants = events
            .filter(event => {
              const eventDate = new Date(event.createdAt);
              return eventDate.getMonth() === date.getMonth() && 
                     eventDate.getFullYear() === date.getFullYear();
            })
            .reduce((sum, event) => sum + event.participants.filter(p => p.status === 'ACCEPTED').length, 0);
          
          cumulativeParticipants += monthParticipants;
          
          participantGrowth.push({
            month: monthName,
            total: cumulativeParticipants,
            monthly: monthParticipants
          });
        }

        // Event Categories (based on skills)
        const categoryMapping: Record<string, string> = {
          'Programming': 'Teknologi',
          'Design': 'Kreatif',
          'Marketing': 'Bisnis',
          'Leadership': 'Kepemimpinan',
          'Communication': 'Komunikasi',
          'Data Analysis': 'Teknologi',
          'Project Management': 'Manajemen',
          'Research': 'Akademik'
        };

        const eventCategories = events.reduce((acc, event) => {
          event.skills.forEach(skill => {
            const category = categoryMapping[skill.name] || 'Lainnya';
            if (!acc[category]) {
              acc[category] = { name: category, count: 0, participants: 0 };
            }
            acc[category].count++;
            acc[category].participants += event.participants.filter(p => p.status === 'ACCEPTED').length;
          });
          return acc;
        }, {} as Record<string, { name: string; count: number; participants: number }>);

        // Feedback Analysis
        const allFeedback = events.flatMap(event => event.feedback);
        const ratingDistribution = [1, 2, 3, 4, 5].map(rating => ({
          rating: `${rating} Star${rating > 1 ? 's' : ''}`,
          count: allFeedback.filter(f => f.rating === rating).length
        }));

        const averageRatingOverall = allFeedback.length > 0 
          ? Number((allFeedback.reduce((sum, f) => sum + f.rating, 0) / allFeedback.length).toFixed(1))
          : 0;

        const feedbackAnalysis = {
          totalFeedback: allFeedback.length,
          averageRating: averageRatingOverall,
          ratingDistribution,
          satisfactionRate: allFeedback.length > 0 
            ? Number(((allFeedback.filter(f => f.rating >= 4).length / allFeedback.length) * 100).toFixed(1))
            : 0
        };

        return {
          eventPerformance,
          participantDemographics,
          skillDemand,
          monthlyTrends,
          topEvents,
          participantGrowth,
          eventCategories: Object.values(eventCategories),
          feedbackAnalysis
        };

      } catch (error) {
        console.error("Error fetching detailed report data:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch detailed report data"
        });
      }
    }),
});
