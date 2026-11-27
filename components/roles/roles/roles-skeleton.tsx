import { Skeleton } from "@/components/ui/skeleton";

// Action columns of the permission matrix (view, create, edit, …)
const ACTION_COLUMNS = 6;
const SECTION_ROWS = 10;

// Placeholder shaped like the roles page: the role list, then the selected
// role's panel (its header and the permission matrix: a section name per
// row and a checkbox per action)
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

      <div className="min-w-0 overflow-hidden rounded-xl border border-border bg-card">
        {/* Role name, description and buttons */}
        <div className="flex items-start justify-between gap-4 px-5 py-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-36 bg-muted-foreground/15" />
            <Skeleton className="h-2.5 w-56 max-w-full bg-muted-foreground/10" />
          </div>
          <Skeleton className="h-8 w-24 rounded-lg bg-muted-foreground/10" />
        </div>

        {/* Matrix: header row, then one row per section */}
        <div className="overflow-hidden">
          <div className="flex items-center gap-4 border-y border-border/60 bg-muted/60 px-4 py-3">
            <Skeleton className="h-2.5 w-20 shrink-0 bg-muted-foreground/15" />
            <div className="flex flex-1 justify-around gap-4">
              {Array.from({ length: ACTION_COLUMNS }, (_, i) => (
                <Skeleton key={i} className="h-2.5 w-10 bg-muted-foreground/15" />
              ))}
            </div>
          </div>

          {Array.from({ length: SECTION_ROWS }, (_, row) => (
            <div
              key={row}
              className="flex items-center gap-4 border-b border-border/50 px-4 py-3 last:border-b-0"
            >
              <Skeleton className="h-3 w-28 shrink-0 bg-muted-foreground/10" />
              <div className="flex flex-1 justify-around gap-4">
                {Array.from({ length: ACTION_COLUMNS }, (_, col) => (
                  <Skeleton
                    key={col}
                    className="size-4 rounded-[4px] bg-muted-foreground/10"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
