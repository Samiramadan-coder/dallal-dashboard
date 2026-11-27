import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { dynamicMessages } from "@/lib/dynamic-messages";

import { cn } from "@/lib/utils";
import {
  STATUS_TONES,
  type KnownStatus,
  type StatusTone,
} from "@/constants/statuses";

const TONE_CLASSES: Record<StatusTone, { pill: string; dot: string }> = {
  success: { pill: "bg-secondary/10 text-secondary", dot: "bg-secondary" },
  warning: { pill: "bg-primary/15 text-primary", dot: "bg-primary" },
  danger: { pill: "bg-destructive/10 text-destructive", dot: "bg-destructive" },
  neutral: {
    pill: "bg-muted text-muted-foreground",
    dot: "bg-muted-foreground/60",
  },
};

function humanize(value: string): string {
  const words = value.replace(/[_-]+/g, " ").trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

// One pill for every status in the dashboard:
//   <StatusBadge status={admin.is_active ? "active" : "inactive"} />
//   <StatusBadge status={country.status} />
// The colour comes from constants/statuses and the text from
// messages → Common.status. `label` overrides the text (e.g. the API's own
// status_label); children go after it (e.g. a help icon)
export default function StatusBadge({
  status,
  label,
  className,
  children,
}: {
  // Any string, so an unexpected API value still renders (neutral)
  status: KnownStatus | (string & {});
  label?: string;
  className?: string;
  children?: ReactNode;
}) {
  // `status` is whatever the API sent, known or not
  const t = dynamicMessages(useTranslations("Common.status"));

  const tone: StatusTone =
    STATUS_TONES[status as KnownStatus] ?? "neutral";
  const text = label ?? (t.has(status) ? t(status) : humanize(status));
  const classes = TONE_CLASSES[tone];

  return (
    <span
      data-status={status}
      data-tone={tone}
      className={cn(
        "inline-flex w-fit shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium [&_svg]:size-3",
        classes.pill,
        className,
      )}
    >
      <span aria-hidden className={cn("size-1.5 rounded-full", classes.dot)} />
      {text}
      {children}
    </span>
  );
}
