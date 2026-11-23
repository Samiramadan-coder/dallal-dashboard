"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { CircleAlertIcon, RotateCwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

// Fallback for error.tsx files. `retry` re-renders the failed segment
export default function ErrorState({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  const t = useTranslations("Common");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-lg border border-border bg-card px-6 py-12 text-center"
    >
      <span className="flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <CircleAlertIcon className="size-5" />
      </span>

      <div className="space-y-1">
        <h2 className="text-sm font-semibold text-foreground">{t("Error")}</h2>
        <p className="max-w-sm text-xs text-muted-foreground">
          {t("LoadFailed")}
        </p>
      </div>

      <Button variant="outline" size="sm" onClick={retry}>
        <RotateCwIcon />
        {t("TryAgain")}
      </Button>
    </div>
  );
}
