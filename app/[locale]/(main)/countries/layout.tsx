import CreateEdit from "@/components/countries/create-edit";
import PageHeader from "@/components/reusable/page-header";
import { requirePageAccess } from "@/lib/permissions";

// The header stays on screen while loading.tsx / error.tsx replace the table
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Guards every page in the section: 403 without countries.view
  const { can } = await requirePageAccess("countries");

  return (
    <>
      <PageHeader
        page="countries"
        actions={can.create ? <CreateEdit /> : undefined}
      />
      {children}
    </>
  );
}
