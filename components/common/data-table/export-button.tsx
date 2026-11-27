"use client";

import { useState } from "react";
import { DownloadIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { withBasePath } from "@/lib/base-path";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

// filename*=UTF-8''%D8%A7.csv wins over filename="a.csv" (RFC 6266), so
// Arabic names survive
export function filenameFromDisposition(header: string | null): string | null {
  if (!header) return null;

  const extended = /filename\*\s*=\s*(?:UTF-8|utf-8)''([^;]+)/.exec(header);
  if (extended) {
    try {
      return decodeURIComponent(extended[1].trim().replace(/^"|"$/g, ""));
    } catch {
      // Malformed escape: fall through to the plain name
    }
  }

  const plain = /filename\s*=\s*"([^"]*)"|filename\s*=\s*([^;]+)/.exec(header);
  const name = plain?.[1] ?? plain?.[2]?.trim();
  return name || null;
}

// Downloads a file from `url` (an app path such as "/api/admins/export?…";
// the basePath is added here). The response's Content-Disposition names the
// file; `filename` is the fallback
export default function ExportButton({
  url,
  filename = "export.csv",
  label,
  onError,
}: {
  url: string;
  filename?: string;
  label?: string;
  // Defaults to window.alert
  onError?: (message: string) => void;
}) {
  const t = useTranslations("DataTable");
  const [loading, setLoading] = useState(false);

  async function download() {
    setLoading(true);
    try {
      const response = await fetch(withBasePath(url));

      if (!response.ok) {
        let message = t("exportFailed");
        try {
          const body = (await response.json()) as { message?: unknown };
          if (typeof body.message === "string" && body.message) {
            message = body.message;
          }
        } catch {
          // Not JSON: keep the generic message
        }
        throw new Error(message);
      }

      const blob = await response.blob();
      const href = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = href;
      link.download =
        filenameFromDisposition(response.headers.get("content-disposition")) ??
        filename;
      document.body.append(link);
      link.click();
      link.remove();
      // Revoked on the next tick: Safari cancels the download otherwise
      setTimeout(() => URL.revokeObjectURL(href), 0);
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : t("exportFailed");
      if (onError) onError(message);
      else window.alert(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={download}
      disabled={loading}
      aria-busy={loading || undefined}
    >
      {loading ? <Spinner /> : <DownloadIcon />}
      {label ?? t("export")}
    </Button>
  );
}
