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
  category?: string,
  subscriptionPlan: string = "FREE"
) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const basePrompt = `
Kamu adalah AI assistant untuk organisasi mahasiswa. Buatkan TEPAT 3 rekomendasi event yang kreatif dan praktis.

INPUT:
- Organisasi: ${organizationType}
- Target Audience: ${targetAudience}
- Budget Range: ${budget}
${category ? `- Kategori Fokus: ${category}` : ''}
- Subscription Plan: ${subscriptionPlan}
`;

    let enhancedPrompt = basePrompt;

    if (subscriptionPlan === "PRO") {
      enhancedPrompt += `
ENHANCED FEATURES (PRO):
- Berikan rekomendasi yang lebih detail dan spesifik
- Sertakan strategi marketing dan engagement yang advanced
- Tambahkan analytics metrics yang bisa ditrack
- Berikan insight tentang timing terbaik dan trend terkini
- Sertakan competitive analysis dan unique selling points
`;
    }

    enhancedPrompt += `
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
    "tips": ["Tips 1", "Tips 2"],${subscriptionPlan === "PRO" ? `
    "marketingStrategy": ["Strategi 1", "Strategi 2", "Strategi 3"],
    "engagementTactics": ["Taktik 1", "Taktik 2"],
    "analyticsToTrack": ["Metrik 1", "Metrik 2", "Metrik 3"],
    "competitiveAdvantage": "Keunggulan unik event ini",
    "optimalTiming": "Timing terbaik untuk event",` : ""}
    "trending": false,
    "aiGenerated": true,
    "subscriptionLevel": "${subscriptionPlan}"
  }
]
`;

    const result = await model.generateContent(enhancedPrompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean and parse JSON response
    const cleanedText = text.replace(/```json\s*|\s*```/g, '').trim();
    
    try {
      const recommendations = JSON.parse(cleanedText);
      return Array.isArray(recommendations) ? recommendations : [];
    } catch (parseError) {
      console.error("JSON parsing error:", parseError);
      console.error("Response text:", text);
      return [];
    }
    
  } catch (error) {
    console.error("Gemini AI Error:", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to generate AI recommendations"
    });
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
    .mutation(async ({ ctx, input }) => {
      try {
        const { user } = ctx.session;
        let subscriptionPlan = "FREE"; // Default to FREE
        
        // Check user's organization subscription
        if (user.role === "Organisasi") {
          const organization = await ctx.db.organisasi.findFirst({
            where: { email: user.email! },
            select: {
              subscriptionPlan: true,
              subscriptionExpiry: true
            }
          });
          
          if (organization) {
            // Check if subscription is still active
            const now = new Date();
            const isExpired = organization.subscriptionExpiry && organization.subscriptionExpiry < now;
            
            if (!isExpired && organization.subscriptionPlan === "PRO") {
              subscriptionPlan = "PRO";
            }
          }
        } else {
          // For students/staff, check their organization membership
          const userWithMembership = await ctx.db.user.findUnique({
            where: { id: user.id },
            include: {
              memberships: {
                include: {
                  organization: {
                    select: {
                      subscriptionPlan: true,
                      subscriptionExpiry: true
                    }
                  }
                }
              }
            }
          });

          if (userWithMembership?.memberships && userWithMembership.memberships.length > 0) {
            const org = userWithMembership.memberships[0]?.organization;
            if (org) {
              const now = new Date();
              const isExpired = org.subscriptionExpiry && org.subscriptionExpiry < now;
              
              if (!isExpired && org.subscriptionPlan === "PRO") {
                subscriptionPlan = "PRO";
              }
            }
          }
        }

        const recommendations = await generateEventRecommendations(
          input.organizationType,
          input.targetAudience,
          input.budget,
          input.category,
          subscriptionPlan
        );

        return {
          success: true,
          recommendations: recommendations,
          subscriptionPlan: subscriptionPlan,
          message: subscriptionPlan === "PRO" 
            ? "Enhanced AI recommendations generated with PRO features" 
            : "Basic AI recommendations generated. Upgrade to PRO for advanced features"
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
