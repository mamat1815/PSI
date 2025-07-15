import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "~/env";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

// Gemini AI service for generating event recommendations
const generateEventRecommendations = async (
  organizationType: string,
  targetAudience: string,
  budget: string,
  category?: string
) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `
Kamu adalah AI assistant untuk organisasi mahasiswa. Buatkan TEPAT 3 rekomendasi event yang kreatif dan praktis.

INPUT:
- Organisasi: ${organizationType}
- Target Audience: ${targetAudience}
- Budget Range: ${budget}
${category ? `- Kategori Fokus: ${category}` : ''}

OUTPUT:
Berikan respons dalam format JSON array yang valid dengan struktur berikut untuk setiap event:

[
  {
    "id": "ai-1",
    "title": "Nama Event",
    "description": "Deskripsi singkat 2-3 kalimat",
    "category": "Teknologi & IT",
    "estimatedParticipants": "50-80 orang",
    "duration": "1 hari",
    "budget": "${budget}",
    "difficulty": "Sedang",
    "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
    "targetAudience": "${targetAudience}",
    "objectives": ["Tujuan 1", "Tujuan 2", "Tujuan 3"],
    "requirements": ["Requirement 1", "Requirement 2", "Requirement 3"],
    "tips": ["Tips 1", "Tips 2"],
    "trending": false,
    "aiGenerated": true
  }
]

RULES:
1. Kategori harus salah satu: "Teknologi & IT", "Bisnis & Kewirausahaan", "Kesehatan & Wellness", "Lingkungan & Sosial", "Seni & Kreativitas"
2. Difficulty: "Mudah", "Sedang", atau "Sulit"
3. Event harus sesuai budget ${budget}
4. Relevan untuk ${targetAudience}
5. ID format: "ai-1", "ai-2", "ai-3"
6. HANYA JSON array, tidak ada teks lain

JSON:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse JSON response from Gemini
    try {
      // Clean up the response text to extract JSON
      let cleanText = text.trim();
      
      // Remove any text before the JSON array
      const jsonStart = cleanText.indexOf('[');
      const jsonEnd = cleanText.lastIndexOf(']');
      
      if (jsonStart !== -1 && jsonEnd !== -1) {
        cleanText = cleanText.substring(jsonStart, jsonEnd + 1);
      }
      
      // Remove markdown code blocks if present
      cleanText = cleanText.replace(/```json\n?/g, '').replace(/\n?```/g, '');
      cleanText = cleanText.replace(/```\n?/g, '');
      
      const recommendations = JSON.parse(cleanText);
      return Array.isArray(recommendations) ? recommendations : [recommendations];
    } catch (parseError) {
      // Fallback to manual parsing if JSON is malformed
      console.log("Gemini response:", text);
      console.log("Parse error:", parseError);
      throw new Error("Failed to parse AI response");
    }
    
  } catch (error) {
    console.error("Gemini AI Error:", error);
    
    // Fallback recommendations if AI fails
    return [
      {
        id: "ai-fallback-1",
        title: "Workshop Inovasi Digital",
        description: "Workshop hands-on untuk mengeksplorasi teknologi digital terbaru dan implementasinya dalam kehidupan sehari-hari. Peserta akan belajar tools dan teknik praktis.",
        category: "Teknologi & IT",
        estimatedParticipants: "40-60 orang",
        duration: "1 hari",
        budget: budget,
        difficulty: "Sedang",
        tags: ["Workshop", "Digital", "Innovation", "Technology", "Learning"],
        targetAudience: targetAudience,
        objectives: [
          "Memahami tren teknologi digital terkini",
          "Mengembangkan mindset inovatif",
          "Networking dengan praktisi industri"
        ],
        requirements: [
          "Laptop/tablet untuk praktik",
          "Koneksi internet stabil",
          "Ruangan dengan proyektor"
        ],
        tips: [
          "Undang speaker yang berpengalaman di industri",
          "Sediakan sesi tanya jawab interaktif"
        ],
        trending: false,
        aiGenerated: true
      },
      {
        id: "ai-fallback-2",
        title: "Community Service Program",
        description: "Program layanan masyarakat untuk membantu komunitas lokal dengan berbagai kegiatan sosial dan edukasi. Menggabungkan aksi nyata dengan pembelajaran.",
        category: "Lingkungan & Sosial",
        estimatedParticipants: "30-50 orang",
        duration: "1 hari",
        budget: budget,
        difficulty: "Mudah",
        tags: ["Community", "Service", "Social", "Education", "Impact"],
        targetAudience: targetAudience,
        objectives: [
          "Memberikan dampak positif bagi masyarakat",
          "Mengembangkan kepedulian sosial",
          "Membangun karakter kepemimpinan"
        ],
        requirements: [
          "Partnership dengan komunitas lokal",
          "Transportasi untuk peserta",
          "Peralatan kegiatan sosial"
        ],
        tips: [
          "Koordinasi yang baik dengan pihak terkait",
          "Dokumentasi kegiatan untuk evaluasi"
        ],
        trending: false,
        aiGenerated: true
      },
      {
        id: "ai-fallback-3",
        title: "Creative Skills Workshop",
        description: "Workshop pengembangan kreativitas dengan berbagai aktivitas seni dan desain. Peserta akan belajar teknik-teknik kreatif untuk mengekspresikan ide.",
        category: "Seni & Kreativitas",
        estimatedParticipants: "25-40 orang",
        duration: "4 jam",
        budget: budget,
        difficulty: "Mudah",
        tags: ["Creative", "Art", "Design", "Workshop", "Skills"],
        targetAudience: targetAudience,
        objectives: [
          "Mengembangkan kemampuan kreatif",
          "Belajar teknik seni dan desain",
          "Networking dengan komunitas kreatif"
        ],
        requirements: [
          "Studio atau ruang kreatif",
          "Peralatan seni dan desain",
          "Instruktur berpengalaman"
        ],
        tips: [
          "Sediakan berbagai media kreatif",
          "Ciptakan atmosfer yang inspiratif"
        ],
        trending: false,
        aiGenerated: true
      }
    ];
  }
};

