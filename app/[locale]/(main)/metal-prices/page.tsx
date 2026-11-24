import { requirePage } from "@/lib/permissions";
import { api } from "@/lib/api/client";

export default async function Page() {
  await requirePage("metalPrices");

  const prices = await api.get("/api/v1/admin/prices");

  console.log(prices);

  return <div></div>;
}
