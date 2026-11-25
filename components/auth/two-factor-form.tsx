"use client";

import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import type { ActionResult } from "@/lib/api/errors";
import { OtpInput } from "@/components/form/otp-input";
import { ArrowLeft, Check, Copy, ShieldCheck } from "lucide-react";
import { LabeledField, fieldA11yProps } from "@/components/form/labeled-field";

const CODE_LENGTH = 6;

type TwoFactorFormProps = {
  email: string;
  // Present when the account is adding itself to an authenticator app
  setup?: { secret: string; otpauthUrl: string };
  onSubmitCode: (code: string) => Promise<ActionResult<{ message?: string }>>;
  onBack: () => void;
  onVerified: () => void;
};

export function TwoFactorForm({
  email,
  setup,
  onSubmitCode,
  onBack,
  onVerified,
}: TwoFactorFormProps) {
  const t = useTranslations("Auth.TwoFactor");
  const [code, setCode] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const error = errorMessage
    ? { type: "server", message: errorMessage }
    : undefined;

  const submit = (value: string) => {
    if (isPending) return;
    if (value.length < CODE_LENGTH) {
      setErrorMessage(t("CodeRequired"));
      return;
    }

    setErrorMessage(null);
    startTransition(async () => {
      const result = await onSubmitCode(value);

      if (!result.ok) {
        const fieldErrors = result.fieldErrors ?? {};
        setErrorMessage(fieldErrors.totp ?? fieldErrors.code ?? result.message);
        setCode("");
        return;
      }

      toast.success(result.data.message || t("VerifySuccess"));
      onVerified();
    });
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submit(code);
      }}
    >
      <button
        type="button"
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4 rtl:rotate-180" />
        {t("Back")}
      </button>

      <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-secondary/10">
        <ShieldCheck className="size-5 text-secondary" />
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">
          {setup ? t("SetupTitle") : t("Title")}
        </h2>
        <p className="text-sm mt-2 text-muted-foreground">
          {t.rich(setup ? "SetupDescription" : "Description", {
            email: () => (
              <span dir="ltr" className="text-foreground">
                {email}
              </span>
            ),
          })}
        </p>
      </div>

      {setup && <SetupKey {...setup} />}

      <div className="flex flex-col gap-5">
        <LabeledField
          id="code"
          label={t("CodeLabel")}
          labelClassName="sr-only"
          error={error}
        >
          <OtpInput
            {...fieldA11yProps("code", error)}
            value={code}
            length={CODE_LENGTH}
            disabled={isPending}
            autoFocus={!setup}
            onChange={(value) => {
              setCode(value);
              if (errorMessage) setErrorMessage(null);
            }}
            onComplete={submit}
          />
        </LabeledField>

        <Button
          type="submit"
          disabled={isPending}
          className="w-full h-11 bg-secondary text-card font-semibold hover:bg-secondary/90"
        >
          {isPending ? <Spinner /> : t("Submit")}
        </Button>
      </div>
    </form>
  );
}

// A QR code to scan with the authenticator app, the key to type in by hand,
// and a link that opens the app directly on phones
function SetupKey({
  secret,
  otpauthUrl,
}: {
  secret: string;
  otpauthUrl: string;
}) {
  const t = useTranslations("Auth.TwoFactor");
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t("CopyFailed"));
    }
  };

  return (
    <div className="mb-6 rounded-lg border border-border bg-card p-4">
      <div className="flex flex-col items-center gap-2 border-b border-border pb-4 mb-4">
        {/* Dark modules on the card color: scannable on the light theme */}
        <QRCodeSVG
          value={otpauthUrl}
          size={176}
          marginSize={2}
          fgColor="currentColor"
          bgColor="transparent"
          title={t("QrCodeLabel")}
          className="text-card-foreground"
        />
        <p className="text-center text-xs text-muted-foreground">
          {t("ScanQrCode")}
        </p>
      </div>

      <p className="text-xs font-medium text-muted-foreground">
        {t("SetupKey")}
      </p>
      <div className="mt-2 flex items-center gap-2">
        <code
          dir="ltr"
          className="flex-1 break-all font-mono text-sm font-semibold tracking-wider text-foreground"
        >
          {secret.match(/.{1,4}/g)?.join(" ")}
        </code>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={copy}
          aria-label={t("CopyKey")}
        >
          {copied ? (
            <Check className="size-4 text-secondary" />
          ) : (
            <Copy className="size-4" />
          )}
        </Button>
      </div>
      <a
        href={otpauthUrl}
        className="mt-3 inline-block text-sm font-medium text-secondary hover:underline"
      >
        {t("OpenInApp")}
      </a>
      {/* otpauth:// only opens an authenticator app on the same device */}
      <p className="mt-1 text-xs text-muted-foreground">{t("OpenInAppHint")}</p>
    </div>
  );
}