export const recommendationRouter = createTRPCRouter({
  // Get predefined recommendations - now returns empty since we only use AI
  getRecommendations: protectedProcedure
    .input(z.object({
      category: z.string().optional(),
      difficulty: z.string().optional(),
      budget: z.string().optional(),
    }))
    .query(async ({ input }) => {
      // Return empty array since we're only using AI-generated recommendations
      return [];
    }),

  // Generate AI recommendations
  generateAIRecommendations: protectedProcedure
    .input(z.object({
      organizationType: z.string(),
      targetAudience: z.string(),
      budget: z.enum(["Rendah", "Sedang", "Tinggi"]),
      category: z.string().optional(),
      interests: z.array(z.string()).optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        const recommendations = await generateEventRecommendations(
          input.organizationType,
          input.targetAudience,
          input.budget,
          input.category
        );

        return {
          success: true,
          recommendations: recommendations,
          message: "AI recommendations generated successfully"
        };
      } catch (error) {
        console.error("Error generating AI recommendations:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate AI recommendations"
        });
      }
    }),

  // Get trending categories - now returns empty since no built-in data
  getTrendingCategories: protectedProcedure
    .query(async () => {
      // Return empty array since we removed built-in recommendations
      return [];
    }),

  // Get analytics - now only tracks AI generated recommendations
  getAnalytics: protectedProcedure
    .query(async () => {
      return {
        totalRecommendations: 0, // No built-in recommendations
        aiGenerated: 0, // Will be updated as users generate AI recommendations
        trending: 0, // No trending data without built-in recommendations
        categories: 0 // No predefined categories
      };
    }),

  // Create event from recommendation
  createEventFromRecommendation: protectedProcedure
    .input(z.object({
      recommendationId: z.string(),
      title: z.string(),
      description: z.string(),
      category: z.string(),
      estimatedParticipants: z.string(),
      duration: z.string(),
      budget: z.string(),
      difficulty: z.string(),
      tags: z.array(z.string()),
      targetAudience: z.string(),
      objectives: z.array(z.string()),
      requirements: z.array(z.string()),
      tips: z.array(z.string()),
      date: z.date(),
      timeStart: z.string(),
      timeEnd: z.string(),
      location: z.string(),
      maxParticipants: z.number().nullable(),
      registrationDeadline: z.date().nullable(),
      status: z.string().default("DRAFT"),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const { user } = ctx.session;
        let organizationId: string | null = null;
        
        // Check if user is an organization (role = "Organisasi")
        if (user.role === "Organisasi") {
          // If user is organization, find their organization record
          const organization = await ctx.db.organisasi.findFirst({
            where: { email: user.email! }
          });
          
          if (organization) {
            organizationId = organization.id;
          }
        } else {
          // If user is student/staff, check if they are part of an organization
          const userWithMembership = await ctx.db.user.findUnique({
            where: { id: user.id },
            include: {
              memberships: {
                include: {
                  organization: true
                }
              }
            }
          });

          if (userWithMembership?.memberships && userWithMembership.memberships.length > 0) {
            organizationId = userWithMembership.memberships[0]?.organizationId!;
          }
        }

        // If no organization found, create a default one or throw error
        if (!organizationId) {
          // For demo purposes, let's create a default organization for users without membership
          const defaultOrg = await ctx.db.organisasi.upsert({
            where: { email: `default-${user.id}@example.com` },
            update: {},
            create: {
              name: "Default Organization",
              email: `default-${user.id}@example.com`,
              password: "default",
              description: "Default organization for users without membership",
              category: "General"
            }
          });
          organizationId = defaultOrg.id;
          
          // Optionally create membership for the user
          if (user.role !== "Organisasi") {
            await ctx.db.membership.upsert({
              where: { 
                userId_organizationId: { 
                  userId: user.id, 
                  organizationId: organizationId 
                } 
              },
              update: {},
              create: {
                userId: user.id,
                organizationId: organizationId,
                role: "Anggota"
              }
            });
          }
        }

        // Create the event
        const event = await ctx.db.event.create({
          data: {
            title: input.title,
            description: input.description,
            date: input.date,
            timeStart: input.timeStart,
            timeEnd: input.timeEnd,
            location: input.location,
            maxParticipants: input.maxParticipants,
            registrationDeadline: input.registrationDeadline,
            status: input.status,
            organizerId: organizationId,
          },
        });

        // Create skills/tags for the event
        if (input.tags.length > 0) {
          // Create skills first if they don't exist
          for (const tagName of input.tags) {
            await ctx.db.skill.upsert({
              where: { name: tagName },
              update: {},
              create: { name: tagName },
            });
          }

          // Connect skills to event
          await ctx.db.event.update({
            where: { id: event.id },
            data: {
              skills: {
                connect: input.tags.map(tag => ({ name: tag }))
              }
            }
          });
        }

        return {
          success: true,
          event: event,
          message: "Event successfully created from recommendation!"
        };
      } catch (error) {
        console.error("Error creating event from recommendation:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create event from recommendation"
        });
      }
    }),

  // Get recommendation by ID - now only works with AI generated IDs
  getRecommendationById: protectedProcedure
    .input(z.object({
      id: z.string(),
    }))
    .query(async ({ input }) => {
      // Since we removed built-in recommendations, this will only work
      // for AI-generated recommendations stored in client state
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Only AI-generated recommendations are available. Please generate recommendations first."
      });
    }),
});
