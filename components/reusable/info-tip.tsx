"use client";

import { useRef, useState } from "react";
import { Info } from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";
import { useDirection } from "@/components/ui/direction";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Logical sides, so "start"/"end" flip with the page direction
type Side = "top" | "bottom" | "start" | "end";

// A small ⓘ that explains a term next to a label, heading or column title:
//   <InfoTip content={t("summary.delayedHint")} />
// For short explanations that needn't stay on screen. Input rules ("PNG,
// up to 1MB") belong in the hint under the field instead.
// Opens on hover, keyboard focus and tap (Radix tooltips ignore touch on
// their own); closes on leave, blur, Esc or a tap outside
export default function InfoTip({
  content,
  label,
  side = "top",
  className,
}: {
  content: React.ReactNode;
  // Accessible name of the button; defaults to "More info"
  label?: string;
  side?: Side;
  className?: string;
}) {
  const t = useTranslations("Common");
  const dir = useDirection();
  const [open, setOpen] = useState(false);
  // Radix closes the tooltip on pointerdown, before the click lands, so the
  // click reads the state from just before that
  const openAtPointerDown = useRef(false);

  const physicalSide =
    side === "start"
      ? dir === "rtl"
        ? "right"
        : "left"
      : side === "end"
        ? dir === "rtl"
          ? "left"
          : "right"
        : side;

  return (
    <Tooltip open={open} onOpenChange={setOpen}>
      <TooltipTrigger
        type="button"
        aria-label={label ?? t("moreInfo")}
        className={cn(
          "inline-flex size-4 shrink-0 cursor-help items-center justify-center rounded-full text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50",
          className,
        )}
        onPointerDown={() => {
          openAtPointerDown.current = open;
        }}
        onClick={(event) => {
          // Skips Radix's close-on-click; also stops a parent form or row
          // from reacting to the press
          event.preventDefault();
          event.stopPropagation();
          // detail is 0 for Enter/Space, which have no pointerdown
          const wasOpen = event.detail === 0 ? open : openAtPointerDown.current;
          setOpen(!wasOpen);
        }}
      >
        <Info className="size-3.5" aria-hidden />
      </TooltipTrigger>
      <TooltipContent
        side={physicalSide}
        sideOffset={4}
        className="leading-relaxed text-pretty"
      >
        {content}
      </TooltipContent>
    </Tooltip>
  );
}
