import { requirePage } from "@/lib/permissions";
import PageHeader from "@/components/reusable/page-header";
import PagePlaceholder from "@/components/reusable/page-placeholder";

export default async function Page() {
  await requirePage("verifications");

  return (
    <>
      <PageHeader page="verifications" />
      <PagePlaceholder href="/verifications" />
    </>
  );
}
