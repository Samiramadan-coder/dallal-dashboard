"use client";

import {
  CALLBACK_URL_PARAM,
  HOME_PATH,
  localizePath,
  safeCallbackUrl,
} from "@/lib/auth-routes";

import { use, useState } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import type { LoginFormData } from "@/types/auth";
import { LoginForm } from "@/components/auth/login-form";
import { TwoFactorForm } from "@/components/auth/two-factor-form";
import { confirmTwoFactorSetup, login } from "@/lib/actions/auth";

type Step =
  | { name: "credentials" }
  | { name: "verify" }
  | { name: "setup"; secret: string; otpauthUrl: string };

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const router = useRouter();
  const locale = useLocale();
  const callbackParam = use(searchParams)[CALLBACK_URL_PARAM];
  const callbackUrl = typeof callbackParam === "string" ? callbackParam : null;

  // Kept in memory only: a 2FA account sends them again with the code
  const [credentials, setCredentials] = useState<LoginFormData>();
  const [step, setStep] = useState<Step>({ name: "credentials" });

  const onSignedIn = () => {
    // callbackUrl already carries the locale prefix, hence next/navigation's
    // router; safeCallbackUrl blocks external URLs and the login page itself
    router.replace(
      safeCallbackUrl(callbackUrl, localizePath(HOME_PATH, locale)),
    );
  };

  const verifyCode = async (totp: string) => {
    const result = await login({ ...credentials!, totp });
    return result.ok ? { ok: true as const, data: result.data } : result;
  };

  return (
    <div className="w-full max-w-95">
      {step.name === "credentials" || !credentials ? (
        <LoginForm
          defaultValues={credentials}
          onSuccess={(values, next) => {
            setCredentials(values);
            if (next.step === "signed-in") onSignedIn();
            else
              setStep(
                next.step === "setup"
                  ? { name: "setup", ...next }
                  : { name: "verify" },
              );
          }}
        />
      ) : (
        <TwoFactorForm
          email={credentials.email}
          setup={step.name === "setup" ? step : undefined}
          onSubmitCode={
            step.name === "setup" ? confirmTwoFactorSetup : verifyCode
          }
          onBack={() => setStep({ name: "credentials" })}
          onVerified={onSignedIn}
        />
      )}
    </div>
  );
}
