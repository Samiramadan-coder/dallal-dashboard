import PageHeader from "@/components/reusable/page-header";
import PageSwitcher from "@/components/metal-prices/page-switcher";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <PageHeader page="metalPrices" />

      <PageSwitcher />

      {children}
    </div>
  );
}
