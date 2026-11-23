import { Skeleton } from "@/components/ui/skeleton";

// Placeholder shaped like DataTable, for loading.tsx files
export default function TableSkeleton({
  columns = 4,
  rows = 6,
}: {
  columns?: number;
  rows?: number;
}) {
  return (
    <div
      aria-busy
      className="w-full overflow-hidden rounded-xl border border-border bg-card"
    >
      <div className="flex gap-5 border-b border-border/60 bg-muted/60 px-4 py-3.5">
        {Array.from({ length: columns }, (_, i) => (
          <Skeleton key={i} className="h-2.5 flex-1 bg-muted-foreground/15" />
        ))}
      </div>

      {Array.from({ length: rows }, (_, row) => (
        <div
          key={row}
          className="flex gap-5 border-b border-border/50 px-4 py-4 last:border-b-0"
        >
          {Array.from({ length: columns }, (_, col) => (
            <Skeleton key={col} className="h-3 flex-1 bg-muted-foreground/10" />
          ))}
        </div>
      ))}
    </div>
  );
}
