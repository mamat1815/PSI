// src/server/api/root.ts
import { authRouter } from "~/server/api/routers/auth";
import { eventRouter } from "~/server/api/routers/event";
import { skillRouter } from "~/server/api/routers/skill";
import { createTRPCRouter, createCallerFactory } from "~/server/api/trpc";
import { reportRouter } from "~/server/api/routers/report";
import { aspirationRouter } from "~/server/api/routers/aspiration";
import { jadwalRouter } from "./routers/jadwal";
import { userRouter } from "./routers/user";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  event: eventRouter,
  skill: skillRouter,
  report: reportRouter,
  aspiration: aspirationRouter,
  jadwal: jadwalRouter,
  user:userRouter,
  
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