import { env } from "@/env.mjs";
import type {
  RemoveBgBody,
  ResponseData,
  ResponseResult,
} from "@/types/globals";
import type { NextApiRequest, NextApiResponse } from "next";

interface ExtendedNextApiRequest extends NextApiRequest {
  body: {
    image: string;
  };
}

export type JsonResponse = ResponseResult<RemoveBgBody["input"], string>;

export default async function handler(
  req: ExtendedNextApiRequest,
  res: NextApiResponse<ResponseData | string>
) {
  try {
    const { image } = req.body;
    console.log(image);

    // POST request to Replicate to start the image restoration generation process
    const responseBody: RemoveBgBody = {
      version:
        "da7d45f3b836795f945f221fc0b01a6d3ab7f5e163f13208948ad436001e2255",
      input: {
        image,
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
    const originalInput = jsonStartResponse.input.image;
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

    if (!generatedOutput) {
      return res.status(500).json("Failed to generate image");
    }

    res.status(200).json({
      id: generationId,
      input: originalInput,
      output: generatedOutput,
      prompt: null,
    });
  } catch (error) {
    error instanceof Error
      ? console.error(error.message)
      : console.error(error);
    res.status(500).json("Failed to generate image");
  }
}
