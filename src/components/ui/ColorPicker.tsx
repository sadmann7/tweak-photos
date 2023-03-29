import { hextToColor } from "@/utils/format";
import { Popover, Transition } from "@headlessui/react";
import { ChevronUp } from "lucide-react";
import dynamic from "next/dynamic";
import { Fragment, useState } from "react";
import type { Control, FieldValues, Path, PathValue } from "react-hook-form";
import { Controller } from "react-hook-form";
import { twMerge } from "tailwind-merge";
const CompactPicker = dynamic(
  () => import("react-color").then((mod) => mod.GithubPicker),
  { ssr: false }
);

type ColorPickerProps<TFieldValues extends FieldValues, TContext = unknown> = {
  control: Control<TFieldValues, TContext>;
  name: Path<TFieldValues>;
  options: PathValue<TFieldValues, Path<TFieldValues>>[];
};

const ColorPicker = <TFieldValues extends FieldValues>({
  control,
  name,
  options,
}: ColorPickerProps<TFieldValues>) => {
  const [color, setColor] = useState(options[0] ?? "#000000");

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange } }) => (
        <Popover className="relative">
          <Popover.Button
            className={twMerge(
              "relative w-full cursor-pointer rounded-md border border-gray-500 bg-gray-800 py-2.5 pl-4 pr-10 text-left text-base text-gray-100 shadow-md transition-colors",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-800"
            )}
          >
            <span className="flex items-center gap-2.5">
              <span
                className="block h-3.5 w-3.5 rounded-sm ring-1 ring-gray-200"
                style={{ backgroundColor: color }}
              />
              <span className="block truncate">{hextToColor(color)}</span>
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUp
                className="h-5 w-5 text-gray-400 transition-transform ui-open:rotate-180"
                aria-hidden="true"
              />
            </span>
          </Popover.Button>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <Popover.Panel className="absolute z-10 mt-3">
              {({ close }) => (
                <CompactPicker
                  styles={{
                    default: {
                      card: {
                        boxShadow: "none",
                        border: "none",
                        borderRadius: "0.375rem",
                        backgroundColor: "#9ca3af",
                      },
                    },
                  }}
                  color={color}
                  onChangeComplete={(color) => {
                    setColor(color.hex);
                    onChange(color.hex);
                    close();
                  }}
                  colors={options.filter((color) => color !== options[0])}
                />
              )}
            </Popover.Panel>
          </Transition>
        </Popover>
      )}
    />
  );
};

export default ColorPicker;
