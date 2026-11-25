"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { SIGN_IN_PATH } from "@/lib/auth-routes";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export default function ForgotPasswordPage() {
  const router = useRouter();
  // Set once the code is sent; moves the page to the reset step
  const [email, setEmail] = useState<string>();
  const [step, setStep] = useState<"email" | "reset">("email");

  return (
    <div className="w-full max-w-95">
      {step === "email" || !email ? (
        <ForgotPasswordForm
          defaultEmail={email}
          onSent={(value) => {
            setEmail(value);
            setStep("reset");
          }}
        />
      ) : (
        <ResetPasswordForm
          email={email}
          onBack={() => setStep("email")}
          onReset={() => router.replace(SIGN_IN_PATH)}
        />
      )}
    </div>
  );
}
