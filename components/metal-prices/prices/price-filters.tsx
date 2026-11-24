"use client";

import { useId } from "react";
import { useSearchParams } from "next/navigation";
import { useFormatter, useNow, useTranslations } from "next-intl";

import { usePathname, useRouter } from "@/i18n/navigation";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MARKET_TIME_ZONES,
  PRICE_UNITS,
  type PriceUnit,
} from "@/constants/metal-prices";
import type { MetalSource } from "@/types/metal-prices";

// Market and unit live in the URL (?country=AE&unit=tola), so the server
// page renders the matching prices
export default function PriceFilters({
  countries,
  country,
  unit,
  currency,
}: {
  countries: MetalSource["country"][];
  country: string;
  unit: PriceUnit;
  currency: string;
}) {
  const id = useId();
  const format = useFormatter();
  const t = useTranslations("MetalPrices.prices.filters");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // Re-renders every minute so the clock stays current
  const now = useNow({ updateInterval: 60_000 });

  const update = (key: "country" | "unit", value: string) => {
    const query = Object.fromEntries(searchParams.entries());
    router.replace({ pathname, query: { ...query, [key]: value } });
  };

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <div className="flex items-center gap-2">
        <Label
          htmlFor={`${id}-market`}
          className="text-xs text-muted-foreground"
        >
          {t("market")}
        </Label>
        <Select value={country} onValueChange={(v) => update("country", v)}>
          <SelectTrigger id={`${id}-market`} className="h-9 w-52 bg-card">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {countries.map((c) => (
              <SelectItem key={c.id} value={c.code}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Label htmlFor={`${id}-unit`} className="text-xs text-muted-foreground">
          {t("unit")}
        </Label>
        <Select value={unit} onValueChange={(v) => update("unit", v)}>
          <SelectTrigger id={`${id}-unit`} className="h-9 w-36 bg-card">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(PRICE_UNITS) as PriceUnit[]).map((u) => (
              <SelectItem key={u} value={u}>
                {t(`units.${u}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <p className="text-xs text-muted-foreground">
        {t("note", {
          currency,
          time: format.dateTime(now, {
            hour: "2-digit",
            minute: "2-digit",
            hourCycle: "h23",
            timeZone: MARKET_TIME_ZONES[country],
          }),
        })}
      </p>
    </div>
  );
}
