"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { EyeIcon, EyeOffIcon, PlusIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import Header from "@/components/form/header";
import Footer from "@/components/form/footer";
import { LabeledField, fieldA11yProps } from "@/components/form/labeled-field";
import { createAdmin } from "@/lib/actions/admins";
import type { Country } from "@/types/countries";
import { adminSchema, type AdminFormValues, type Role } from "@/types/roles";
import OptionGrid from "./option-grid";

const EMPTY: AdminFormValues = {
  name: "",
  email: "",
  password: "",
  roles: [],
  country_ids: [],
};

const FIELDS = ["name", "email", "password", "roles", "country_ids"] as const;

export default function CreateAdmin({
  roles,
  countries,
}: {
  roles: Role[];
  countries: Country[];
}) {
  const locale = useLocale();
  const t = useTranslations("Roles.admins.create");
  const tCommon = useTranslations("Common");
  const form = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    register,
    reset,
    setError,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AdminFormValues>({
    resolver: zodResolver(adminSchema((key) => t(key as never))),
    defaultValues: EMPTY,
  });

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      reset(EMPTY);
      setShowPassword(false);
    }
  };

  const onSubmit: SubmitHandler<AdminFormValues> = async (values) => {
    const result = await createAdmin(values);

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
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-9 px-4 text-xs">
          <PlusIcon />
          {t("button")}
        </Button>
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
          <LabeledField
            required
            id="admin-name"
            label={t("Fields.Name.label")}
            error={errors.name}
          >
            <Input
              {...register("name")}
              {...fieldA11yProps("admin-name", errors.name)}
              autoComplete="off"
              placeholder={t("Fields.Name.placeholder")}
              className="h-10 bg-background"
            />
          </LabeledField>

          <div className="grid items-start gap-5 sm:grid-cols-2">
            <LabeledField
              required
              id="admin-email"
              label={t("Fields.Email.label")}
              error={errors.email}
            >
              <Input
                {...register("email")}
                {...fieldA11yProps("admin-email", errors.email)}
                type="email"
                dir="ltr"
                autoComplete="off"
                placeholder={t("Fields.Email.placeholder")}
                className="h-10 bg-background"
              />
            </LabeledField>

            <LabeledField
              required
              id="admin-password"
              label={t("Fields.Password.label")}
              error={errors.password}
            >
              <div className="relative">
                <Input
                  {...register("password")}
                  {...fieldA11yProps("admin-password", errors.password)}
                  type={showPassword ? "text" : "password"}
                  dir="ltr"
                  // A new account's password; keep the browser from filling ours
                  autoComplete="new-password"
                  placeholder={t("Fields.Password.placeholder")}
                  className="h-10 bg-background pe-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={
                    showPassword ? t("hidePassword") : t("showPassword")
                  }
                  className="absolute inset-e-0 top-0 flex h-10 w-10 items-center justify-center text-muted-foreground outline-none hover:text-foreground focus-visible:text-foreground"
                >
                  {showPassword ? (
                    <EyeOffIcon className="size-4" />
                  ) : (
                    <EyeIcon className="size-4" />
                  )}
                </button>
              </div>
            </LabeledField>
          </div>

          <Controller
            control={control}
            name="roles"
            render={({ field, fieldState }) => (
              <LabeledField
                required
                id="admin-roles"
                label={t("Fields.Roles.label")}
                error={fieldState.error}
              >
                <OptionGrid
                  id="admin-roles"
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
                id="admin-countries"
                label={t("Fields.Countries.label")}
                error={fieldState.error}
              >
                <OptionGrid
                  id="admin-countries"
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
                  {t("Fields.Countries.hint")}
                </p>
              </LabeledField>
            )}
          />
        </form>

        <Footer form={form} loading={isSubmitting} />
      </DialogContent>
    </Dialog>
  );
}
