// src/trpc/server.ts
import "server-only";
import {
  createTRPCProxyClient,
  loggerLink,
  httpBatchLink,
} from "@trpc/client";
import { headers } from "next/headers";
import SuperJSON from "superjson";

import { type AppRouter } from "~/server/api/root";

const getUrl = () => {
  if (typeof window !== "undefined") return "";
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${process.env.PORT ?? 3000}`;
};

export const api = createTRPCProxyClient<AppRouter>({
  // transformer dipindahkan dari sini
  links: [
    loggerLink({
      enabled: (op) =>
        process.env.NODE_ENV === "development" ||
        (op.direction === "down" && op.result instanceof Error),
    }),
    httpBatchLink({
      url: getUrl() + "/api/trpc",
      transformer: SuperJSON, // <-- Properti transformer dipindahkan ke sini
      async headers() {
        return {
          cookie: (await headers()).get("cookie") ?? "",
          "x-trpc-source": "rsc",
        };
      },
    }),
  ],
});