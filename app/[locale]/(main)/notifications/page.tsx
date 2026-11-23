import { requirePage } from "@/lib/permissions";
import PageHeader from "@/components/reusable/page-header";
import PagePlaceholder from "@/components/reusable/page-placeholder";

export default async function Page() {
  await requirePage("notifications");

  return (
    <>
      <PageHeader page="notifications" />
      <PagePlaceholder href="/notifications" />
    </>
  );
}
