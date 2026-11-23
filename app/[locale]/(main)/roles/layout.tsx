import PageHeader from "@/components/reusable/page-header";
import PageSwitcher from "@/components/roles/page-switcher";
import { hasPermission, requirePageAccess } from "@/lib/permissions";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Guards every page in the section: 403 without roles.view.
  // /roles/admins also needs admins.view (checked by its page)
  const { admin } = await requirePageAccess("roles");

  return (
    <>
      <PageHeader page="roles" />

      <div className="flex flex-col gap-4">
        <PageSwitcher
          showAdmins={hasPermission(admin.permissions, "admins.view")}
        />

        {children}
      </div>
    </>
  );
}
