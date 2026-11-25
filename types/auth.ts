import z from "zod";

type T = (key: string) => string;

export const loginSchema = (t: T) =>
  z.object({
    email: z.email({ message: t("InvalidEmail") }),
    password: z
      .string()
      .min(1, { message: t("PasswordIsRequired") })
      .min(8, { message: t("passwordMinLength") }),
  });

export type LoginFormData = z.infer<ReturnType<typeof loginSchema>>;

export const forgotPasswordSchema = (t: T) =>
  z.object({
    email: z.email({ message: t("InvalidEmail") }),
  });

export type ForgotPasswordFormData = z.infer<
  ReturnType<typeof forgotPasswordSchema>
>;

export const PASSWORD_MIN_LENGTH = 10;

// What a new password must contain. The form shows them as a live
// checklist, and the schema rejects a password that misses any of them
export const PASSWORD_RULES = [
  { key: "RuleLength", test: (v: string) => v.length >= PASSWORD_MIN_LENGTH },
  { key: "RuleLowercase", test: (v: string) => /\p{Ll}/u.test(v) },
  { key: "RuleUppercase", test: (v: string) => /\p{Lu}/u.test(v) },
  { key: "RuleNumber", test: (v: string) => /\d/.test(v) },
  { key: "RuleSymbol", test: (v: string) => /[^\p{L}\p{N}\s]/u.test(v) },
] as const;

export const resetPasswordSchema = (t: T) =>
  z
    .object({
      code: z.string().regex(/^\d{6}$/, { message: t("CodeRequired") }),
      password: z
        .string()
        .min(1, { message: t("PasswordRequired") })
        .refine((v) => PASSWORD_RULES.every((rule) => rule.test(v)), {
          message: t("PasswordWeak"),
        }),
      password_confirmation: z.string(),
    })
    .refine((data) => data.password === data.password_confirmation, {
      path: ["password_confirmation"],
      message: t("PasswordMismatch"),
    });

export type ResetPasswordFormData = z.infer<
  ReturnType<typeof resetPasswordSchema>
>;
