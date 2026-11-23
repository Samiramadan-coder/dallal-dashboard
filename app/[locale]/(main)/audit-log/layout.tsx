import PageHeader from "@/components/reusable/page-header";
import { requirePageAccess } from "@/lib/permissions";

// The header stays on screen while loading.tsx / error.tsx replace the table
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 403 without audit_logs.view
  await requirePageAccess("audit_logs");

  return (
    <>
      <PageHeader page="auditLog" />
      {children}
    </>
  );
}
