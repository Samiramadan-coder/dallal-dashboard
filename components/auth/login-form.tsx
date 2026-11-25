"use client";

import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { LoginFormData, loginSchema } from "@/types/auth";
import { login, type LoginStep } from "@/lib/actions/auth";
import { LabeledField, fieldA11yProps } from "@/components/form/labeled-field";

type LoginFormProps = {
  // Kept so going back from the code step doesn't empty the form
  defaultValues?: LoginFormData;
  onSuccess: (credentials: LoginFormData, next: LoginStep) => void;
};

export function LoginForm({ defaultValues, onSuccess }: LoginFormProps) {
  const t = useTranslations("Auth.Login");

  const {
    register,
    setError,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema(t)),
    defaultValues: defaultValues ?? { email: "", password: "" },
  });

  const onSubmit: SubmitHandler<LoginFormData> = async (data) => {
    const result = await login(data);

    if (!result.ok) {
      Object.entries(result.fieldErrors ?? {}).forEach(([field, message]) => {
        if (field === "email" || field === "password") {
          setError(field, { type: "server", message });
        }
      });
      toast.error(result.message || t("LoginFailed"));
      return;
    }

    onSuccess(data, result.data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
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
            className="h-11 bg-card"
          />
        </LabeledField>

        <LabeledField
          id="password"
          label={t("Password")}
          error={errors.password}
        >
          <Input
            {...register("password")}
            {...fieldA11yProps("password", errors.password)}
            type="password"
            autoComplete="current-password"
            className="h-11 bg-card"
          />
        </LabeledField>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-11 mt-1 bg-secondary text-card font-semibold hover:bg-secondary/90"
        >
          {isSubmitting ? <Spinner /> : t("Submit")}
        </Button>
      </div>
    </form>
  );
}
