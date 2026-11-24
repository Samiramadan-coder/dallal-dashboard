import { requirePage } from "@/lib/permissions";
import PageSwitcher from "@/components/cms/page-switcher";
import PageHeader from "@/components/reusable/page-header";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requirePage("cms");

  return (
    <div>
      <PageHeader page="cms" />

      <div className="container max-w-7xl flex flex-col gap-4">
        <PageSwitcher />

        {children}
      </div>
    </div>
  );
}
