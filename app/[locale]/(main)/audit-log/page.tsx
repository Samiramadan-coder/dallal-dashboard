import { getAuditLogs } from "@/lib/audit-log";
import DataPreview from "@/components/audit-log/data-preview";

type SearchParams = {
  page?: string;
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  // Access is checked by the layout
  const { page } = await searchParams;

  const { logs, pagination } = await getAuditLogs(
    Math.max(1, Number(page) || 1),
  );

  return <DataPreview logs={logs} pagination={pagination} />;
}
