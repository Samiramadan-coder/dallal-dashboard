import { cloneElement, isValidElement, type ReactElement } from "react";
import { Construction } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { navigation } from "@/constants/dashboard-layout";

// Stand-in for a page that isn't built yet. Name and icon come from the
// sidebar entry for `href`, so they always match the menu
export default async function PagePlaceholder({ href }: { href: string }) {
  const t = await getTranslations("layout");
  const item = navigation().find(
    (entry) => entry.type === "link" && entry.href === href,
  );
  const icon = item?.type === "link" ? item.icon : null;

  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-dashed border-primary/40 bg-card px-6 py-14 text-center">
        {/* Soft brand glow behind the icon */}
        <div className="pointer-events-none absolute inset-x-0 -top-24 mx-auto size-64 rounded-full bg-secondary/10 blur-3xl" />

        <div className="relative mx-auto flex size-16 items-center justify-center rounded-2xl bg-secondary text-primary shadow-sm">
          {isValidElement(icon)
            ? cloneElement(icon as ReactElement<{ className?: string }>, {
                className: "size-7",
              })
            : null}
        </div>

        <span className="relative mt-6 inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
          <Construction className="size-3.5" />
          {t("placeholder.badge")}
        </span>

        {item && (
          <h1 className="relative mt-4 text-2xl font-bold text-foreground">
            {t(item.label)}
          </h1>
        )}

        <p className="relative mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
          {t("placeholder.description")}
        </p>

        <div className="relative mx-auto mt-8 flex max-w-xs flex-col gap-2.5">
          <div className="h-2.5 w-full rounded-full bg-muted" />
          <div className="mx-auto h-2.5 w-4/5 rounded-full bg-muted" />
          <div className="mx-auto h-2.5 w-3/5 rounded-full bg-muted" />
        </div>
      </div>
    </div>
  );
}
