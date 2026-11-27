"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

// Multi-select as a grid of checkbox cards (roles, countries)
export default function OptionGrid<V extends string | number>({
  id,
  options,
  value,
  onChange,
  invalid,
}: {
  id: string;
  options: { value: V; label: string; icon?: React.ReactNode }[];
  value: V[];
  onChange: (value: V[]) => void;
  invalid?: boolean;
}) {
  const toggle = (option: V, on: boolean) =>
    onChange(on ? [...value, option] : value.filter((item) => item !== option));

  return (
    <div
      id={id}
      role="group"
      className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3"
    >
      {options.map((option) => {
        const checked = value.includes(option.value);
        const inputId = `${id}-${option.value}`;

        return (
          <label
            key={option.value}
            htmlFor={inputId}
            className={cn(
              "flex cursor-pointer items-center gap-2.5 rounded-lg border bg-card px-3 py-2.5 text-[13px] transition-colors",
              checked
                ? "border-secondary bg-secondary/5 text-foreground"
                : invalid
                  ? "border-destructive/50 text-muted-foreground"
                  : "border-border text-muted-foreground hover:border-secondary/40 hover:text-foreground",
            )}
          >
            <Checkbox
              id={inputId}
              checked={checked}
              onCheckedChange={(next) => toggle(option.value, next === true)}
              className="data-checked:border-secondary data-checked:bg-secondary"
            />
            {option.icon}
            <span className="truncate">{option.label}</span>
          </label>
        );
      })}
    </div>
  );
}
