import type { SetState } from "@/types/globals";
import { Switch } from "@headlessui/react";
import * as React from "react";
import { twMerge } from "tailwind-merge";

type ToggleProps = {
  enabled: boolean;
  setEnabled: SetState<boolean>;
  disabled?: boolean;
  enabledLabel?: string;
  disabledLabel?: string;
  srText?: string;
} & React.HTMLAttributes<React.ElementRef<typeof Switch.Group>>;

const Toggle = React.forwardRef<
  React.ElementRef<typeof Switch.Group>,
  ToggleProps
>(
  (
    {
      className = "",
      enabled,
      setEnabled,
      disabled = false,
      enabledLabel = "",
      disabledLabel = "",
      srText = "Toggle",
      ...props
    },
    ref
  ) => {
    return (
      <Switch.Group as="div" ref={ref} className={className} {...props}>
        <div className="flex items-center">
          {disabledLabel ? (
            <Switch.Label as="span" className="mr-3 cursor-default">
              <span
                className={`text-sm font-medium ${
                  !enabled ? "text-white" : "text-gray-500"
                } `}
              >
                {disabledLabel}
              </span>
            </Switch.Label>
          ) : null}
          <Switch
            className={twMerge(
              "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75",
              enabled ? "bg-blue-600" : "bg-gray-500",
              disabled && "pointer-events-none opacity-50"
            )}
            checked={enabled}
            onChange={setEnabled}
            disabled={disabled}
          >
            {/* need to provide srText when the labels are disabled */}
            <span className="sr-only">{srText}</span>
            <span
              aria-hidden="true"
              className={twMerge(
                "pointer-events-none inline-block h-[1.1rem] w-[1.1rem] transform rounded-full bg-gray-100 shadow-lg ring-0 transition duration-200 ease-in-out",
                enabled ? "translate-x-[1.34rem]" : "translate-x-0.5"
              )}
            />
          </Switch>
          {enabledLabel ? (
            <Switch.Label as="span" className="ml-3 cursor-default">
              <span
                className={`text-sm font-medium ${
                  enabled ? "text-white" : "text-gray-500"
                } `}
              >
                {enabledLabel}
              </span>
            </Switch.Label>
          ) : null}
        </div>
      </Switch.Group>
    );
  }
);

Toggle.displayName = "Toggle";

export default Toggle;
