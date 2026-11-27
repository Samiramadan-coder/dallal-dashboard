"use client";

import { useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { XIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { usePathname, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

// Drops every search param (filters and page) except `keep`, e.g. a tab
export default function ClearFiltersButton({
  keep = [],
}: {
  keep?: readonly string[];
}) {
  const t = useTranslations("Common.empty");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  function clear() {
    const query = Object.fromEntries(
      [...searchParams.entries()].filter(([key]) => keep.includes(key)),
    );
    startTransition(() => router.replace({ pathname, query }));
  }

  return (
    <Button variant="outline" size="sm" onClick={clear} disabled={pending}>
      {pending ? <Spinner /> : <XIcon />}
      {t("clearFilters")}
    </Button>
  );
}
