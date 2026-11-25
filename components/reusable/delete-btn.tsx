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

      <DialogContent
        showCloseButton={false}
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="gap-5 p-6 ring-0 sm:max-w-sm"
      >
        <DialogClose asChild>
          <Button className="hidden" ref={closeBtn}></Button>
        </DialogClose>
        <DialogHeader className="items-center gap-3 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 ring-8 ring-destructive/5">
            <Trash2 className="size-5 text-destructive" />
          </div>
          <DialogTitle className="mt-1 text-lg font-semibold">
            {t("DeleteTitle")}
          </DialogTitle>
          <DialogDescription className="leading-relaxed">
            {t("DeleteConfirmation")}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mx-0 mb-0 grid grid-cols-2 gap-3 rounded-none border-0 bg-transparent p-0">
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              size="lg"
              disabled={loading}
            >
              {t("Cancel")}
            </Button>
          </DialogClose>
          <Button
            type="button"
            size="lg"
            disabled={loading}
            onClick={handleDelete}
            className="bg-destructive text-background hover:bg-destructive/90 focus-visible:ring-destructive/30"
          >
            {loading ? <Spinner /> : t("Delete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
