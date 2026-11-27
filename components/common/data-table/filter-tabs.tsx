"use client";

import { useFormatter } from "next-intl";

import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type FilterTab<T extends string> = {
  value: T;
  label: string;
  // Rows behind the tab, when the API reports it
  count?: number;
};

// Pill tabs for the table's `header` slot (e.g. All / Active / Inactive).
// Look only: the caller keeps the value (usually in the URL)
export default function FilterTabs<T extends string>({
  tabs,
  value,
  onValueChange,
  className,
}: {
  tabs: FilterTab<T>[];
  value: T;
  onValueChange: (value: T) => void;
  className?: string;
}) {
  const format = useFormatter();

  return (
    <Tabs
      value={value}
      onValueChange={(next) => onValueChange(next as T)}
      // Scrolls sideways on phones instead of wrapping onto two lines
      className={cn("overflow-x-auto px-4 py-2.5", className)}
    >
      <TabsList className="h-auto gap-1 bg-transparent p-0">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="h-8 flex-none gap-1.5 rounded-full border-0 px-3 text-xs font-semibold text-muted-foreground shadow-none transition-colors after:hidden hover:bg-muted hover:text-foreground data-active:bg-primary data-active:text-primary-foreground data-active:shadow-none data-active:hover:bg-primary dark:data-active:border-transparent dark:data-active:bg-primary dark:data-active:text-primary-foreground"
          >
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={cn(
                  "min-w-5 rounded-full px-1.5 py-px text-[10px] tabular-nums",
                  tab.value === value
                    ? "bg-primary-foreground/20"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {format.number(tab.count)}
              </span>
            )}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
