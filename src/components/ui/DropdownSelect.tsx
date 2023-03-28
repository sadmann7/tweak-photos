import { Listbox, Transition } from "@headlessui/react";
import { Check, ChevronUp } from "lucide-react";
import { Fragment, useState } from "react";
import type { Control, FieldValues, Path, PathValue } from "react-hook-form";
import { Controller } from "react-hook-form";
import { twMerge } from "tailwind-merge";

type DropdownSelectProps<
  TFieldValues extends FieldValues,
  TContext = unknown
> = {
  control: Control<TFieldValues, TContext>;
  name: Path<TFieldValues>;
  options: PathValue<TFieldValues, Path<TFieldValues>>[];
  isMultiple?: boolean;
  isRequired?: boolean;
};

const DropdownSelect = <TFieldValues extends FieldValues>({
  control,
  name,
  options,
  isMultiple = false,
  isRequired = true,
}: DropdownSelectProps<TFieldValues>) => {
  const [selected, setSelected] = useState<string | string[]>(
    isMultiple ? [] : options[0] || ""
  );

  return (
    <Controller
      control={control}
      name={name}
      rules={{ required: isRequired }}
      render={({ field: { onChange } }) => (
        <Listbox
          value={selected}
          onChange={(val) => {
            setSelected(val);
            onChange(val);
          }}
          multiple={isMultiple}
        >
          <div className="relative">
            <Listbox.Button
              className={twMerge(
                "relative w-full cursor-pointer rounded-md border border-gray-400 bg-gray-50 py-2.5 pl-4 pr-10 text-left text-base font-medium text-gray-900 shadow-md transition-colors",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-800"
              )}
            >
              <span className="block truncate">
                {isMultiple ? `Selected (${selected.length})` : selected}
              </span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronUp
                  className="h-5 w-5 text-gray-900 transition-transform ui-open:rotate-180"
                  aria-hidden="true"
                />
              </span>
            </Listbox.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Listbox.Options className="absolute z-10 mt-2 max-h-60 w-full overflow-auto rounded-md bg-gray-50 py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                {options.map((option) => (
                  <Listbox.Option
                    key={option}
                    className={twMerge(
                      "relative cursor-pointer select-none px-4 py-2 font-medium text-gray-800 transition",
                      "ui-selected:bg-gray-300/70 ui-active:bg-gray-300 hover:ui-active:bg-gray-300/50"
                    )}
                    value={option}
                  >
                    {({ selected }) => (
                      <>
                        <span className="block truncate">{option}</span>
                        {selected ? (
                          <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-800">
                            <Check className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </Listbox>
      )}
    />
  );
};

export default DropdownSelect;
