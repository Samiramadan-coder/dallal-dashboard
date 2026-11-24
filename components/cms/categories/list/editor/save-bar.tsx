"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

// Discard / Save at the end of a section's form. Only shown while there's
// something to save, so a clean section stays quiet
export default function SaveBar({
  isDirty,
  isSubmitting,
  onDiscard,
}: {
  isDirty: boolean;
  isSubmitting: boolean;
  onDiscard: () => void;
}) {
  const t = useTranslations("Cms.categories.form");

  if (!isDirty && !isSubmitting) return null;

  return (
    <div className="flex flex-wrap items-center justify-end gap-2 rounded-lg bg-secondary/5 px-3 py-2">
      <p className="me-auto text-xs font-medium text-secondary">
        {t("unsaved")}
      </p>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={isSubmitting}
        onClick={onDiscard}
      >
        {t("discard")}
      </Button>
      <Button
        type="submit"
        size="sm"
        disabled={isSubmitting}
        className="bg-secondary text-primary-foreground hover:bg-secondary/90"
      >
        {isSubmitting && <Spinner />}
        {t("save")}
      </Button>
    </div>
  );
}
