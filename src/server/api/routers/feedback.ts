// src/server/api/routers/feedback.ts
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const feedbackRouter = createTRPCRouter({
  // Create feedback for an event
  create: protectedProcedure
    .input(z.object({
      eventId: z.string(),
      rating: z.number().min(1).max(5),
      comment: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== 'Mahasiswa') {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }

      // Check if user participated in this event and it's completed
      const participation = await ctx.db.eventParticipant.findUnique({
        where: {
          eventId_userId: {
            eventId: input.eventId,
            userId: ctx.session.user.id
          }
        },
        include: {
          event: true
        }
      });

      if (!participation) {
        throw new TRPCError({ 
          code: 'BAD_REQUEST', 
          message: 'Anda belum terdaftar untuk event ini' 
        });
      }

      if (participation.status !== 'ACCEPTED') {
        throw new TRPCError({ 
          code: 'BAD_REQUEST', 
          message: 'Anda harus diterima di event ini untuk memberikan feedback' 
        });
      }

      // Check if event is completed
      const eventDate = new Date(participation.event.date);
      if (eventDate >= new Date()) {
        throw new TRPCError({ 
          code: 'BAD_REQUEST', 
          message: 'Event belum selesai, feedback hanya bisa diberikan setelah event berakhir' 
        });
      }

      // Check if feedback already exists
      const existingFeedback = await ctx.db.feedback.findUnique({
        where: {
          eventId_userId: {
            eventId: input.eventId,
            userId: ctx.session.user.id
          }
        }
      });

      if (existingFeedback) {
        // Update existing feedback
        return ctx.db.feedback.update({
          where: { id: existingFeedback.id },
          data: {
            rating: input.rating,
            comment: input.comment
          }
        });
      } else {
        // Create new feedback
        return ctx.db.feedback.create({
          data: {
            eventId: input.eventId,
            userId: ctx.session.user.id,
            rating: input.rating,
            comment: input.comment
          }
        });
      }
    }),

  // Get feedback for an event (for organizations)
  getByEvent: protectedProcedure
    .input(z.object({ eventId: z.string() }))
    .query(async ({ ctx, input }) => {
      if (ctx.session.user.role !== 'Organisasi') {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }

      // Verify event belongs to this organization
      const event = await ctx.db.event.findFirst({
        where: { 
          id: input.eventId, 
          organizerId: ctx.session.user.id 
        }
      });

      if (!event) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      return ctx.db.feedback.findMany({
        where: { eventId: input.eventId },
        include: {
          user: {
            select: {
              name: true,
              image: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    }),

  // Get user's feedback history
  getUserFeedback: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.session.user.role !== 'Mahasiswa') {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }

    return ctx.db.feedback.findMany({
      where: { userId: ctx.session.user.id },
      include: {
        event: {
          select: {
            title: true,
            date: true,
            organizer: {
              select: { name: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  })
});
