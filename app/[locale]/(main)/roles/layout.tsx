import PageHeader from "@/components/reusable/page-header";
import PageSwitcher from "@/components/roles/page-switcher";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PageHeader page="roles" />

      <div className="flex flex-col gap-4">
        <PageSwitcher />

        {children}
      </div>
    </>
  );
}
