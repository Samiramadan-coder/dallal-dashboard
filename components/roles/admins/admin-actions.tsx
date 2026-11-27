"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { useLocale, useTranslations } from "next-intl";
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
import type { Country } from "@/types/countries";
import type { Locale } from "@/types/shared";
import {
  adminEditSchema,
  type AdminEditFormValues,
  type AdminRow,
  type Can,
  type Role,
  type UpdateAdminPayload,
} from "@/types/roles";
import OptionGrid from "./option-grid";

const FIELDS = ["roles", "country_ids", "is_active", "reason"] as const;

// Same members, in any order
function sameSet<V>(a: readonly V[], b: readonly V[]): boolean {
  return a.length === b.length && a.every((item) => b.includes(item));
}

// Edit and delete buttons for one row of the admins table, each shown only
// with its permission. Changing roles, countries or turning the account on
// or off all count as edit
export default function AdminActions({
  admin,
  roles,
  countries,
  can,
}: {
  admin: AdminRow;
  roles: Role[];
  countries: Country[];
  can: Can<"admins">;
}) {
  const t = useTranslations("Roles.admins");
  const tCommon = useTranslations("Common");
  const remove = async (reason: string) => {
    const result = await deleteAdmin(admin.id, reason);

    if (!result.ok) {
      toast.error(result.message || tCommon("ErrorOccurred"));
      return false;
    }

    toast.success(result.data.message || t("deleted"));
  };

  return (
    <div className="flex items-center gap-1">
      {can.edit && (
        <EditAdmin admin={admin} roles={roles} countries={countries} />
      )}
      {can.delete && <DeleteBtn onDelete={remove} />}
    </div>
  );
}

function EditAdmin({
  admin,
  roles,
  countries,
}: {
  admin: AdminRow;
  roles: Role[];
  countries: Country[];
}) {
  const locale = useLocale() as Locale;
  const t = useTranslations("Roles.admins.edit");
  const tCommon = useTranslations("Common");
  const form = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState(false);

  // An `all_countries` admin starts with every country ticked
  const defaults: AdminEditFormValues = {
    roles: admin.roles,
    country_ids: admin.resolvedCountries.map((country) => country.id),
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
  } = useForm<AdminEditFormValues>({
    resolver: zodResolver(adminEditSchema((key) => t(key as never))),
    defaultValues: defaults,
  });

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    // Start from the row's current state every time it opens
    if (next) reset(defaults);
  };

  const onSubmit: SubmitHandler<AdminEditFormValues> = async (values) => {
    const reason = values.reason.trim();
    const payload: UpdateAdminPayload = {
      is_active: values.is_active,
      ...(reason ? { reason } : {}),
    };

    // Sent only when changed: each send is an audit entry, and resending an
    // `all_countries` admin's list would pin them to today's countries
    if (!sameSet(values.roles, defaults.roles)) {
      payload.roles = values.roles as UpdateAdminPayload["roles"];
    }
    if (!sameSet(values.country_ids, defaults.country_ids)) {
      payload.country_ids = values.country_ids;
    }

    const result = await updateAdmin(admin.id, payload);

    if (!result.ok) {
      Object.entries(result.fieldErrors ?? {}).forEach(([field, message]) => {
        // "roles.0" / "country_ids.1" → the whole list
        const key = FIELDS.find(
          (name) => field === name || field.startsWith(`${name}.`),
        );
        if (key) setError(key, { type: "server", message });
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
        className="flex max-h-[calc(100dvh-2rem)] flex-col gap-0 bg-card p-0 sm:max-w-2xl"
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
            name="roles"
            render={({ field, fieldState }) => (
              <LabeledField
                required
                id={`admin-${admin.id}-roles`}
                label={t("Fields.Roles.label")}
                error={fieldState.error}
              >
                <OptionGrid
                  id={`admin-${admin.id}-roles`}
                  invalid={fieldState.invalid}
                  value={field.value}
                  onChange={field.onChange}
                  options={roles.map((role) => ({
                    value: role.name,
                    label: role.label[locale],
                  }))}
                />
              </LabeledField>
            )}
          />

          <Controller
            control={control}
            name="country_ids"
            render={({ field, fieldState }) => (
              <LabeledField
                required
                id={`admin-${admin.id}-countries`}
                label={t("Fields.Countries.label")}
                error={fieldState.error}
              >
                <OptionGrid
                  id={`admin-${admin.id}-countries`}
                  invalid={fieldState.invalid}
                  value={field.value}
                  onChange={field.onChange}
                  options={countries.map((country) => ({
                    value: country.id,
                    label: country.name[locale],
                    icon: (
                      <Image
                        src={country.flag}
                        alt=""
                        width={20}
                        height={14}
                        className="h-3.5 w-5 shrink-0 rounded-xs object-cover"
                      />
                    ),
                  }))}
                />
                <p className="text-xs text-muted-foreground">
                  {admin.all_countries
                    ? t("Fields.Countries.allCountriesHint")
                    : t("Fields.Countries.hint")}
                </p>
              </LabeledField>
            )}
          />

          <Controller
            control={control}
            name="is_active"
            render={({ field }) => (
              <label
                htmlFor={`admin-${admin.id}-is-active`}
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
                  id={`admin-${admin.id}-is-active`}
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </label>
            )}
          />

          <LabeledField
            id={`admin-${admin.id}-reason`}
            label={t("Fields.Reason.label")}
            error={errors.reason}
          >
            <Textarea
              {...register("reason")}
              {...fieldA11yProps(`admin-${admin.id}-reason`, errors.reason)}
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
