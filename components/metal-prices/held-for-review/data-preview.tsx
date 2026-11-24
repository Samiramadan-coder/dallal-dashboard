import Image from "next/image";
import { cn } from "@/lib/utils";
import type { Locale } from "@/types/shared";
import type { HeldPriceRow } from "@/types/metal-prices";
import { TableCell, TableRow } from "@/components/ui/table";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { DataTable, DataTableColumn } from "@/components/reusable/data-table";

// The live price the held one would replace. The row only has the new
// price and its move in percent, so: current = new ÷ (1 + move%).
// Switch to the API's own field if the held endpoint returns one
function currentAmount(price: HeldPriceRow): number {
  return price.price_per_gram.amount / (1 + (price.change_pct ?? 0) / 100);
}

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

  const columns: DataTableColumn[] = [
    { label: t("table.metal") },
    { label: t("table.market") },
    { label: t("table.currentPrice") },
    { label: t("table.incomingPrice") },
    { label: t("table.move") },
    { label: t("table.waiting") },
  ];

  const money = (amount: number, currency: string) =>
    format.number(amount, { style: "currency", currency });

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-muted-foreground">
        {t("note", { percent: guardPercent })}
      </p>

      <DataTable
        columns={columns}
        countUnit={t("unit")}
        rowsCount={prices.length}
      >
        {prices.length === 0 && (
          <TableRow className="hover:bg-transparent">
            <TableCell
              colSpan={columns.length}
              className="py-10! text-center text-muted-foreground"
            >
              {t("empty")}
            </TableCell>
          </TableRow>
        )}

        {prices.map((price) => (
          <TableRow key={price.id}>
            <TableCell className="font-semibold text-foreground">
              {price.label}
            </TableCell>

            <TableCell>
              {price.country ? (
                <span className="flex items-center gap-1.5">
                  <Image
                    src={price.country.flag}
                    alt=""
                    width={20}
                    height={14}
                    className="h-3.5 w-5 rounded-xs object-cover"
                  />
                  {price.country.name[locale]}
                </span>
              ) : (
                "—"
              )}
            </TableCell>

            <TableCell className="tabular-nums">
              {money(currentAmount(price), price.price_per_gram.currency)}
            </TableCell>

            <TableCell className="font-semibold text-foreground tabular-nums">
              {money(
                price.price_per_gram.amount,
                price.price_per_gram.currency,
              )}
            </TableCell>

            <TableCell
              dir="ltr"
              className={cn(
                "font-semibold tabular-nums",
                (price.change_pct ?? 0) >= 0
                  ? "text-secondary"
                  : "text-destructive",
              )}
            >
              {format.number((price.change_pct ?? 0) / 100, {
                style: "percent",
                maximumFractionDigits: 2,
                signDisplay: "always",
              })}
            </TableCell>

            <TableCell className="whitespace-nowrap">
              {format.relativeTime(new Date(price.priced_at))}
            </TableCell>
          </TableRow>
        ))}
      </DataTable>
    </div>
  );
}
