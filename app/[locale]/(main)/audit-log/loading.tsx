import TableSkeleton from "@/components/common/data-table/table-skeleton";

export default function Loading() {
  return <TableSkeleton rows={8} action={false} />;
}
