"use client";

import { toast } from "sonner";
import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { ArrowLeft, Check, Circle, KeyRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { OtpInput } from "@/components/form/otp-input";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Controller,
  useForm,
  useWatch,
  SubmitHandler,
} from "react-hook-form";
import { requestPasswordReset, resetPassword } from "@/lib/actions/auth";
import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_RULES,
  ResetPasswordFormData,
  resetPasswordSchema,
} from "@/types/auth";
import { LabeledField, fieldA11yProps } from "@/components/form/labeled-field";

const FIELDS = ["code", "password", "password_confirmation"] as const;

type ResetPasswordFormProps = {
  email: string;
  onBack: () => void;
  onReset: () => void;
};

// The emailed code and the new password, entered twice
export function ResetPasswordForm({
  email,
  onBack,
  onReset,
}: ResetPasswordFormProps) {
  const t = useTranslations("Auth.ForgotPassword");
  const [isResending, startResend] = useTransition();

  const {
    control,
    register,
    setError,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema(t)),
    defaultValues: { code: "", password: "", password_confirmation: "" },
  });

  const password = useWatch({ control, name: "password" });

  const onSubmit: SubmitHandler<ResetPasswordFormData> = async (data) => {
    const result = await resetPassword({ ...data, email });

    if (!result.ok) {
      const fieldErrors = result.fieldErrors ?? {};
      FIELDS.forEach((field) => {
        if (fieldErrors[field]) {
          setError(field, { type: "server", message: fieldErrors[field] });
        }
      });
      toast.error(result.message);
      return;
    }

    toast.success(result.data.message || t("ResetSuccess"));
    onReset();
  };

  const resend = () =>
    startResend(async () => {
      const result = await requestPasswordReset({ email });
      if (result.ok) toast.success(result.data.message || t("CodeSent"));
      else toast.error(result.message);
    });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <button
        type="button"
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4 rtl:rotate-180" />
        {t("Back")}
      </button>

      <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-secondary/10">
        <KeyRound className="size-5 text-secondary" />
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">
          {t("ResetTitle")}
        </h2>
        <p className="text-sm mt-2 text-muted-foreground">
          {t.rich("ResetDescription", {
            email: () => (
              <span dir="ltr" className="text-foreground">
                {email}
              </span>
            ),
          })}
        </p>
      </div>

      <div className="flex flex-col gap-5">
        <LabeledField
          id="code"
          label={t("CodeLabel")}
          error={errors.code}
          labelAction={
            <button
              type="button"
              onClick={resend}
              disabled={isResending}
              className="text-sm font-medium text-secondary hover:underline disabled:opacity-50"
            >
              {isResending ? t("Resending") : t("ResendCode")}
            </button>
          }
        >
          <Controller
            name="code"
            control={control}
            render={({ field }) => (
              <OtpInput
                {...fieldA11yProps("code", errors.code)}
                value={field.value}
                onChange={field.onChange}
                disabled={isSubmitting}
                autoFocus
              />
            )}
          />
        </LabeledField>

        <LabeledField
          id="password"
          label={t("NewPassword")}
          error={errors.password}
        >
          <Input
            {...register("password")}
            {...fieldA11yProps("password", errors.password)}
            type="password"
            autoComplete="new-password"
            className="h-11 bg-card"
          />
          <PasswordRules password={password} />
        </LabeledField>

        <LabeledField
          id="password_confirmation"
          label={t("ConfirmPassword")}
          error={errors.password_confirmation}
        >
          <Input
            {...register("password_confirmation")}
            {...fieldA11yProps(
              "password_confirmation",
              errors.password_confirmation,
            )}
            type="password"
            autoComplete="new-password"
            className="h-11 bg-card"
          />
        </LabeledField>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-11 mt-1 bg-secondary text-card font-semibold hover:bg-secondary/90"
        >
          {isSubmitting ? <Spinner /> : t("ResetSubmit")}
        </Button>
      </div>
    </form>
  );
}

// Ticks each rule off as the password meets it
function PasswordRules({ password }: { password: string }) {
  const t = useTranslations("Auth.ForgotPassword");

  return (
    <ul className="grid gap-1.5 text-xs sm:grid-cols-2">
      {PASSWORD_RULES.map((rule) => {
        const met = rule.test(password);
        return (
          <li
            key={rule.key}
            className={cn(
              "flex items-center gap-1.5 transition-colors",
              met ? "text-secondary" : "text-muted-foreground",
            )}
          >
            {met ? (
              <Check className="size-3.5 shrink-0" />
            ) : (
              <Circle className="size-3.5 shrink-0" />
            )}
            {t(rule.key, { min: PASSWORD_MIN_LENGTH })}
            <span className="sr-only">
              {met ? t("RuleMet") : t("RuleNotMet")}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
