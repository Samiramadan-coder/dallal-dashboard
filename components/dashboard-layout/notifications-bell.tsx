"use client";

import { Bell } from "lucide-react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";

// Header shortcut to the notifications page. `count` is the unread number;
// the dot is hidden while there's none (or no API for it yet)
export default function NotificationsBell({ count = 0 }: { count?: number }) {
  const t = useTranslations("layout.header");
  const label =
    count > 0 ? t("notificationsUnread", { count }) : t("notifications");

  return (
    <Link
      href="/notifications"
      aria-label={label}
      title={label}
      className="relative flex size-8 items-center justify-center rounded-lg text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-secondary/40"
    >
      <Bell className="size-4" aria-hidden />
      {count > 0 && (
        <span className="absolute -top-0.5 -end-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-bold leading-none text-card">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
