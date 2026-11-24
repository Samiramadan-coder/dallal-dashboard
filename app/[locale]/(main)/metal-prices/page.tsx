import {
  getCountryPrices,
  getMetalSources,
  isSourceDelayed,
  toUnit,
} from "@/lib/metal-prices";

import { getTranslations } from "next-intl/server";
import { requirePageAccess } from "@/lib/permissions";
import { METALS, isPriceUnit } from "@/constants/metal-prices";
import MetalTable from "@/components/metal-prices/prices/metal-table";
import LiveSummary from "@/components/metal-prices/prices/live-summary";
import PriceFilters from "@/components/metal-prices/prices/price-filters";
import SetManualPrice from "@/components/metal-prices/prices/set-manual-price";

type SearchParams = {
  // Country code, e.g. "AE"; the first source when missing or unknown
  country?: string;
  // A PRICE_UNITS key; grams when missing or unknown
  unit?: string;
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  // The layout already required metal_prices.view; `can.edit` decides
  // whether the "Set manual price" buttons show
  const [
    { country, unit: unitParam },
    { sources, market_open, refresh_minutes },
    { can },
    t,
  ] = await Promise.all([
    searchParams,
    getMetalSources(),
    requirePageAccess("metal_prices"),
    getTranslations("MetalPrices.prices"),
  ]);

  const source =
    sources.find((s) => s.country.code === country?.toUpperCase()) ??
    sources[0];

  // No country has a price source yet
  if (!source) {
    return <p className="text-sm text-muted-foreground">{t("noSources")}</p>;
  }

  const unit = isPriceUnit(unitParam) ? unitParam : "gram";

  // The manual price form works per gram (what the API takes); everything
  // shown on the page is in the chosen unit
  const perGram = await getCountryPrices(source);
  const prices = toUnit(perGram, unit);

  return (
    <div className="flex flex-col gap-5">
      <PriceFilters
        countries={sources.map((s) => s.country)}
        country={source.country.code}
        unit={unit}
      />

      <LiveSummary
        countryName={source.country.name}
        unit={unit}
        prices={prices}
        marketOpen={market_open}
        delayed={isSourceDelayed(source, refresh_minutes)}
      />

      {METALS.map((metal) => {
        const grades = prices.filter((price) => price.metal === metal);
        if (grades.length === 0) return null;

        return (
          <MetalTable
            key={metal}
            metal={metal}
            prices={grades}
            unit={unit}
            action={
              can.edit && (
                <SetManualPrice
                  // A new country is a new form: no values carried over
                  key={source.country.id}
                  countryId={source.country.id}
                  countryName={source.country.name}
                  metal={metal}
                  grades={perGram.filter((price) => price.metal === metal)}
                />
              )
            }
          />
        );
      })}
    </div>
  );
}
