import { Skeleton } from "@/components/ui/skeleton";

// Placeholder shaped like a DataTable page, for loading.tsx files: the
// action row above the card, then tabs, toolbar, rows and pagination
export default function TableSkeleton({
  rows = 5,
  tabs = false,
  summary = false,
  action = true,
}: {
  rows?: number;
  // false when the page has no button above the table (it's in the header)
  action?: boolean;
  // A FilterTabs bar in the header slot
  tabs?: boolean;
  // Text at the start of the action row (e.g. "312 admins")
  summary?: boolean;
}) {
  return (
    <div aria-busy className="flex flex-col gap-3">
      {(action || summary) && (
        <div className="flex items-center justify-between gap-3">
          {summary ? <Skeleton className="h-4 w-32" /> : <span />}
          {action && <Skeleton className="h-8 w-28 rounded-lg" />}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {tabs && (
          <div className="flex gap-1.5 border-b border-border px-4 py-2.5">
            {["w-16", "w-20", "w-18"].map((width) => (
              <Skeleton key={width} className={`h-8 rounded-full ${width}`} />
            ))}
          </div>
        )}

        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <Skeleton className="h-8 w-full max-w-64 rounded-lg" />
          <Skeleton className="size-7 rounded-lg" />
        </div>

        {Array.from({ length: rows }, (_, row) => (
          <div
            key={row}
            className="flex items-center gap-4 border-b border-border/60 px-4 py-3.5"
          >
            <Skeleton className="size-8 shrink-0 rounded-lg" />
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <Skeleton className="h-3 w-40 max-w-full" />
              <Skeleton className="h-2.5 w-28 max-w-full" />
            </div>
            <Skeleton className="hidden h-3 w-24 md:block" />
            <Skeleton className="hidden h-3 w-20 md:block" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        ))}

        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <Skeleton className="h-3 w-36" />
          <div className="flex gap-1">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="size-7 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
