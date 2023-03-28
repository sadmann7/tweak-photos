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
