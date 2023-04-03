import type { SetState } from "@/types/globals";
import { Tab } from "@headlessui/react";
import { type ReactNode } from "react";
import { twMerge } from "tailwind-merge";

type TabsProps = {
  selectedIndex: number;
  setSelectedIndex: SetState<number>;
  tabs: {
    name: string | null;
    content: ReactNode | null;
  }[];
};

const Tabs = ({ selectedIndex, setSelectedIndex, tabs }: TabsProps) => {
  return (
    <div className="w-full">
      <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
        <Tab.List className="flex w-full space-x-1 rounded-md bg-gray-700 p-1">
          {tabs.map((tab) => (
            <Tab
              key={tab.name}
              className={twMerge(
                "w-full rounded py-2 text-sm font-medium leading-5 text-gray-100",
                "ring-white ring-opacity-60 ring-offset-1 ring-offset-violet-400 focus:outline-none focus:ring-1",
                "ui-selected:bg-gray-900/75 ui-selected:shadow",
                "ui-not-selected:text-blue-100 ui-not-selected:hover:bg-white/[0.12] ui-not-selected:hover:text-white"
              )}
            >
              {tab.name}
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels className="mt-1.5">
          {tabs
            .filter((tab) => !!tab)
            .map((tab) => (
              <Tab.Panel
                key={tab.name}
                className={twMerge(
                  "rounded-md bg-gray-700 p-1",
                  "ring-white ring-opacity-60 ring-offset-1 ring-offset-violet-400 focus:outline-none focus:ring-1"
                )}
              >
                {tab.content}
              </Tab.Panel>
            ))}
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
};

export default Tabs;
