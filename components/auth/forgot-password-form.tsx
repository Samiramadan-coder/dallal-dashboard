"use client";

import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { SIGN_IN_PATH } from "@/lib/auth-routes";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { requestPasswordReset } from "@/lib/actions/auth";
import {
  ForgotPasswordFormData,
  forgotPasswordSchema,
} from "@/types/auth";
import { LabeledField, fieldA11yProps } from "@/components/form/labeled-field";

type ForgotPasswordFormProps = {
  // Kept so going back from the reset step doesn't empty the form
  defaultEmail?: string;
  onSent: (email: string) => void;
};

// Asks the API to email a reset code
export function ForgotPasswordForm({
  defaultEmail,
  onSent,
}: ForgotPasswordFormProps) {
  const t = useTranslations("Auth.ForgotPassword");

  const {
    register,
    setError,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema((key) => t(key as never))),
    defaultValues: { email: defaultEmail ?? "" },
  });

  const onSubmit: SubmitHandler<ForgotPasswordFormData> = async (data) => {
    const result = await requestPasswordReset(data);

    if (!result.ok) {
      if (result.fieldErrors?.email) {
        setError("email", { type: "server", message: result.fieldErrors.email });
      }
      toast.error(result.message);
      return;
    }

    toast.success(result.data.message || t("CodeSent"));
    onSent(data.email);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Link
        href={SIGN_IN_PATH}
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4 rtl:rotate-180" />
        {t("BackToSignIn")}
      </Link>

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground">{t("Title")}</h2>
        <p className="text-sm mt-2 text-muted-foreground">{t("Description")}</p>
      </div>

      <div className="flex flex-col gap-5">
        <LabeledField id="email" label={t("Email")} error={errors.email}>
          <Input
            {...register("email")}
            {...fieldA11yProps("email", errors.email)}
            type="email"
            autoComplete="email"
            autoFocus
            className="h-11 bg-card"
          />
        </LabeledField>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-11 mt-1 bg-secondary text-card font-semibold hover:bg-secondary/90"
        >
          {isSubmitting ? <Spinner /> : t("SendCode")}
        </Button>
      </div>
    </form>
  );
}
