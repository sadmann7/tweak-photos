import { env } from "@/env.mjs";
import {
  HAIR_COLOR,
  HAIR_STYLE,
  PRESET,
  SMILE,
  type COSMETICS,
  type ResponseBody,
  type ResponseData,
  type ResponseResult,
} from "@/types/globals";
import { hexToHairColor } from "@/utils/format";
import type { NextApiRequest, NextApiResponse } from "next";

interface ExtendedNextApiRequest extends NextApiRequest {
  body: {
    image: string;
    preset: PRESET;
    hairStyle: HAIR_STYLE;
    hairColor: HAIR_COLOR;
    smile: SMILE;
    cosmetics: COSMETICS[];
    restored: boolean;
    upscaled: boolean;
    bgRemoved: boolean;
  };
}

export type JsonResponse = ResponseResult<ResponseBody["input"], string>;

export default async function handler(
  req: ExtendedNextApiRequest,
  res: NextApiResponse<ResponseData | string>
) {
  try {
    const {
      image,
      preset,
      hairStyle,
      hairColor,
      smile,
      cosmetics,
      restored,
      upscaled,
      bgRemoved,
    } = req.body;

    const goodPrompt =
      "a face wearing these cosmetics: lipstick, eyeliner, eyeshadow, smiling with a big smile and  black hair";

    const presetPrompt =
      preset === PRESET.NO_PRESET
        ? ""
        : preset === PRESET.MALE_CHILD
        ? "a male face of a child boy with male hair style"
        : preset === PRESET.FEMALE_CHILD
        ? "a female face of a child girl with female hair style"
        : preset === PRESET.MALE_TEEN
        ? "a male face of a teen man with male hair style"
        : preset === PRESET.FEMALE_TEEN
        ? "a female face of a teen woman with female hair style"
        : preset === PRESET.MALE_ADULT
        ? "a male face of a adult man with male hair style"
        : preset === PRESET.FEMALE_ADULT
        ? "a female face of a adult woman with female hair style"
        : "";

    const prompt = `a ${
      smile === SMILE.NO_SMILE ? "face with" : "smiling face with"
    } ${
      hairStyle === HAIR_STYLE.DEFAULT ? "" : `a ${hairStyle.toLowerCase()}`
    } ${
      hairColor === HAIR_COLOR.DEFAULT
        ? ""
        : `${hexToHairColor(hairColor).toLowerCase()} hair,`
    } ${
      cosmetics.length === 0
        ? ""
        : `wearing ${cosmetics
            .map((c) => c.toLowerCase())
            .join(", ")} cosmetics, and with`
    } ${
      smile === SMILE.NO_SMILE
        ? ""
        : smile === SMILE.SMALL_SMILE
        ? "a little smile"
        : "a big smile"
    }`;

    const sanitizedPresetPrompt = presetPrompt.replaceAll(/\s+/g, " ").trim();
    const sanitizedPrompt = prompt.replaceAll(/\s+/g, " ").trim();

    console.log({
      sanitizedPresetPrompt,
      sanitizedPrompt,
    });

    // POST request to Replicate to start the image restoration generation process
    const responseBody: ResponseBody = {
      version:
        "7af9a66f36f97fee2fece7dcc927551a951f0022cbdd23747b9212f23fc17021",
      input: {
        input: image,
        neutral: "a face with hair",
        target:
          sanitizedPresetPrompt.length > 0
            ? sanitizedPresetPrompt
            : sanitizedPrompt,
        manipulation_strength: 4.1,
        disentanglement_threshold: 0.15,
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

    const jsonStartResponse = (await startResponse.json()) as JsonResponse;

    const endpointUrl = jsonStartResponse.urls.get;
    const originalInput = jsonStartResponse.input.input;
    const generationId = jsonStartResponse.id;

    // GET request to get the status of the image restoration process & return the result when it's ready
    let generatedOutput = null as JsonResponse["output"];
    while (!generatedOutput) {
      // Loop in 1s intervals until the alt text is ready
      const finalResponse = await fetch(endpointUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Token " + env.REPLICATE_API_KEY,
        },
      });
      const jsonFinalResponse = (await finalResponse.json()) as JsonResponse;

      if (jsonFinalResponse.status === "succeeded") {
        generatedOutput = jsonFinalResponse.output;
      } else if (jsonFinalResponse.status === "failed") {
        break;
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    res.status(200).json(
      generatedOutput
        ? {
            id: generationId,
            input: originalInput,
            output: generatedOutput,
          }
        : "Generation failed"
    );

    // // Check if the user is authenticated
    // const session = await getServerAuthSession({ req, res });
    // if (!session || !session.user) {
    //   return res.status(401).json("Unauthorized");
    // }

    // const user = await prisma.user.findUnique({
    //   where: {
    //     id: session.user.id,
    //   },
    // });

    // console.log(user);

    // // Save photo to database
    // if (user && generatedOutput) {
    //   await prisma.photo.create({
    //     data: {
    //       user: {
    //         connect: {
    //           id: user.id,
    //         },
    //       },
    //       replicateId: generationId,
    //       inputImage: originalInput,
    //       outputImage: generatedOutput,
    //       prompt: sanitizedPrompt,
    //       restored,
    //       upscaled,
    //       bgRemoved,
    //     },
    //   });
    // } else {
    //   return res.status(500).json("Failed to generate image");
    // }
  } catch (error) {
    console.error(error);
    res.status(500).json("Failed to generate image");
  }
}
