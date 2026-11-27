"use client";

import { CalendarIcon, XIcon } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Dates are plain "Y-m-d" strings, the same in the URL and the API
export type DateRange = { from: string | null; to: string | null };

const pad = (n: number) => String(n).padStart(2, "0");

// From the admin's local calendar, not toISOString(): at 01:00 in Dubai
// toISOString() is still yesterday in UTC
function localYmd(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function shiftDays(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return localYmd(date);
}

type Preset = "today" | "last7" | "last30" | "next7" | "next30";

// Ranges include today: "Last 7 days" is today and the 6 before it
function presetRange(preset: Preset): DateRange {
  switch (preset) {
    case "today":
      return { from: shiftDays(0), to: shiftDays(0) };
    case "last7":
      return { from: shiftDays(-6), to: shiftDays(0) };
    case "last30":
      return { from: shiftDays(-29), to: shiftDays(0) };
    case "next7":
      return { from: shiftDays(0), to: shiftDays(6) };
    case "next30":
      return { from: shiftDays(0), to: shiftDays(29) };
  }
}

const PRESETS: Record<"past" | "future", Preset[]> = {
  past: ["today", "last7", "last30"],
  future: ["today", "next7", "next30"],
};

export default function DateRangeFilter({
  label,
  value,
  onChange,
  presets = "past",
}: {
  label: string;
  value: DateRange;
  onChange: (value: DateRange) => void;
  presets?: "past" | "future";
}) {
  const t = useTranslations("DateRangeFilter");
  const format = useFormatter();
  const active = Boolean(value.from || value.to);

  // Read as UTC midnight and shown in UTC, so "2026-12-01" is 1 Dec in
  // every time zone
  const show = (ymd: string) =>
    format.dateTime(new Date(`${ymd}T00:00:00Z`), {
      day: "numeric",
      month: "short",
      timeZone: "UTC",
    });

  const summary = active
    ? value.from && value.to
      ? value.from === value.to
        ? show(value.from)
        : `${show(value.from)} – ${show(value.to)}`
      : value.from
        ? `${t("from")} ${show(value.from)}`
        : `${t("to")} ${show(value.to!)}`
    : label;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          aria-label={active ? `${label}: ${summary}` : label}
          className={cn(
            "max-w-64",
            active &&
              "border-primary/50 bg-primary/10 text-foreground hover:bg-primary/15",
          )}
        >
          <CalendarIcon />
          <span className="truncate">{summary}</span>
        </Button>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-72 p-3">
        <div className="grid grid-cols-2 gap-2">
          <label className="flex flex-col gap-1 text-xs text-muted-foreground">
            {t("from")}
            <Input
              type="date"
              value={value.from ?? ""}
              max={value.to ?? undefined}
              onChange={(event) =>
                onChange({ ...value, from: event.target.value || null })
              }
              className="h-8 text-xs"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-muted-foreground">
            {t("to")}
            <Input
              type="date"
              value={value.to ?? ""}
              min={value.from ?? undefined}
              onChange={(event) =>
                onChange({ ...value, to: event.target.value || null })
              }
              className="h-8 text-xs"
            />
          </label>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {PRESETS[presets].map((preset) => {
            const range = presetRange(preset);
            const selected =
              range.from === value.from && range.to === value.to;
            return (
              <Button
                key={preset}
                type="button"
                variant={selected ? "default" : "outline"}
                size="xs"
                aria-pressed={selected}
                onClick={() => onChange(range)}
              >
                {t(`presets.${preset}`)}
              </Button>
            );
          })}
        </div>

        {active && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mt-2 w-full text-muted-foreground"
            onClick={() => onChange({ from: null, to: null })}
          >
            <XIcon />
            {t("clear")}
          </Button>
        )}
      </PopoverContent>
    </Popover>
  );
}
