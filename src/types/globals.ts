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
  CURLY = "Curly",
  WAVEY = "Wavey",
  STRAIGHT = "Straight",
  PONYTAIL = "Ponytail",
}

export enum HAIR_COLOR {
  DEFAULT = "Default",
  BLONDE = "Blonde",
  BROWN = "Brown",
  BLACK = "Black",
  RED = "Red",
  GRAY = "Gray",
  WHITE = "White",
  PINK = "Pink",
  BLUE = "Blue",
  BOWL_CUT = "Bowl Cut",
}

export enum FACIAL_HAIR {
  DEFAULT = "Default",
  BEARD = "Beard",
  MUSTACHE = "Mustache",
  SIDE_BURNS = "Side Burns",
}

export enum EYE_COLOR {
  DEFAULT = "Default",
  BLACK = "Black",
  BLUE = "Blue",
  BROWN = "Brown",
  GREEN = "Green",
  HAZEL = "Hazel",
  GRAY = "Gray",
}

export enum GENDER {
  DEFAULT = "Default",
  MALE = "Male",
  FEMALE = "Female",
  OTHERS = "Others",
}

export enum AGE {
  DEFAULT = "Default",
  CHILD = "Child",
  TEEN = "Teen",
  ADULT = "Adult",
  SENIOR = "Senior",
}

export enum EXPRESSION {
  HAPPY = "Happy",
  SAD = "Sad",
  ANGRY = "Angry",
  SURPRISED = "Surprised",
  DISGUSTED = "Disgusted",
  FEARFUL = "Fearful",
  CALM = "Calm",
}

export enum ACCESSORY {
  GLASSES = "Glasses",
  SUNGLASSES = "Sunglasses",
  HAT = "Hat",
  HEADPHONES = "Headphones",
  MASK = "Mask",
}

export enum COSMETIC {
  LIPSTICK = "Lipstick",
  BLUSH = "Blush",
  EYEBROW = "Eyebrow",
  EYELINER = "Eyeliner",
  EYESHADOW = "Eyeshadow",
  MASCARA = "Mascara",
  NOSE_RING = "Nose Ring",
  NECKLACE = "Necklace",
  EARRINGS = "Earrings",
  TATTOO = "Tattoo",
}

// random accessory feature can be added to the prompt

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
