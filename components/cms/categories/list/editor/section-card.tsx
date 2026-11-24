"use client";

import { useId } from "react";
import { Collapsible } from "radix-ui";
import { ChevronDown } from "lucide-react";

// One part of a category's editor, collapsible on its own: a title, a line
// saying what it's for, an optional count, an optional action (e.g. "Add
// field", usable while closed) and the content
export default function SectionCard({
  title,
  description,
  summary,
  action,
  defaultOpen = false,
  children,
}: {
  title: string;
  description: string;
  // Shown next to the title, e.g. "13 fields", so a closed section still says
  // what's inside
  summary?: string;
  action?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const id = useId();

  return (
    <Collapsible.Root
      defaultOpen={defaultOpen}
      className="group/section rounded-xl border bg-card"
    >
      <section aria-labelledby={`${id}-title`}>
        <header className="flex items-center gap-3 p-4 sm:px-5">
          <Collapsible.Trigger className="flex min-w-0 flex-1 cursor-pointer items-start gap-3 rounded-md text-start outline-none focus-visible:ring-2 focus-visible:ring-secondary/40">
            <ChevronDown
              aria-hidden
              className="mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform group-data-[state=closed]/section:-rotate-90 rtl:group-data-[state=closed]/section:rotate-90"
            />
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="flex flex-wrap items-baseline gap-x-2">
                <span
                  id={`${id}-title`}
                  className="text-sm font-semibold text-foreground"
                >
                  {title}
                </span>
                {summary && (
                  <span className="text-xs text-muted-foreground">
                    {summary}
                  </span>
                )}
              </span>
              <span className="text-xs text-muted-foreground">
                {description}
              </span>
            </span>
          </Collapsible.Trigger>

          {action}
        </header>

        {/* Kept mounted while closed so unsaved edits in a form survive */}
        <Collapsible.Content
          forceMount
          className="flex flex-col gap-4 px-4 pb-4 data-[state=closed]:hidden sm:px-5 sm:pb-5"
        >
          {children}
        </Collapsible.Content>
      </section>
    </Collapsible.Root>
  );
}
