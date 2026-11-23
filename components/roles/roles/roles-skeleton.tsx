import { Skeleton } from "@/components/ui/skeleton";
import TableSkeleton from "@/components/reusable/table-skeleton";

// Placeholder shaped like the roles page: role list + permission table
export default function RolesSkeleton() {
  return (
    <div
      aria-busy
      className="grid items-start gap-4 lg:grid-cols-[16rem_minmax(0,1fr)]"
    >
      <div className="flex flex-col gap-2">
        {Array.from({ length: 5 }, (_, i) => (
          <div
            key={i}
            className="space-y-2 rounded-xl border border-border bg-card px-4 py-3.5"
          >
            <Skeleton className="h-3.5 w-28 bg-muted-foreground/15" />
            <Skeleton className="h-2.5 w-14 bg-muted-foreground/10" />
          </div>
        ))}
      </div>

      <TableSkeleton columns={7} rows={10} />
    </div>
  );
}
