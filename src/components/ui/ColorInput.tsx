import dynamic from "next/dynamic";
import { useState } from "react";
import type { Control, FieldValues, Path, PathValue } from "react-hook-form";
import { Controller } from "react-hook-form";
const CompactPicker = dynamic(
  () => import("react-color").then((mod) => mod.GithubPicker),
  { ssr: false }
);

type ColorInputProps<TFieldValues extends FieldValues, TContext = unknown> = {
  control: Control<TFieldValues, TContext>;
  name: Path<TFieldValues>;
  options: PathValue<TFieldValues, Path<TFieldValues>>[];
};

const ColorInput = <TFieldValues extends FieldValues>({
  control,
  name,
  options,
}: ColorInputProps<TFieldValues>) => {
  const [color, setColor] = useState("");

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange } }) => (
        <CompactPicker
          styles={{
            default: {
              card: {
                boxShadow: "none",
                border: "none",
                borderRadius: "0",
                backgroundColor: "#9ca3af",
              },
            },
          }}
          color={color}
          onChangeComplete={(color) => {
            setColor(color.hex);
            onChange(color.hex);
          }}
          colors={options}
        />
      )}
    />
  );
};

export default ColorInput;
