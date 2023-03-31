import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const photosRouter = createTRPCRouter({
  getMany: protectedProcedure.query(async ({ ctx }) => {
    const photos = await ctx.prisma.photo.findMany({
      where: {
        userId: ctx.session.user.id,
      },
    });
    return photos;
  }),

  delete: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const photo = await ctx.prisma.photo.findUnique({
        where: {
          id: input,
        },
      });

      if (!photo) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Photo not found",
        });
      }

      const deletedPhoto = await ctx.prisma.photo.delete({
        where: {
          id: input,
        },
      });
      return deletedPhoto;
    }),
});
