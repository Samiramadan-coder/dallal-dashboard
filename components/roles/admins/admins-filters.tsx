"use client";

import { useState } from "react";
import { SearchIcon, XIcon } from "lucide-react";
import { debounce, useQueryStates } from "nuqs";
import { useTranslations } from "next-intl";

import { Input } from "@/components/ui/input";
import FilterTabs from "@/components/common/data-table/filter-tabs";
import {
  ADMIN_STATUS_TABS,
  RESET_PAGE,
  adminsSearchParams,
} from "./search-params";

// Every filter writes the URL with shallow: false, so the server page
// re-runs and fetches the matching rows

export function AdminsStatusTabs() {
  const t = useTranslations("Roles.admins.tabs");
  const [{ status }, setParams] = useQueryStates(adminsSearchParams, {
    shallow: false,
  });

  return (
    <FilterTabs
      tabs={ADMIN_STATUS_TABS.map((value) => ({ value, label: t(value) }))}
      value={status}
      onValueChange={(value) =>
        void setParams({
          status: value === "all" ? null : value,
          ...RESET_PAGE,
        })
      }
    />
  );
}

export function AdminsSearch() {
  const t = useTranslations("Roles.admins");
  const [{ search }, setParams] = useQueryStates(adminsSearchParams, {
    shallow: false,
  });

  // The input answers every keystroke; the URL (and the server request it
  // triggers) waits until typing pauses
  const [value, setValue] = useState(search);
  // Follow the URL when it changes from elsewhere ("Clear filters", back)
  const [lastSearch, setLastSearch] = useState(search);
  if (search !== lastSearch) {
    setLastSearch(search);
    setValue(search);
  }

  function update(next: string) {
    setValue(next);
    void setParams(
      { search: next || null, ...RESET_PAGE },
      // Clearing applies at once: no reason to keep stale results around
      { limitUrlUpdates: next ? debounce(300) : undefined },
    );
  }

  return (
    <div className="relative w-full max-w-64">
      <SearchIcon
        aria-hidden
        className="pointer-events-none absolute inset-s-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        type="search"
        value={value}
        onChange={(event) => update(event.target.value)}
        placeholder={t("searchPlaceholder")}
        aria-label={t("searchPlaceholder")}
        className="h-8 ps-8 pe-8 text-xs [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={() => update("")}
          aria-label={t("clearSearch")}
          className="absolute inset-e-1.5 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded text-muted-foreground transition-colors hover:text-foreground"
        >
          <XIcon className="size-3.5" />
        </button>
      )}
    </div>
  );
}
