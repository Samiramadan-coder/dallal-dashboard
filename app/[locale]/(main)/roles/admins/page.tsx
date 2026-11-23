import DataPreview from "@/components/roles/admins/data-preview";
import { api } from "@/lib/api/client";

export default async function Page() {
  const admins = await api.get("/api/v1/admin/admins");

  console.log(admins);
  return <DataPreview />;
}
