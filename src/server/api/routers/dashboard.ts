import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const dashboardRouter = createTRPCRouter({
  // Get organization dashboard statistics
  getOrganizationStats: protectedProcedure
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
            totalEvents: 0,
            totalParticipants: 0,
            activeEvents: 0,
            completedEvents: 0,
            monthlyEvents: [],
            categoryDistribution: [],
            participationTrend: [],
            upcomingEvents: []
          };
        }

        // Get basic stats
        const totalEvents = await ctx.db.event.count({
          where: { organizerId: organizationId }
        });

        const totalParticipants = await ctx.db.eventParticipant.count({
          where: {
            event: { organizerId: organizationId },
            status: "ACCEPTED"
          }
        });

        const now = new Date();
        const activeEvents = await ctx.db.event.count({
          where: {
            organizerId: organizationId,
            date: { gte: now }
          }
        });

        const completedEvents = await ctx.db.event.count({
          where: {
            organizerId: organizationId,
            date: { lt: now }
          }
        });

        // Get monthly events for chart (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const monthlyEventsData = await ctx.db.event.findMany({
          where: {
            organizerId: organizationId,
            createdAt: { gte: sixMonthsAgo }
          },
          select: {
            createdAt: true,
            title: true
          }
        });

        // Process monthly data
        const monthlyEvents = [];
        for (let i = 5; i >= 0; i--) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          const monthName = date.toLocaleDateString('id-ID', { month: 'short' });
          const year = date.getFullYear();
          
          const eventCount = monthlyEventsData.filter(event => {
            const eventDate = new Date(event.createdAt);
            return eventDate.getMonth() === date.getMonth() && 
                   eventDate.getFullYear() === date.getFullYear();
          }).length;

          monthlyEvents.push({
            month: `${monthName} ${year}`,
            events: eventCount
          });
        }

        // Get events with skills for category distribution
        const eventsWithSkills = await ctx.db.event.findMany({
          where: { organizerId: organizationId },
          include: { skills: true }
        });

        // Process category distribution
        const skillCounts: Record<string, number> = {};
        eventsWithSkills.forEach(event => {
          event.skills.forEach(skill => {
            skillCounts[skill.name] = (skillCounts[skill.name] || 0) + 1;
          });
        });

        const categoryDistribution = Object.entries(skillCounts)
          .map(([name, count]) => ({ name, value: count }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 6); // Top 6 categories

        // Get participation trend (last 6 months)
        const participationTrend = [];
        for (let i = 5; i >= 0; i--) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          const monthName = date.toLocaleDateString('id-ID', { month: 'short' });
          
          const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
          const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

          const participantCount = await ctx.db.eventParticipant.count({
            where: {
              event: { 
                organizerId: organizationId,
                date: {
                  gte: startOfMonth,
                  lte: endOfMonth
                }
              },
              status: "ACCEPTED"
            }
          });

          participationTrend.push({
            month: monthName,
            participants: participantCount
          });
        }

        // Get upcoming events
        const upcomingEvents = await ctx.db.event.findMany({
          where: {
            organizerId: organizationId,
            date: { gte: now }
          },
          include: {
            _count: {
              select: {
                participants: {
                  where: { status: "ACCEPTED" }
                }
              }
            }
          },
          orderBy: { date: 'asc' },
          take: 5
        });

        return {
          totalEvents,
          totalParticipants,
          activeEvents,
          completedEvents,
          monthlyEvents,
          categoryDistribution,
          participationTrend,
          upcomingEvents: upcomingEvents.map(event => ({
            id: event.id,
            title: event.title,
            date: event.date,
            location: event.location,
            participantCount: event._count.participants
          }))
        };

      } catch (error) {
        console.error("Error fetching organization stats:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch organization statistics"
        });
      }
    }),

  // Get recent activities
  getRecentActivities: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const { user } = ctx.session;
        let organizationId: string | null = null;

        // Get organization ID
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
          return [];
        }

        // Get recent activities (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentEvents = await ctx.db.event.findMany({
          where: {
            organizerId: organizationId,
            createdAt: { gte: thirtyDaysAgo }
          },
          include: {
            _count: {
              select: {
                participants: {
                  where: { status: "ACCEPTED" }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        });

        const recentParticipants = await ctx.db.eventParticipant.findMany({
          where: {
            event: { organizerId: organizationId },
            createdAt: { gte: thirtyDaysAgo }
          },
          include: {
            user: { select: { name: true } },
            event: { select: { title: true } }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        });

        // Combine and format activities
        const activities = [
          ...recentEvents.map(event => ({
            id: `event-${event.id}`,
            type: 'event_created' as const,
            title: `Event "${event.title}" dibuat`,
            description: `${event._count.participants} peserta terdaftar`,
            timestamp: event.createdAt,
            icon: 'calendar'
          })),
          ...recentParticipants.map(participant => ({
            id: `participant-${participant.id}`,
            type: 'new_participant' as const,
            title: `${participant.user.name} bergabung`,
            description: `Mendaftar ke event "${participant.event.title}"`,
            timestamp: participant.createdAt,
            icon: 'user'
          }))
        ];

        return activities
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
          .slice(0, 10);

      } catch (error) {
        console.error("Error fetching recent activities:", error);
        return [];
      }
    })
});
