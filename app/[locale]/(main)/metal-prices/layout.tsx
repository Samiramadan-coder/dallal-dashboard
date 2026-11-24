import { requirePage } from "@/lib/permissions";
import PageHeader from "@/components/reusable/page-header";
import PageSwitcher from "@/components/metal-prices/page-switcher";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requirePage("metalPrices");

  return (
    <div>
      <PageHeader page="metalPrices" />

      <div className="flex flex-col gap-4">
        <PageSwitcher />

        {children}
      </div>
    </div>
  );
}
