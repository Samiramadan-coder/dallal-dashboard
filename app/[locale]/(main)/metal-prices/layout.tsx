import PageHeader from "@/components/reusable/page-header";
import PageSwitcher from "@/components/metal-prices/page-switcher";

export default function Layout({ children }: { children: React.ReactNode }) {
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
