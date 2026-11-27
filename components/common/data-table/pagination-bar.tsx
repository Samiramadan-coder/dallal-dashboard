"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type PageItem = number | "start-ellipsis" | "end-ellipsis";

// 1 … 4 5 6 … 12; every number when there are 7 pages or fewer. Always 7
// slots past that, so the bar doesn't change width while paging
export function pageItems(page: number, pageCount: number): PageItem[] {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, i) => i + 1);
  }
  if (page <= 4) return [1, 2, 3, 4, 5, "end-ellipsis", pageCount];
  if (page >= pageCount - 3) {
    return [
      1,
      "start-ellipsis",
      ...Array.from({ length: 5 }, (_, i) => pageCount - 4 + i),
    ];
  }
  return [
    1,
    "start-ellipsis",
    page - 1,
    page,
    page + 1,
    "end-ellipsis",
    pageCount,
  ];
}

// "Showing 21–40 of 312", rows-per-page and page buttons. Pure view: the
// table decides whether a change goes to the URL or to local state
export default function PaginationBar({
  page,
  pageCount,
  pageSize,
  total,
  pageSizeOptions,
  onPageChange,
  onPageSizeChange,
}: {
  // 1-based
  page: number;
  pageCount: number;
  pageSize: number;
  total: number;
  pageSizeOptions: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}) {
  const t = useTranslations("DataTable");
  const format = useFormatter();

  const pages = Math.max(1, pageCount);
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);
  // The current size stays selectable even if it isn't one of the options
  const sizes = pageSizeOptions.includes(pageSize)
    ? pageSizeOptions
    : [...pageSizeOptions, pageSize].sort((a, b) => a - b);

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-border px-4 py-3">
      <p className="text-xs text-muted-foreground">
        {t.rich("showing", {
          from: format.number(from),
          to: format.number(to),
          total: format.number(total),
          strong: (chunks) => (
            <span className="font-semibold text-foreground tabular-nums">
              {chunks}
            </span>
          ),
        })}
      </p>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="hidden sm:inline">{t("rowsPerPage")}</span>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => onPageSizeChange(Number(value))}
          >
            <SelectTrigger
              size="sm"
              aria-label={t("rowsPerPage")}
              className="min-w-16 tabular-nums"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sizes.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {format.number(size)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>

        <nav aria-label={t("pagination")} className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            aria-label={t("previousPage")}
          >
            <ChevronLeftIcon className="rtl:rotate-180" />
          </Button>

          {/* Phones: "3 / 12" instead of the numbers */}
          <span
            dir="ltr"
            className="px-2 text-xs text-muted-foreground tabular-nums sm:hidden"
          >
            {format.number(page)} / {format.number(pages)}
          </span>

          <ul className="hidden items-center gap-1 sm:flex">
            {pageItems(page, pages).map((item) =>
              typeof item === "number" ? (
                <li key={item}>
                  <Button
                    type="button"
                    variant={item === page ? "default" : "ghost"}
                    size="icon-sm"
                    aria-current={item === page ? "page" : undefined}
                    aria-label={t("goToPage", { page: item })}
                    onClick={() => item !== page && onPageChange(item)}
                    className={cn(
                      "tabular-nums",
                      item !== page && "text-muted-foreground",
                    )}
                  >
                    {format.number(item)}
                  </Button>
                </li>
              ) : (
                <li
                  key={item}
                  aria-hidden
                  className="w-7 text-center text-xs text-muted-foreground"
                >
                  …
                </li>
              ),
            )}
          </ul>

          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            disabled={page >= pages}
            onClick={() => onPageChange(page + 1)}
            aria-label={t("nextPage")}
          >
            <ChevronRightIcon className="rtl:rotate-180" />
          </Button>
        </nav>
      </div>
    </div>
  );
}
