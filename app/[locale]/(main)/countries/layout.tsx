import CreateEdit from "@/components/countries/create-edit";
import PageHeader from "@/components/reusable/page-header";

// The header stays on screen while loading.tsx / error.tsx replace the table
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PageHeader page="countries" actions={<CreateEdit />} />
      {children}
    </>
  );
}
