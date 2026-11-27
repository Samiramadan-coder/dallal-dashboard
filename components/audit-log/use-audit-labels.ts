import { useTranslations } from "next-intl";
import { dynamicMessages } from "@/lib/dynamic-messages";
import type { AuditLogRow } from "@/types/audit-log";
import type { Locale } from "@/types/shared";

// "two_factor_enabled" → "Two factor enabled", for slugs without a label
function humanize(slug: string): string {
  const text = slug.replace(/[._-]+/g, " ").trim();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// The record's name from its snapshot: a localized label, or a plain name
export function subjectName(log: AuditLogRow, locale: Locale): string | null {
  const snapshot = log.after ?? log.before;
  if (!snapshot) return null;

  const label = snapshot.label;
  if (label && typeof label === "object") {
    const localized = (label as Record<string, unknown>)[locale];
    if (typeof localized === "string" && localized) return localized;
  }

  return typeof snapshot.name === "string" && snapshot.name
    ? snapshot.name
    : null;
}

// Labels for an action ("role.updated"), a subject type ("role") and a
// snapshot field ("country_ids"), from messages → AuditLog, humanized when
// there's no translation
export function useAuditLabels() {
  // Actions, subjects and fields come from the API's records
  const t = dynamicMessages(useTranslations("AuditLog"));

  // t.has() is also true for a group of messages, which t() can't render
  const label = (group: string, slug: string) => {
    const key = `${group}.${slug}`;
    return t.has(key) && typeof t.raw(key) === "string"
      ? t(key)
      : humanize(slug);
  };

  // "name.ar" (a translated field) → "Name (Arabic)"
  const fieldLabel = (field: string) => {
    const [base, language] = field.split(".");
    const name = label("fields", base);
    return language ? `${name} (${label("languages", language)})` : name;
  };

  return {
    actionLabel: (action: string) => label("actions", action),
    subjectLabel: (type: string) => label("subjects", type),
    fieldLabel,
  };
}
