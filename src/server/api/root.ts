// src/server/api/root.ts
import { authRouter } from "~/server/api/routers/auth";
import { eventRouter } from "~/server/api/routers/event";
import { skillRouter } from "~/server/api/routers/skill";
import { createTRPCRouter, createCallerFactory } from "~/server/api/trpc";
import { reportRouter } from "~/server/api/routers/report";
import { aspirationRouter } from "~/server/api/routers/aspiration";
import { jadwalRouter } from "./routers/jadwal";
import { userRouter } from "./routers/user";
import { feedbackRouter } from "./routers/feedback";
import { recommendationRouter } from "./routers/recommendation";
import { dashboardRouter } from "./routers/dashboard";
import { subscriptionRouter } from "./routers/subscription";
import { adminRouter } from "./routers/admin";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  event: eventRouter,
  skill: skillRouter,
  report: reportRouter,
  aspiration: aspirationRouter,
  jadwal: jadwalRouter,
  user:userRouter,
  feedback: feedbackRouter,
  recommendation: recommendationRouter,
  dashboard: dashboardRouter,
  subscription: subscriptionRouter,
  admin: adminRouter,
  
});

export type AppRouter = typeof appRouter;
export const createCaller = createCallerFactory(appRouter);
// // src/server/api/root.ts
// import { authRouter } from "~/server/api/routers/auth";
// import { eventRouter } from "~/server/api/routers/event";
// import { skillRouter } from "~/server/api/routers/skill";
// import { createTRPCRouter, createCallerFactory } from "~/server/api/trpc";

// export const appRouter = createTRPCRouter({
//   auth: authRouter,
//   event: eventRouter,
//   skill: skillRouter,
// });

// export type AppRouter = typeof appRouter;

// // Ekspor factory untuk membuat caller di sisi server
// export const createCaller = createCallerFactory(appRouter);