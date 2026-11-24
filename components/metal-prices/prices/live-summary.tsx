import { Info } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";

import type { GradePrice } from "@/types/metal-prices";
import { HEADLINE_GOLD_KARATS, type PriceUnit } from "@/constants/metal-prices";

// The prices a visitor sees first (gold 24K and 22K), and whether the
// feed is keeping them up to date. `marketOpen` is one flag for every
// market: the API has no per-country hours yet
export default function LiveSummary({
  countryName,
  unit,
  prices,
  marketOpen,
  delayed,
}: {
  countryName: string;
  unit: PriceUnit;
  prices: GradePrice[];
  marketOpen: boolean;
  delayed: boolean;
}) {
  const t = useTranslations("MetalPrices.prices");
  const format = useFormatter();

  const headline = prices.filter(
    (price) =>
      price.metal === "gold" && HEADLINE_GOLD_KARATS.includes(price.karat),
  );

  return (
    <section className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
      <div>
        <h2 className="text-sm font-bold text-foreground">
          {t("summary.title")}
        </h2>
        <p className="text-xs text-muted-foreground">
          {t("summary.subtitle", {
            country: countryName,
            unit: t(`units.${unit}`),
          })}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span
          className={
            marketOpen
              ? "rounded-full bg-secondary/10 px-2.5 py-0.5 text-[11px] font-semibold text-secondary"
              : "rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground"
          }
        >
          {marketOpen ? t("summary.marketOpen") : t("summary.marketClosed")}
        </span>

        {delayed && (
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
            {t("summary.delayed")}
            <Info className="size-3" aria-label={t("summary.delayedHint")} />
          </span>
        )}
      </div>

      {headline.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {headline.map((price) => (
            <div
              key={price.karat}
              className="rounded-lg border border-border px-4 py-3"
            >
              <p className="text-xs text-muted-foreground">{price.label}</p>
              <p className="text-xl font-bold text-foreground tabular-nums">
                {format.number(price.siteAmount, {
                  style: "currency",
                  currency: price.currency,
                })}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">{t("empty")}</p>
      )}

      {delayed && (
        <p className="text-xs text-primary">{t("summary.delayedNote")}</p>
      )}
    </section>
  );
}
