import { useFormatter, useTranslations } from "next-intl";

import { TableCell, TableRow } from "@/components/ui/table";
import { DataTable, DataTableColumn } from "@/components/reusable/data-table";
import type { GradePrice, Metal } from "@/types/metal-prices";
import type { PriceUnit } from "@/constants/metal-prices";

// "24" → "24K" for gold; silver and platinum grades are fineness, e.g. "999"
function gradeName(metal: Metal, karat: string) {
  return metal === "gold" ? `${karat}K` : karat;
}

// One metal's grades: feed price, the country margin on top, and the result
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

  const columns: DataTableColumn[] = [
    { label: t("table.grade") },
    { label: t("table.basePrice") },
    { label: t("table.margin") },
    { label: t("table.sitePrice", { unit: t(`units.${unit}`) }) },
  ];

  // The purest grade has no alloy, so its feed price is the metal's own
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

      <DataTable columns={columns} countUnit="" rowsCount={prices.length}>
        {prices.map((price) => (
          <TableRow key={price.karat}>
            <TableCell className="font-semibold text-foreground">
              {gradeName(price.metal, price.karat)}
            </TableCell>

            <TableCell className="tabular-nums">
              {money(price.baseAmount, price.currency)}{" "}
              <span className="text-muted-foreground">
                {t(`units.${unit}`)}
              </span>
            </TableCell>

            <TableCell className="tabular-nums">
              {format.number(price.margin / 100, {
                style: "percent",
                maximumFractionDigits: 2,
              })}
            </TableCell>

            <TableCell className="font-bold text-foreground tabular-nums">
              {money(price.siteAmount, price.currency)}
            </TableCell>
          </TableRow>
        ))}
      </DataTable>
    </section>
  );
}
