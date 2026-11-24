import {
  getCountryPrices,
  getMetalSources,
  isSourceDelayed,
} from "@/lib/metal-prices";

import type { Metal } from "@/types/metal-prices";
import { requirePageAccess } from "@/lib/permissions";
import { PRICE_UNITS, isPriceUnit } from "@/constants/metal-prices";
import MetalTable from "@/components/metal-prices/prices/metal-table";
import LiveSummary from "@/components/metal-prices/prices/live-summary";
import PriceFilters from "@/components/metal-prices/prices/price-filters";
import SetManualPrice from "@/components/metal-prices/prices/set-manual-price";

const METALS: Metal[] = ["gold", "silver", "platinum"];

type SearchParams = {
  country?: string;
  unit?: string;
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  // The layout already required metal_prices.view; edit adds manual prices
  const [
    { country, unit: unitParam },
    { sources, market_open, refresh_minutes },
    { can },
  ] = await Promise.all([
    searchParams,
    getMetalSources(),
    requirePageAccess("metal_prices"),
  ]);

  const source =
    sources.find((s) => s.country.code === country?.toUpperCase()) ??
    sources[0];

  if (!source) return null;

  const unit = isPriceUnit(unitParam) ? unitParam : "gram";
  const grams = PRICE_UNITS[unit];

  // The API prices per gram; scale every amount to the chosen unit
  const perGram = await getCountryPrices(source);
  const prices = perGram.map((price) => ({
    ...price,
    baseAmount: price.baseAmount * grams,
    siteAmount: price.siteAmount * grams,
  }));

  const delayed = isSourceDelayed(source, refresh_minutes);

  return (
    <div className="flex flex-col gap-5">
      <PriceFilters
        countries={sources.map((s) => s.country)}
        country={source.country.code}
        unit={unit}
        currency={source.country.currency}
      />

      <LiveSummary
        countryName={source.country.name}
        unit={unit}
        prices={prices}
        marketOpen={market_open}
        delayed={delayed}
      />

      {METALS.map((metal) => {
        const grades = prices.filter((price) => price.metal === metal);

        return grades.length > 0 ? (
          <MetalTable
            key={metal}
            metal={metal}
            prices={grades}
            unit={unit}
            action={
              can.edit && (
                <SetManualPrice
                  // Remount per country, so the form starts fresh
                  key={source.country.id}
                  countryId={source.country.id}
                  countryName={source.country.name}
                  metal={metal}
                  grades={perGram.filter((price) => price.metal === metal)}
                />
              )
            }
          />
        ) : null;
      })}
    </div>
  );
}
