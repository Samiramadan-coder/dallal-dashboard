import { getRoles } from "@/lib/roles";
import DataPreview from "@/components/roles/roles/data-preview";

export default async function Page() {
  const { roles, matrix } = await getRoles();

  return <DataPreview roles={roles} matrix={matrix} />;
}
