"use client";

import { RotateCw } from "lucide-react";
import CategoryForm from "./category-form";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getCategory } from "@/lib/actions/categories";
import type { CategoryDetail } from "@/types/categories";

type State =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; category: CategoryDetail };

// Loads one category's details the first time its row opens. The row keeps
// this mounted after closing, so edits survive collapsing it
export default function CategoryPanel({
  categoryId,
  // Known from the list; sizes the skeleton to the real form
  expectedFields,
}: {
  categoryId: number;
  expectedFields: number;
}) {
  const t = useTranslations("Cms.categories.form");
  const tCommon = useTranslations("Common");
  const [state, setState] = useState<State>({ status: "loading" });
  // Bumped by "Try again" to rerun the fetch
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;

    getCategory(categoryId).then((result) => {
      if (cancelled) return;
      setState(
        result.ok
          ? { status: "ready", category: result.data }
          : { status: "error" },
      );
    });

    return () => {
      cancelled = true;
    };
  }, [categoryId, attempt]);

  if (state.status === "error") {
    return (
      <div role="alert" className="flex items-center gap-3">
        <p className="text-xs text-destructive">{t("loadFailed")}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setState({ status: "loading" });
            setAttempt((n) => n + 1);
          }}
        >
          <RotateCw />
          {tCommon("TryAgain")}
        </Button>
      </div>
    );
  }

  if (state.status === "loading") {
    return (
      <div aria-busy className="flex flex-col gap-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_8rem]">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-9 w-full" />
            </div>
          ))}
        </div>
        <Skeleton className="h-3.5 w-28" />
        {Array.from({ length: Math.min(expectedFields, 3) || 1 }, (_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return <CategoryForm category={state.category} />;
}
