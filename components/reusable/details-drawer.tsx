"use client";

import type { ReactNode } from "react";
import { CircleAlertIcon, Eye, RotateCwIcon, X } from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";
import { useDirection } from "@/components/ui/direction";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

// Side panel with one record's details, shared by every module:
//   <DetailsDrawer title={store.name} description={`#${store.id}`}>
//     <DrawerSection title="Owner">
//       <DrawerDetails>
//         <DrawerDetail label="Email">{store.email}</DrawerDetail>
//       </DrawerDetails>
//     </DrawerSection>
//   </DetailsDrawer>
// Opens from the end side (opposite the sidebar) in both directions. The
// body scrolls on its own; the header and footer stay put.
// For data loaded on open, pass `status` and `onRetry`; children render only
// when it's "ready"
export default function DetailsDrawer({
  title,
  description,
  headerActions,
  footer,
  trigger,
  open,
  onOpenChange,
  size = "md",
  status = "ready",
  onRetry,
  className,
  children,
}: {
  title: ReactNode;
  // Under the title, e.g. the record's id
  description?: ReactNode;
  // Next to the close button, e.g. a status badge or an edit button
  headerActions?: ReactNode;
  // Pinned under the body, e.g. approve / reject buttons
  footer?: ReactNode;
  // Defaults to an eye "View details" button. null for a drawer opened only
  // through `open`
  trigger?: ReactNode | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  // "lg" for wide content like before/after diffs
  size?: "md" | "lg";
  status?: "ready" | "loading" | "error";
  onRetry?: () => void;
  className?: string;
  children?: ReactNode;
}) {
  const t = useTranslations("Common");
  const dir = useDirection();

  const defaultTrigger = (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label={t("drawer.open")}
      title={t("drawer.open")}
      className="text-muted-foreground hover:text-foreground [&_svg]:size-3.5"
    >
      <Eye />
    </Button>
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {trigger !== null && (
        <SheetTrigger asChild>{trigger ?? defaultTrigger}</SheetTrigger>
      )}

      <SheetContent
        side={dir === "rtl" ? "left" : "right"}
        showCloseButton={false}
        className={cn(
          "gap-0 bg-card",
          size === "lg"
            ? "data-[side=left]:sm:max-w-140 data-[side=right]:sm:max-w-140"
            : "data-[side=left]:sm:max-w-md data-[side=right]:sm:max-w-md",
          className,
        )}
      >
        <SheetHeader className="flex-row items-start justify-between gap-3 border-b border-border px-5 py-4">
          <div className="min-w-0">
            <SheetTitle className="text-[15px] font-bold text-foreground">
              {title}
            </SheetTitle>
            {/* Radix warns without a description; an empty one keeps it quiet */}
            <SheetDescription
              className={cn(
                "mt-0.5 text-[11px] text-muted-foreground",
                !description && "sr-only",
              )}
            >
              {description ?? title}
            </SheetDescription>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            {headerActions}
            <SheetClose
              className="rounded-lg p-1.5 text-muted-foreground transition-colors outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50"
              aria-label={t("drawer.close")}
            >
              <X className="size-4" />
            </SheetClose>
          </div>
        </SheetHeader>

        <div
          className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-5 py-4"
          aria-busy={status === "loading" || undefined}
        >
          {status === "loading" ? (
            <DrawerSkeleton />
          ) : status === "error" ? (
            <div
              role="alert"
              className="flex flex-1 flex-col items-center justify-center gap-3 py-10 text-center"
            >
              <span className="flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <CircleAlertIcon className="size-5" aria-hidden />
              </span>
              <p className="max-w-xs text-xs text-muted-foreground">
                {t("LoadFailed")}
              </p>
              {onRetry && (
                <Button variant="outline" size="sm" onClick={onRetry}>
                  <RotateCwIcon />
                  {t("TryAgain")}
                </Button>
              )}
            </div>
          ) : (
            children
          )}
        </div>

        {footer && status === "ready" && (
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-border px-5 py-3">
            {footer}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function DrawerSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-x-4 gap-y-4">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="flex flex-col gap-1.5">
            <Skeleton className="h-2.5 w-16" />
            <Skeleton className="h-3.5 w-28" />
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-2.5 w-20" />
        <Skeleton className="h-16 w-full" />
      </div>
    </div>
  );
}

// A titled block inside the drawer body
export function DrawerSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-2.5">
      <h3 className="text-[11px] font-bold tracking-wide text-muted-foreground uppercase">
        {title}
      </h3>
      {children}
    </section>
  );
}

// Two-column grid of DrawerDetail items
export function DrawerDetails({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <dl className={cn("grid grid-cols-2 gap-x-4 gap-y-3", className)}>
      {children}
    </dl>
  );
}

// One label / value pair; `className="col-span-2"` for full-width values
export function DrawerDetail({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-0.5", className)}>
      <dt className="text-[11px] text-muted-foreground">{label}</dt>
      <dd className="text-[13px] text-foreground">{children}</dd>
    </div>
  );
}
