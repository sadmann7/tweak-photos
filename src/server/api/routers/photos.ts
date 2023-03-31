import { env } from "@/env.mjs";
import { type JsonResponse as RestoreJsonResponse } from "@/pages/api/restore";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import type { CodeFormerBody } from "@/types/globals";
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

  restore: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
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

      const responseBody: CodeFormerBody = {
        version:
          "7de2ea26c616d5bf2245ad0d5e24f0ff9a6204578a5c876db53142edd9d2cd56",
        input: {
          image: photo.outputImage,
          codeformer_fidelity: 0.7,
          background_enhance: true,
          face_upsample: true,
          upscale: 2,
        },
      };

      const startResponse = await fetch(
        "https://api.replicate.com/v1/predictions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${env.REPLICATE_API_KEY}`,
          },
          body: JSON.stringify({ ...responseBody }),
        }
      );

      const jsonStartResponse =
        (await startResponse.json()) as RestoreJsonResponse;

      const endpointUrl = jsonStartResponse.urls.get;

      // GET request to get the status of the image restoration process & return the result when it's ready
      let generatedOutput = null as RestoreJsonResponse["output"];
      while (!generatedOutput) {
        // Loop in 1s intervals until the alt text is ready
        const finalResponse = await fetch(endpointUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Token " + env.REPLICATE_API_KEY,
          },
        });
        const jsonFinalResponse =
          (await finalResponse.json()) as RestoreJsonResponse;

        if (jsonFinalResponse.status === "succeeded") {
          generatedOutput = jsonFinalResponse.output;
        } else if (jsonFinalResponse.status === "failed") {
          break;
        } else {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      if (!generatedOutput) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate image",
        });
      }

      const updatedPhoto = await ctx.prisma.photo.update({
        where: {
          id: input,
        },
        data: {
          outputImage: generatedOutput,
        },
      });

      return updatedPhoto;
    }),

  delete: protectedProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const photo = await ctx.prisma.photo.delete({
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

    return photo;
  }),
});
