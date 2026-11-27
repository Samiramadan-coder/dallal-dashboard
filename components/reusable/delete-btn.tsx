"use client";

import { Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "../ui/button";
import ConfirmDialog from "./confirm-dialog";

// Trash button that asks for confirmation and a reason (for the audit log)
// before deleting. `onDelete` gets the reason and returns false to keep the
// dialog open, e.g. when the API refused
export default function DeleteBtn({
  onDelete,
}: {
  onDelete: (reason: string) => Promise<boolean | void>;
}) {
  const t = useTranslations("Common");

  return (
    <ConfirmDialog
      tone="destructive"
      icon={Trash2}
      title={t("DeleteTitle")}
      description={t("DeleteConfirmation")}
      confirmLabel={t("Delete")}
      onConfirm={onDelete}
      trigger={
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={t("Delete")}
          className="text-destructive/80 hover:bg-destructive/10 hover:text-destructive [&_svg]:size-3.5"
        >
          <Trash2 />
        </Button>
      }
    />
  );
}
