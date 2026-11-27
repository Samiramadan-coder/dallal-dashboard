import { getCategories } from "@/lib/categories";
import { getCountries } from "@/lib/countries";
import { getMarketRules } from "@/lib/market-rules";
import { getBannedWords } from "@/lib/banned-words";
import SectionsSwitcher from "@/components/cms/categories/sections-switcher";

export default async function Page() {
  // The countries list is paginated; its first page holds every country so far
  const [categories, marketRules, { countries }, bannedWords] =
    await Promise.all([
      getCategories(),
      getMarketRules(),
      getCountries({ page: 1 }),
      getBannedWords(),
    ]);

  return (
    <SectionsSwitcher
      categories={categories}
      countries={countries}
      marketRules={marketRules}
      bannedWords={bannedWords}
    />
  );
}
