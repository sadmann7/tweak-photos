import { photosRouter } from "@/server/api/routers/photos";
import { createTRPCRouter } from "@/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  photos: photosRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
