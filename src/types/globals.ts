import type { Dispatch, SetStateAction } from "react";

export type SetState<T> = Dispatch<SetStateAction<T>>;

// file
export type OriginalImage = {
  name: string;
  url: string;
};

export type UploadedFile = {
  publicId: string;
  secureUrl: string;
  createdAt: string;
};

// replicate
export type ResponseBody = {
  version: string;
  input: {
    input: string;
    neutral: string;
    target: string;
    manipulation_strength: number;
    disentanglement_threshold: number;
  };
};

export type ResponseData = {
  id: string;
  input: string | null;
  output: string | null;
};

export type ResponseResult<TInput, TOutput> = {
  id: string;
  version: string;
  urls: {
    cancel: string;
    get: string;
  };
  created_at: string;
  started_at: string;
  completed_at: string;
  source: "api";
  status: "starting" | "succeeded" | "failed";
  input: TInput;
  output: TOutput | null;
  error: string | null;
  logs: string;
  metrics: {
    predict_time: number;
  };
};
