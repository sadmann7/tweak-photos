import { Disclosure, Transition } from "@headlessui/react";
import { ChevronUp } from "lucide-react";
import { twMerge } from "tailwind-merge";

type AccordionProps = {
  buttonLabel: string;
  panelContent: React.ReactNode;
};

const Accordion = ({ buttonLabel, panelContent }: AccordionProps) => {
  return (
    <div className="w-full">
      <Disclosure>
        <>
          <Disclosure.Button
            className={twMerge(
              "text-basae flex w-full justify-between rounded-md border border-gray-500 bg-gray-800 px-4 py-2.5 text-left font-medium text-gray-100 hover:bg-gray-800/50",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-800"
            )}
          >
            <span>{buttonLabel}</span>
            <ChevronUp
              className="h-5 w-5 text-gray-400 transition-transform ui-open:rotate-180"
              aria-hidden="true"
            />
          </Disclosure.Button>
          <Transition
            enter="transition duration-100 ease-out"
            enterFrom="transform scale-95 opacity-0"
            enterTo="transform scale-100 opacity-100"
            leave="transition duration-75 ease-out"
            leaveFrom="transform scale-100 opacity-100"
            leaveTo="transform scale-95 opacity-0"
          >
            <Disclosure.Panel className="grid gap-5 px-1 pb-2 pt-4">
              {panelContent}
            </Disclosure.Panel>
          </Transition>
        </>
      </Disclosure>
    </div>
  );
};

export default Accordion;
