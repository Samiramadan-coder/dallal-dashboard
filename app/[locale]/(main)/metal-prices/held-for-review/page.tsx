import { getHeldPrices, getMetalSources } from "@/lib/metal-prices";
import DataPreview from "@/components/metal-prices/held-for-review/data-preview";

export default async function Page() {
  // Access is checked by the layout
  const [prices, sources] = await Promise.all([
    getHeldPrices(),
    getMetalSources(),
  ]);

  return <DataPreview prices={prices} guardPercent={sources.guard_percent} />;
}
