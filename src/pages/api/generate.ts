import { env } from "@/env.mjs";
import type {
  ResponseBody,
  ResponseData,
  ResponseResult,
} from "@/types/globals";
import type { NextApiRequest, NextApiResponse } from "next";

interface ExtendedNextApiRequest extends NextApiRequest {
  body: {
    imageUrl: string;
    command: string;
  };
}

export type JsonResponse = ResponseResult<ResponseBody["input"], string>;

export default async function handler(
  req: ExtendedNextApiRequest,
  res: NextApiResponse<ResponseData | string>
) {
  try {
    const { imageUrl, command } = req.body;
    console.log(imageUrl);

    // POST request to Replicate to start the image restoration generation process
    const responseBody: ResponseBody = {
      version:
        "7af9a66f36f97fee2fece7dcc927551a951f0022cbdd23747b9212f23fc17021",
      input: {
        input: imageUrl,
        neutral: "a face",
        // Target image description
        target: command,
        // The higher the manipulation strength, the closer the generated image
        // becomes to the target description. Negative values moves the
        // generated image further from the target description
        // Range: -10 to 10
        manipulation_strength: 7,
        // The higher the disentanglement threshold, the more specific the
        // changes are to the target attribute. Lower values mean that broader
        // changes are made to the input image
        // Range: 0.08 to 0.3
        disentanglement_threshold: 0.3,
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
