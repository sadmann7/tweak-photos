import { Switch } from "@headlessui/react";
import { useState } from "react";
import type { Control, FieldValues, Path } from "react-hook-form";
import { Controller } from "react-hook-form";
import { twMerge } from "tailwind-merge";

type SwitchButtonProps<TFieldValues extends FieldValues, TContext = unknown> = {
  control: Control<TFieldValues, TContext>;
  name: Path<TFieldValues>;
  defaultChecked?: boolean;
  label: string;
  description?: string;
  srText?: string;
  disabled?: boolean;
};

const ToggleInput = <TFieldValues extends FieldValues>({
  control,
  name,
  defaultChecked = false,
  label,
  description,
  srText = "Toggle",
  disabled = false,
}: SwitchButtonProps<TFieldValues>) => {
  const [enabled, setEnabled] = useState(defaultChecked);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange } }) => (
        <Switch.Group>
          <div className="flex justify-between gap-5">
            {description ? (
              <div className="grid gap-1">
                <Switch.Label className="text-sm font-medium text-gray-300 sm:text-base">
                  {label}
                </Switch.Label>
                <Switch.Description className="text-sm text-gray-400">
                  {description}
                </Switch.Description>
              </div>
            ) : (
              <Switch.Label className="text-sm font-medium text-gray-300 sm:text-base">
                {label}
              </Switch.Label>
            )}
            <Switch
              className={twMerge(
                "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out",
                "focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2  focus:ring-offset-gray-900",
                enabled ? "bg-blue-600" : "bg-gray-500",
                disabled && "pointer-events-none opacity-50"
              )}
              checked={enabled}
              onChange={(val) => {
                onChange(val);
                setEnabled(val);
              }}
              disabled={disabled}
            >
              <span className="sr-only">{srText}</span>
              <span
                aria-hidden="true"
                className={twMerge(
                  "inline-block h-[1.125rem] w-[1.125rem] rounded-full bg-gray-100 shadow ring-0 transition duration-200 ease-in-out",
                  enabled ? "translate-x-5" : "translate-x-0.5"
                )}
              />
            </Switch>
          </div>
        </Switch.Group>
      )}
    />
  );
};

export default ToggleInput;
