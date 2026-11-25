import { getRoles } from "@/lib/roles";
import { requirePageAccess } from "@/lib/permissions";
import DataPreview from "@/components/roles/roles/data-preview";

export default async function Page() {
  // Also checked by the layout; here it gives the action flags
  const [{ can }, { roles, matrix }] = await Promise.all([
    requirePageAccess("roles"),
    getRoles(),
  ]);

  console.log("Roles", roles);
  console.log("Matrix", matrix);

  return <DataPreview roles={roles} matrix={matrix} can={can} />;
}
