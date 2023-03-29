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
  BLACK = "#000000",
  BROWN = "#964b00",
  BLONDE = "#ffff00",
  RED = "#ff0000",
  GREY = "#808080",
  WHITE = "#ffffff",
  AUBURN = "#a52a2a",
  GINGER = "#ff4500",
  BLONDISH_BROWN = "#daa520",
  DARK_BROWN = "#654321",
  LIGHT_BROWN = "#8b4513",
  STRAWBERRY_BLONDE = "#ffb6c1",
  PURPLE = "#800080",
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
  NEUTRAL = "Neutral",
  MALE = "Male",
  FEMALE = "Female",
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
