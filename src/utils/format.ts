import { HAIR_COLOR } from "@/types/globals";

export const toTitleCase = (str: string): string => {
  return str
    .split("-")
    .map((word, i) => {
      return i === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word;
    })
    .join(" ");
};

export const toSentenceCase = (str: string): string => {
  return str
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("-");
};

export const hexToHairColor = (hex: string): string => {
  switch (hex) {
    case HAIR_COLOR.DEFAULT:
      return "Default";
    case HAIR_COLOR.BLACK:
      return "Black";
    case HAIR_COLOR.BROWN:
      return "Brown";
    case HAIR_COLOR.BRUNETTE:
      return "Brunette";
    case HAIR_COLOR.RED:
      return "Red";
    case HAIR_COLOR.GINGER:
      return "Ginger";
    default:
      return "Default";
  }
};
