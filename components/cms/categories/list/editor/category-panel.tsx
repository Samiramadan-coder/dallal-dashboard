"use client";

import { RotateCw } from "lucide-react";
import TypesSection from "./types-section";
import { useTranslations } from "next-intl";
import FieldsSection from "./fields-section";
import DetailsSection from "./details-section";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getCategory } from "@/lib/actions/categories";
import { useCallback, useEffect, useState } from "react";
import type { CategoryDetail } from "@/types/categories";

type State =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; category: CategoryDetail };

// A category's editor, loaded the first time its row opens. The row keeps
// this mounted after closing, so unsaved edits survive collapsing it.
// Three sections, each saved on its own: details, types and fields
export default function CategoryPanel({
  categoryId,
  // Known from the list; sizes the skeleton to the real editor
  expectedFields,
}: {
  categoryId: number;
  expectedFields: number;
}) {
  const t = useTranslations("Cms.categories.form");
  const tCommon = useTranslations("Common");
  const [state, setState] = useState<State>({ status: "loading" });
  // Bumped by "Try again" to rerun the first load
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;

    // useEffect can't take an async callback, so it runs one inside
    async function load() {
      const result = await getCategory(categoryId);
      if (cancelled) return;

      setState(
        result.ok
          ? { status: "ready", category: result.data }
          : { status: "error" },
      );
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [categoryId, attempt]);

  // After types or fields are created: refresh the saved lists. A failed
  // reload keeps what's shown rather than replacing it with an error
  const reload = useCallback(async () => {
    const result = await getCategory(categoryId);
    if (result.ok) setState({ status: "ready", category: result.data });
    return result.ok;
  }, [categoryId]);

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
      <div aria-busy className="flex flex-col gap-4">
        <Skeleton className="h-56 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton
          className="w-full rounded-xl"
          style={{ height: `${Math.min(expectedFields, 4) * 3 + 6}rem` }}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <DetailsSection category={state.category} />
      <TypesSection category={state.category} reload={reload} />
      <FieldsSection category={state.category} reload={reload} />
    </div>
  );
}
