"use client";

import { useMemo } from "react";
import Image from "next/image";
import type { ColumnDef } from "@tanstack/react-table";
import { CircleCheckIcon } from "lucide-react";
import { useFormatter, useLocale, useTranslations } from "next-intl";

import { cn } from "@/lib/utils";
import type { Locale } from "@/types/shared";
import type { HeldPriceRow } from "@/types/metal-prices";
import DataTable from "@/components/common/data-table/data-table";
import EmptyState from "@/components/reusable/empty-state";

// The live price the held one would replace. The row only has the new
// price and its move in percent, so: current = new ÷ (1 + move%).
// Switch to the API's own field if the held endpoint returns one
function currentAmount(price: HeldPriceRow): number {
  return price.price_per_gram.amount / (1 + (price.change_pct ?? 0) / 100);
}

// Client mode: the API sends every held price at once, so the table pages
// and sorts them itself (sorting here is real, not a placeholder)
export default function DataPreview({
  prices,
  guardPercent,
}: {
  prices: HeldPriceRow[];
  guardPercent: number;
}) {
  const locale = useLocale() as Locale;
  const format = useFormatter();
  const t = useTranslations("MetalPrices.heldForReview");

  const columns = useMemo<ColumnDef<HeldPriceRow>[]>(() => {
    const money = (amount: number, currency: string) =>
      format.number(amount, { style: "currency", currency });

    return [
      {
        accessorKey: "label",
        header: t("table.metal"),
        enableHiding: false,
        cell: ({ row }) => (
          <span className="font-semibold text-foreground">
            {row.original.label}
          </span>
        ),
      },
      {
        id: "market",
        header: t("table.market"),
        cell: ({ row }) =>
          row.original.country ? (
            <span className="flex items-center gap-1.5">
              <Image
                src={row.original.country.flag}
                alt=""
                width={20}
                height={14}
                className="h-3.5 w-5 rounded-xs object-cover"
              />
              {row.original.country.name[locale]}
            </span>
          ) : (
            "—"
          ),
      },
      {
        id: "current",
        header: t("table.currentPrice"),
        meta: { className: "tabular-nums" },
        cell: ({ row }) =>
          money(
            currentAmount(row.original),
            row.original.price_per_gram.currency,
          ),
      },
      {
        id: "incoming",
        accessorFn: (price) => price.price_per_gram.amount,
        header: t("table.incomingPrice"),
        enableSorting: true,
        meta: { className: "tabular-nums" },
        cell: ({ row }) => (
          <span className="font-semibold text-foreground">
            {money(
              row.original.price_per_gram.amount,
              row.original.price_per_gram.currency,
            )}
          </span>
        ),
      },
      {
        id: "move",
        // By size of the jump, whichever way it went
        accessorFn: (price) => Math.abs(price.change_pct ?? 0),
        header: t("table.move"),
        enableSorting: true,
        cell: ({ row }) => {
          const change = row.original.change_pct ?? 0;
          return (
            <span
              dir="ltr"
              className={cn(
                "font-semibold tabular-nums",
                change >= 0 ? "text-secondary" : "text-destructive",
              )}
            >
              {format.number(change / 100, {
                style: "percent",
                maximumFractionDigits: 2,
                signDisplay: "always",
              })}
            </span>
          );
        },
      },
      {
        id: "waiting",
        accessorFn: (price) => new Date(price.priced_at).getTime(),
        header: t("table.waiting"),
        enableSorting: true,
        cell: ({ row }) => (
          // "5 minutes ago" can tick over between server and browser render
          <span suppressHydrationWarning>
            {format.relativeTime(new Date(row.original.priced_at))}
          </span>
        ),
      },
    ];
  }, [t, format, locale]);

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-muted-foreground">
        {t("note", { percent: guardPercent })}
      </p>

      <DataTable
        data={prices}
        columns={columns}
        getRowId={(price) => String(price.id)}
        emptyState={<EmptyState icon={CircleCheckIcon} title={t("empty")} />}
      />
    </div>
  );
}
