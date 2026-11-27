"use client";

import { useId, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { LabeledField, fieldA11yProps } from "@/components/form/labeled-field";

// Same limit as the other audit-log reasons (types/roles, types/metal-prices)
const REASON_MAX = 500;

// Asks before an action that changes or removes data, with a reason the
// action sends on for the audit log:
//   <ConfirmDialog
//     trigger={<Button>Suspend</Button>}
//     title="Suspend this store?"
//     onConfirm={async (reason) => (await suspend(id, reason)).ok}
//   />
// onConfirm returns false to keep the dialog open (e.g. the API failed and
// a toast said why), so the admin can retry without retyping the reason
export default function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel,
  icon: Icon,
  tone = "default",
  requireReason = true,
  onConfirm,
}: {
  trigger: React.ReactNode;
  title: string;
  description?: string;
  // Defaults to "Confirm"
  confirmLabel?: string;
  icon?: LucideIcon;
  // "destructive" for deletes and other actions that can't be undone
  tone?: "default" | "destructive";
  // Off only for actions the audit log doesn't need a reason for
  requireReason?: boolean;
  onConfirm: (reason: string) => Promise<boolean | void>;
}) {
  const t = useTranslations("Common");
  const id = useId();
  const reasonId = `${id}-reason`;

  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const destructive = tone === "destructive";

  function changeOpen(next: boolean) {
    // Closing mid-request would hide whether it worked
    if (pending) return;
    setOpen(next);
    if (!next) {
      setReason("");
      setError(null);
    }
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = reason.trim();

    if (requireReason && !trimmed) {
      setError(t("reason.required"));
      return;
    }

    setPending(true);
    try {
      const done = await onConfirm(trimmed);
      if (done === false) return;
      setOpen(false);
      setReason("");
      setError(null);
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent
        showCloseButton={false}
        // Focus goes to the reason field (autoFocus) instead of the first button
        onOpenAutoFocus={(event) => {
          if (!requireReason) event.preventDefault();
        }}
        className="gap-5 p-6 ring-0 sm:max-w-md"
      >
        <form onSubmit={submit} className="flex flex-col gap-5" noValidate>
          <DialogHeader className="items-center gap-3 text-center">
            {Icon && (
              <div
                aria-hidden
                className={cn(
                  "flex size-12 items-center justify-center rounded-full ring-8",
                  destructive
                    ? "bg-destructive/10 text-destructive ring-destructive/5"
                    : "bg-secondary/10 text-secondary ring-secondary/5",
                )}
              >
                <Icon className="size-5" />
              </div>
            )}
            <DialogTitle className="mt-1 text-lg font-semibold">
              {title}
            </DialogTitle>
            {description && (
              <DialogDescription className="leading-relaxed">
                {description}
              </DialogDescription>
            )}
          </DialogHeader>

          {requireReason && (
            <LabeledField
              id={reasonId}
              label={t("reason.label")}
              required
              error={error ? { type: "required", message: error } : undefined}
            >
              <Textarea
                {...fieldA11yProps(
                  reasonId,
                  error ? { type: "required", message: error } : undefined,
                )}
                autoFocus
                value={reason}
                onChange={(event) => {
                  setReason(event.target.value);
                  if (error) setError(null);
                }}
                rows={3}
                maxLength={REASON_MAX}
                disabled={pending}
                placeholder={t("reason.placeholder")}
                className="min-h-20 bg-background"
              />
              <p className="flex justify-between gap-3 text-xs text-muted-foreground">
                <span>{t("reason.hint")}</span>
                <span className="tabular-nums" aria-hidden>
                  {reason.length}/{REASON_MAX}
                </span>
              </p>
            </LabeledField>
          )}

          <DialogFooter className="mx-0 mb-0 grid grid-cols-2 gap-3 rounded-none border-0 bg-transparent p-0">
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                size="lg"
                disabled={pending}
              >
                {t("Cancel")}
              </Button>
            </DialogClose>
            <Button
              type="submit"
              size="lg"
              disabled={pending}
              className={
                destructive
                  ? "bg-destructive text-background hover:bg-destructive/90 focus-visible:ring-destructive/30"
                  : "bg-secondary text-primary-foreground hover:bg-secondary/90"
              }
            >
              {pending ? <Spinner /> : (confirmLabel ?? t("Confirm"))}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
