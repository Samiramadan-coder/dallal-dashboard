"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import Header from "@/components/form/header";
import Footer from "@/components/form/footer";
import { LabeledField, fieldA11yProps } from "@/components/form/labeled-field";
import EditBtn from "@/components/reusable/edit-btn";
import DeleteBtn from "@/components/reusable/delete-btn";
import { deleteAdmin, updateAdmin } from "@/lib/actions/admins";
import {
  adminStatusSchema,
  type AdminRow,
  type AdminStatusFormValues,
  type Can,
} from "@/types/roles";

// Edit and delete buttons for one row of the admins table, each shown only
// with its permission. Turning an account on or off counts as edit
export default function AdminActions({
  admin,
  can,
}: {
  admin: AdminRow;
  can: Can<"admins">;
}) {
  const t = useTranslations("Roles.admins");
  const tCommon = useTranslations("Common");
  const [deleting, setDeleting] = useState(false);

  const remove = async () => {
    setDeleting(true);
    const result = await deleteAdmin(admin.id);
    setDeleting(false);

    if (!result.ok) {
      toast.error(result.message || tCommon("ErrorOccurred"));
      return;
    }

    toast.success(result.data.message || t("deleted"));
  };

  return (
    <div className="flex items-center gap-1">
      {can.edit && <EditAdmin admin={admin} />}
      {can.delete && <DeleteBtn loading={deleting} onDelete={remove} />}
    </div>
  );
}

function EditAdmin({ admin }: { admin: AdminRow }) {
  const t = useTranslations("Roles.admins.edit");
  const tCommon = useTranslations("Common");
  const form = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState(false);

  const defaults: AdminStatusFormValues = {
    is_active: admin.is_active,
    reason: "",
  };

  const {
    control,
    register,
    reset,
    setError,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AdminStatusFormValues>({
    resolver: zodResolver(adminStatusSchema((key) => t(key as never))),
    defaultValues: defaults,
  });

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    // Start from the row's current state every time it opens
    if (next) reset(defaults);
  };

  const onSubmit: SubmitHandler<AdminStatusFormValues> = async (values) => {
    const reason = values.reason.trim();
    const result = await updateAdmin(admin.id, {
      is_active: values.is_active,
      ...(reason ? { reason } : {}),
    });

    if (!result.ok) {
      Object.entries(result.fieldErrors ?? {}).forEach(([field, message]) => {
        if (field === "is_active" || field === "reason") {
          setError(field, { type: "server", message });
        }
      });
      toast.error(result.message || tCommon("ErrorOccurred"));
      return;
    }

    toast.success(result.data.message || t("success"));
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <EditBtn />
      </DialogTrigger>

      <DialogContent
        showCloseButton={false}
        className="flex max-h-[calc(100dvh-2rem)] flex-col gap-0 bg-card p-0 sm:max-w-lg"
      >
        <Header title={t("title")} description={t("description")} />

        <form
          ref={form}
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 space-y-5 overflow-y-auto px-5 py-5"
        >
          {/* Who is being edited */}
          <div className="rounded-lg border border-border bg-muted/40 px-4 py-3">
            <p className="text-sm font-semibold text-foreground">
              {admin.name}
            </p>
            <p dir="ltr" className="text-xs text-muted-foreground rtl:text-end">
              {admin.email}
            </p>
          </div>

          <Controller
            control={control}
            name="is_active"
            render={({ field }) => (
              <label
                htmlFor="admin-is-active"
                className="flex cursor-pointer items-start justify-between gap-4 rounded-lg border border-border px-4 py-3"
              >
                <span className="space-y-0.5">
                  <span className="block text-sm font-medium text-foreground">
                    {t("Fields.IsActive.label")}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {t("Fields.IsActive.description")}
                  </span>
                </span>
                <Switch
                  id="admin-is-active"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </label>
            )}
          />

          <LabeledField
            id="admin-reason"
            label={t("Fields.Reason.label")}
            error={errors.reason}
          >
            <Textarea
              {...register("reason")}
              {...fieldA11yProps("admin-reason", errors.reason)}
              rows={3}
              maxLength={500}
              placeholder={t("Fields.Reason.placeholder")}
              className="min-h-20 bg-background"
            />
            <p className="text-xs text-muted-foreground">
              {t("Fields.Reason.hint")}
            </p>
          </LabeledField>
        </form>

        <Footer form={form} loading={isSubmitting} />
      </DialogContent>
    </Dialog>
  );
}
