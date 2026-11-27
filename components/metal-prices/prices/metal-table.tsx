"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useFormatter, useTranslations } from "next-intl";

import DataTable from "@/components/common/data-table/data-table";
import type { GradePrice, Metal } from "@/types/metal-prices";
import type { PriceUnit } from "@/constants/metal-prices";

// "24" → "24K" for gold; silver and platinum grades are fineness, e.g. "999"
function gradeName(metal: Metal, karat: string) {
  return metal === "gold" ? `${karat}K` : karat;
}

// One metal's grades: feed price, the country margin on top, and the
// result the site shows. Amounts are already in `unit`
export default function MetalTable({
  metal,
  prices,
  unit,
  action,
}: {
  metal: Metal;
  prices: GradePrice[];
  unit: PriceUnit;
  // e.g. the "Set manual price" button
  action?: React.ReactNode;
}) {
  const t = useTranslations("MetalPrices.prices");
  const format = useFormatter();

  const money = (amount: number, currency: string) =>
    format.number(amount, { style: "currency", currency });

  // A few grades per metal: no paging, no settings menu, just the rows
  const columns = useMemo<ColumnDef<GradePrice>[]>(() => {
    const cash = (amount: number, currency: string) =>
      format.number(amount, { style: "currency", currency });
    const unitLabel = t(`units.${unit}`);

    return [
      {
        id: "grade",
        header: t("table.grade"),
        cell: ({ row }) => (
          <span className="font-semibold text-foreground">
            {gradeName(row.original.metal, row.original.karat)}
          </span>
        ),
      },
      {
        id: "base",
        header: t("table.basePrice"),
        meta: { className: "tabular-nums" },
        cell: ({ row }) => (
          <>
            {cash(row.original.baseAmount, row.original.currency)}{" "}
            <span className="text-muted-foreground">{unitLabel}</span>
          </>
        ),
      },
      {
        id: "margin",
        header: t("table.margin"),
        meta: { className: "tabular-nums" },
        cell: ({ row }) =>
          format.number(row.original.margin / 100, {
            style: "percent",
            maximumFractionDigits: 2,
          }),
      },
      {
        id: "site",
        header: t("table.sitePrice", { unit: unitLabel }),
        meta: { className: "tabular-nums" },
        cell: ({ row }) => (
          <span className="font-bold text-foreground">
            {cash(row.original.siteAmount, row.original.currency)}
          </span>
        ),
      },
    ];
  }, [t, format, unit]);

  // "Feed price (pure)" is the base price of the purest grade (24K, 999):
  // it has no alloy, so it is the metal's own price. The API only gives the
  // world price in USD per ounce, with no exchange rate to convert it
  const pure = prices.reduce((a, b) =>
    Number(b.karat) > Number(a.karat) ? b : a,
  );

  return (
    <section className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <h3 className="text-sm font-bold text-foreground">
            {t(`metals.${metal}`)}
          </h3>
          <p className="text-xs text-muted-foreground">
            {t("feedPrice", {
              price: money(pure.baseAmount, pure.currency),
              unit: t(`units.${unit}`),
            })}
          </p>
        </div>

        {action}
      </div>

      <DataTable
        data={prices}
        columns={columns}
        getRowId={(price) => price.karat}
        paginated={false}
        settings={false}
      />
    </section>
  );
}
