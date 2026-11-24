"use client";

import { useTranslations } from "next-intl";
import CategoriesList from "./list/categories-list";
import type { Category, MarketRule } from "@/types/categories";
import type { Country } from "@/types/countries";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MarketRules from "./market-rules/market-rules";

const SECTIONS = [
  "categoriesAndFields",
  "marketRules",
  "bannedKeywords",
  "luxuryWatchBrands",
] as const;

export default function SectionsSwitcher({
  categories,
  countries,
  marketRules,
}: {
  categories: Category[];
  countries: Country[];
  marketRules: MarketRule[];
}) {
  const t = useTranslations("Cms.categories.sections");

  return (
    <Tabs defaultValue={SECTIONS[0]} className="gap-4">
      <TabsList
        variant="line"
        aria-label={t("label")}
        className="h-auto group-data-horizontal/tabs:h-auto w-full justify-start overflow-x-auto overflow-y-hidden rounded-none p-0 shadow-[inset_0_-1px_0_var(--color-border)]"
      >
        {SECTIONS.map((section) => (
          <TabsTrigger
            key={section}
            value={section}
            className="h-auto flex-none px-3 pt-1 pb-3 text-muted-foreground data-active:text-secondary dark:data-active:text-secondary after:bg-secondary group-data-horizontal/tabs:after:-bottom-px"
          >
            {t(section)}
          </TabsTrigger>
        ))}
      </TabsList>

      {/* Each section's content goes here */}
      <TabsContent value="categoriesAndFields">
        <CategoriesList categories={categories} />
      </TabsContent>

      <TabsContent value="marketRules">
        <MarketRules
          categories={categories}
          countries={countries}
          rules={marketRules}
        />
      </TabsContent>

      <TabsContent value="bannedKeywords">3</TabsContent>
      <TabsContent value="luxuryWatchBrands">4</TabsContent>
    </Tabs>
  );
}
