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

  create: protectedProcedure
    .input(
      z.object({
        editedId: z.string(),
        restoredId: z.string().optional(),
        bgRemovedId: z.string().optional(),
        inputImage: z.string(),
        editedImage: z.string(),
        restoredImage: z.string().optional(),
        bgRemovedImage: z.string().optional(),
        prompt: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const photo = await ctx.prisma.photo.create({
        data: {
          user: {
            connect: {
              id: ctx.session.user.id,
            },
          },
          editedId: input.editedId,
          restoredId: input.restoredId,
          bgRemovedId: input.bgRemovedId,
          inputImage: input.inputImage,
          editedImage: input.editedImage,
          restoredImage: input.restoredImage,
          prompt: input.prompt,
        },
      });
      return photo;
    }),

  updateRestored: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        restoredImage: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const photo = await ctx.prisma.photo.findUnique({
        where: {
          id: input.id,
        },
      });

      if (!photo) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Photo not found",
        });
      }

      const updatedPhoto = await ctx.prisma.photo.update({
        where: {
          id: input.id,
        },
        data: {
          restoredImage: input.restoredImage,
        },
      });
      return updatedPhoto;
    }),

  updateMasked: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        bgRemovedImage: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const photo = await ctx.prisma.photo.findUnique({
        where: {
          id: input.id,
        },
      });

      if (!photo) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Photo not found",
        });
      }

      const updatedPhoto = await ctx.prisma.photo.update({
        where: {
          id: input.id,
        },
        data: {
          bgRemovedImage: input.bgRemovedImage,
        },
      });
      return updatedPhoto;
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
