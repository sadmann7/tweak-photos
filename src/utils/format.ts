import { HAIR_COLOR } from "@/types/globals";
import tinycolor from "@ctrl/tinycolor";

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

export const hexToColorName = (hex: string): string => {
  const color = tinycolor(hex);
  return color.toName() || color.toHexString();
};

export const hextToColor = (hex: string): string => {
  switch (hex) {
    case HAIR_COLOR.DEFAULT:
      return "Default";
    case HAIR_COLOR.BLACK:
      return "Black";
    case HAIR_COLOR.BROWN:
      return "Brown";
    case HAIR_COLOR.GOLDEN:
      return "Golden";
    case HAIR_COLOR.YELLOW:
      return "Yellow";
    case HAIR_COLOR.BLONDE:
      return "Blonde";
    case HAIR_COLOR.RED:
      return "Red";
    case HAIR_COLOR.GREEN:
      return "Green";
    case HAIR_COLOR.BLUE:
      return "Blue";
    case HAIR_COLOR.GREY:
      return "Grey";
    case HAIR_COLOR.WHITE:
      return "White";
    case HAIR_COLOR.GINGER:
      return "Ginger";
    case HAIR_COLOR.PINK:
      return "Pink";
    case HAIR_COLOR.PURPLE:
      return "Purple";
    default:
      return "Default";
  }
};
