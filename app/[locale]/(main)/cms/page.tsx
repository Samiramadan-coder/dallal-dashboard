import { requirePage } from "@/lib/permissions";

export default async function Page() {
  await requirePage("cms");

  return <div>Static Pages</div>;
}
