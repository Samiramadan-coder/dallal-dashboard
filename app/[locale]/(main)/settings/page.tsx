import PageHeader from "@/components/reusable/page-header";
import PagePlaceholder from "@/components/reusable/page-placeholder";

export default function Page() {
  return (
    <>
      <PageHeader page="settings" />
      <PagePlaceholder href="/settings" />
    </>
  );
}
