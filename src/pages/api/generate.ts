import { env } from "@/env.mjs";
import type {
  ACCESSORY,
  COSMETICS,
  FACIAL_HAIR,
  HAIR_COLOR,
  ResponseBody,
  ResponseData,
  ResponseResult,
} from "@/types/globals";
import {
  GENDER,
  HAIR_STYLE,
  SKIN_TONE,
  type EXPRESSION,
} from "@/types/globals";
import type { NextApiRequest, NextApiResponse } from "next";

interface ExtendedNextApiRequest extends NextApiRequest {
  body: {
    image: string;
    skinTone: SKIN_TONE;
    hairStyle: HAIR_STYLE;
    facialHair: FACIAL_HAIR;
    facialHairColor: HAIR_COLOR;
    expression: EXPRESSION;
    gender: GENDER;
    accessory: ACCESSORY[];
    cosmetics: COSMETICS[];
  };
}

export type JsonResponse = ResponseResult<ResponseBody["input"], string>;

export default async function handler(
  req: ExtendedNextApiRequest,
  res: NextApiResponse<ResponseData | string>
) {
  try {
    const { image, skinTone, hairStyle, expression, gender } = req.body;

    const prompt = `a ${
      gender === GENDER.NEUTRAL
        ? "face with"
        : `${gender.toLowerCase()} face with`
    }  ${
      skinTone === SKIN_TONE.DEFAULT ? "" : `${skinTone.toLowerCase()} skin,`
    }  ${
      hairStyle === HAIR_STYLE.DEFAULT
        ? ""
        : `${hairStyle.toLowerCase()} hair, and`
    } ${`${expression.toLowerCase()} expression`}`;

    const sanitizedPrompt = prompt.replaceAll(/\s+/g, " ").trim();

    console.log({
      prompt,
      sanitizedPrompt,
    });

    // POST request to Replicate to start the image restoration generation process
    const responseBody: ResponseBody = {
      version:
        "7af9a66f36f97fee2fece7dcc927551a951f0022cbdd23747b9212f23fc17021",
      input: {
        input: image,
        neutral: "a face",
        target: sanitizedPrompt,
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
  } catch (error) {
    console.error(error);
    res.status(500).json("Failed to generate pokemon");
  }
}
