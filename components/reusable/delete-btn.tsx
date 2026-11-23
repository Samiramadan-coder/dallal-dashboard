"use client";

import {
  Dialog,
  DialogClose,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogTrigger,
  DialogDescription,
} from "../ui/dialog";
import { useRef } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";
import { useTranslations } from "next-intl";

export default function DeleteBtn({
  onDelete,
  loading,
}: {
  loading?: boolean;
  onDelete?: () => Promise<void>;
}) {
  const t = useTranslations("Common");
  const closeBtn = useRef<HTMLButtonElement>(null);

  const handleDelete = async () => {
    await onDelete?.();
    closeBtn.current?.click();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={t("Delete")}
          className="text-destructive/80 hover:bg-destructive/10 hover:text-destructive [&_svg]:size-3.5"
        >
          <Trash2 />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogClose asChild>
          <Button className="hidden" ref={closeBtn}></Button>
        </DialogClose>
        <DialogHeader>
          <DialogTitle className="text-destructive">{t("Delete")}</DialogTitle>
          <DialogDescription>{t("DeleteConfirmation")}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-end">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              {t("Cancel")}
            </Button>
          </DialogClose>
          <Button type="button" variant="destructive" onClick={handleDelete}>
            {loading ? <Spinner /> : t("Confirmation")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
