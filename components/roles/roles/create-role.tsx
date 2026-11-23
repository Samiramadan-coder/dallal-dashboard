"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { PlusIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import Header from "@/components/form/header";
import Footer from "@/components/form/footer";
import { LabeledField, fieldA11yProps } from "@/components/form/labeled-field";
import { createRole } from "@/lib/actions/roles";
import {
  roleSchema,
  type PermissionModule,
  type RoleFormValues,
} from "@/types/roles";
import PermissionMatrix from "./permission-matrix";
import { cn } from "@/lib/utils";

const EMPTY: RoleFormValues = {
  name: "",
  label: { en: "", ar: "" },
  permissions: [],
};

// "KSA reviewer" → "ksa_reviewer"
function toRoleKey(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^[^a-z]+|_+$/g, "");
}

export default function CreateRole({
  matrix,
  onCreated,
}: {
  matrix: PermissionModule[];
  // Gets the new role's id, so the page can select it
  onCreated?: (id: number) => void;
}) {
  const t = useTranslations("Roles.create");
  const tCommon = useTranslations("Common");
  const form = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState(false);
  // Stop filling the key from the English name once it's typed by hand
  const [keyEdited, setKeyEdited] = useState(false);

  const {
    control,
    register,
    reset,
    setValue,
    setError,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitted },
  } = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema((key) => t(key as never))),
    defaultValues: EMPTY,
  });

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      reset(EMPTY);
      setKeyEdited(false);
    }
  };

  const onSubmit: SubmitHandler<RoleFormValues> = async (values) => {
    const result = await createRole(values);

    if (!result.ok) {
      Object.entries(result.fieldErrors ?? {}).forEach(([field, message]) => {
        // "permissions.3" → the permissions table
        const key = field.startsWith("permissions") ? "permissions" : field;
        if (
          key === "name" ||
          key === "label.en" ||
          key === "label.ar" ||
          key === "permissions"
        ) {
          setError(key, { type: "server", message });
        }
      });
      toast.error(result.message || tCommon("ErrorOccurred"));
      return;
    }

    toast.success(result.data.message || t("success"));
    onOpenChange(false);
    if (result.data.role?.id) onCreated?.(result.data.role.id);
  };

  const labelEn = register("label.en");
  const name = register("name");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 text-xs">
          <PlusIcon />
          {t("button")}
        </Button>
      </DialogTrigger>

      <DialogContent
        showCloseButton={false}
        // Full screen: the permission table needs the width
        className="inset-0 flex h-dvh w-full max-w-none translate-x-0 translate-y-0 flex-col gap-0 rounded-none bg-card p-0 ring-0 sm:max-w-none rtl:translate-x-0"
      >
        <Header
          title={t("title")}
          description={t("description")}
          className="px-6 sm:px-10"
        />

        <form
          ref={form}
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto bg-background/60"
        >
          <div className="mx-auto max-w-6xl space-y-6 px-6 py-8 sm:px-10">
            <div className="grid items-start gap-5 md:grid-cols-3">
              <LabeledField
                required
                id="role-label-en"
                label={t("Fields.LabelEn.label")}
                error={errors.label?.en}
              >
                <Input
                  {...labelEn}
                  {...fieldA11yProps("role-label-en", errors.label?.en)}
                  onChange={(event) => {
                    void labelEn.onChange(event);
                    if (!keyEdited) {
                      setValue("name", toRoleKey(event.target.value), {
                        shouldValidate: isSubmitted,
                      });
                    }
                  }}
                  dir="ltr"
                  placeholder={t("Fields.LabelEn.placeholder")}
                  className="h-10 bg-background font-inter"
                />
              </LabeledField>

              <LabeledField
                required
                id="role-label-ar"
                label={t("Fields.LabelAr.label")}
                error={errors.label?.ar}
              >
                <Input
                  {...register("label.ar")}
                  {...fieldA11yProps("role-label-ar", errors.label?.ar)}
                  dir="rtl"
                  placeholder={t("Fields.LabelAr.placeholder")}
                  className="h-10 bg-background font-cairo"
                />
              </LabeledField>

              <LabeledField
                required
                id="role-name"
                label={t("Fields.Name.label")}
                error={errors.name}
              >
                <Input
                  {...name}
                  {...fieldA11yProps("role-name", errors.name)}
                  onChange={(event) => {
                    setKeyEdited(true);
                    void name.onChange(event);
                  }}
                  dir="ltr"
                  autoComplete="off"
                  spellCheck={false}
                  placeholder={t("Fields.Name.placeholder")}
                  className="h-10 bg-background font-mono text-[13px]"
                />
                <p className="text-xs text-muted-foreground">
                  {t("Fields.Name.hint")}
                </p>
              </LabeledField>
            </div>

            <Controller
              control={control}
              name="permissions"
              render={({ field, fieldState }) => (
                <LabeledField
                  required
                  id="role-permissions"
                  label={t("Fields.Permissions.label")}
                  error={fieldState.error}
                  labelAction={
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {t("Fields.Permissions.selected", {
                        count: field.value.length,
                      })}
                    </span>
                  }
                >
                  <div
                    className={cn(
                      // overflow-y-hidden: checkbox hit areas must not add a second scrollbar
                      "overflow-hidden rounded-xl border bg-card [&_[data-slot=table-container]]:overflow-y-hidden",
                      fieldState.invalid
                        ? "border-destructive/60"
                        : "border-border",
                    )}
                  >
                    <PermissionMatrix
                      matrix={matrix}
                      value={field.value}
                      onChange={field.onChange}
                      className="[&_thead_tr]:border-t-0"
                    />
                  </div>
                </LabeledField>
              )}
            />
          </div>
        </form>

        <Footer
          form={form}
          loading={isSubmitting}
          className="rounded-none px-6 sm:justify-end sm:px-10 [&_button]:sm:w-40 [&_button]:sm:flex-none"
        />
      </DialogContent>
    </Dialog>
  );
}
