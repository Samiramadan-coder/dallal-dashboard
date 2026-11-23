"use client";

import type { ReactNode } from "react";
import { ArrowUpRight, Info, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { pageGuides } from "@/constants/page-guides";
import type { PageHeaderKey } from "./page-header";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
      {children}
    </section>
  );
}

// "How does this page work?" button and the drawer it opens. Renders
// nothing for pages without a guide
export default function PageGuide({
  page,
  title,
}: {
  page: PageHeaderKey;
  title: string;
}) {
  const t = useTranslations("pageHeaders.guide");
  const tRoles = useTranslations("layout.header.roles");
  const locale = useLocale();
  const guide = pageGuides[page];

  if (!guide) return null;

  const text = (value: { en: string; ar: string }) =>
    locale === "ar" ? value.ar : value.en;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-secondary transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
        >
          <Info className="size-3.5" aria-hidden />
          {t("button")}
        </button>
      </SheetTrigger>

      <SheetContent
        side={locale === "ar" ? "left" : "right"}
        showCloseButton={false}
        className="gap-0 bg-card data-[side=left]:sm:max-w-140 data-[side=right]:sm:max-w-140"
      >
        <SheetHeader className="flex-row items-start justify-between gap-3 border-b border-border px-5 py-4">
          <div className="min-w-0">
            <SheetTitle className="text-[15px] font-bold text-foreground">
              {t("title")}
            </SheetTitle>
            <SheetDescription className="mt-0.5 text-[11px] text-muted-foreground">
              {title}
            </SheetDescription>
          </div>
          <SheetClose
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted"
            aria-label={t("close")}
          >
            <X className="size-4" />
          </SheetClose>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-5 py-4">
          <Section title={t("purpose")}>
            <p className="text-[13px] leading-relaxed text-pretty text-foreground">
              {text(guide.purpose)}
            </p>
          </Section>

          <Section title={t("whoUses")}>
            <ul className="flex flex-wrap gap-1.5">
              {guide.whoUses.map((role) => (
                <li
                  key={role}
                  className="rounded-full bg-secondary/10 px-2.5 py-1 text-[11px] font-semibold text-secondary"
                >
                  {tRoles.has(role) ? tRoles(role) : role}
                </li>
              ))}
            </ul>
          </Section>

          {guide.steps.length > 0 && (
            <Section title={t("steps")}>
              <ol className="flex flex-col gap-2.5">
                {guide.steps.map((step, index) => (
                  <li key={step.en} className="flex items-start gap-3">
                    <span
                      aria-hidden
                      className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-secondary text-[10px] font-bold tabular-nums text-card"
                    >
                      {index + 1}
                    </span>
                    <span className="text-[13px] leading-relaxed text-pretty text-foreground">
                      {text(step)}
                    </span>
                  </li>
                ))}
              </ol>
            </Section>
          )}

          {guide.rules.length > 0 && (
            <Section title={t("rules")}>
              <ul className="flex flex-col gap-2">
                {guide.rules.map((rule) => (
                  <li
                    key={rule.en}
                    className="rounded-lg bg-primary/12 px-3 py-2 text-[13px] leading-relaxed text-pretty text-foreground"
                  >
                    {text(rule)}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {guide.terms.length > 0 && (
            <Section title={t("terms")}>
              <dl className="flex flex-col gap-2.5">
                {guide.terms.map(({ term, meaning }) => (
                  <div key={term.en}>
                    <dt className="text-[13px] font-bold text-foreground">
                      {text(term)}
                    </dt>
                    <dd className="text-xs leading-relaxed text-pretty text-muted-foreground">
                      {text(meaning)}
                    </dd>
                  </div>
                ))}
              </dl>
            </Section>
          )}

          {guide.related.length > 0 && (
            <Section title={t("related")}>
              <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
                {guide.related.map((link) => (
                  <li key={link.href}>
                    <SheetClose asChild>
                      <Link
                        href={link.href}
                        className="inline-flex items-center gap-1 rounded text-xs font-semibold text-secondary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
                      >
                        {text(link.label)}
                        <ArrowUpRight
                          className="size-3 rtl:-scale-x-100"
                          aria-hidden
                        />
                      </Link>
                    </SheetClose>
                  </li>
                ))}
              </ul>
            </Section>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
