import type { Dispatch, SetStateAction } from "react";

export type SetState<T> = Dispatch<SetStateAction<T>>;

// form enums
export enum SKIN_TONE {
  DEFAULT = "Default",
  LIGHT = "Light",
  MEDIUM = "Medium",
  DARK = "Dark",
}

export enum HAIR_STYLE {
  DEFAULT = "Default",
  SHORT = "Short",
  MEDIUM = "Medium",
  LONG = "Long",
  BALD = "Bald",
  BOWL_CUT = "Bowl cut",
  BOB_CUT = "Bob cut",
  WOLF_CUT = "Wolf cut",
  FRINGE = "Fringe",
  HI_TOP_FADE = "HI-top fade",
  CURLY = "Curly",
}

export enum HAIR_COLOR {
  DEFAULT = "Default",
  BLACK = "#000000",
  BROWN = "#8b4513",
  BRUNETTE = "#5c3317",
  BLONDE = "#f0e68c",
  RED = "#ff0000",
  GINGER = "#ff4500",
}

export enum SMILE {
  NO_SMILE = "No smile",
  SMALL_SMILE = "Small smile",
  BIG_SMILE = "Big smile",
}

export enum FACIAL_HAIR {
  DEFAULT = "Default",
  BEARD = "Beard",
  MUSTACHE = "Mustache",
  SIDE_BURNS = "Side Burns",
}

export enum EYE_COLOR {
  DEFAULT = "Default",
  BLACK = "#000000",
  BROWN = "#8b4513",
  BLUE = "#0000ff",
  GREEN = "#008000",
  GRAY = "#808080",
}

export enum GENDER {
  NEUTRAL = "Neutral",
  MALE = "Male",
  FEMALE = "Female",
}

export enum AGE {
  DEFAULT = "Default",
  CHILD = "Child",
  TEEN = "Teen",
  ADULT = "Adult",
}

export enum EXPRESSION {
  DEFAULT = "Default",
  HAPPY = "Happy",
  SAD = "Sad",
  ANGRY = "Angry",
  SURPRISED = "Surprised",
}

export enum ACCESSORY {
  GLASSES = "Glasses",
  SUNGLASSES = "Sunglasses",
  HAT = "Hat",
  HEADPHONES = "Headphones",
  MASK = "Mask",
}

export enum COSMETICS {
  LIPSTICK = "Lipstick",
  EYELINER = "Eyeliner",
  EYESHADOW = "Eyeshadow",
  NOSE_RING = "Nose Ring",
  EARRINGS = "Earrings",
}

// form file field
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
