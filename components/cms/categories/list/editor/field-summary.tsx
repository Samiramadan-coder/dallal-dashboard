"use client";

import { EyeOff, Filter, Asterisk } from "lucide-react";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import type { CategoryField } from "@/types/categories";
import type { Locale } from "@/types/shared";

// How many choices to show before "+N"
const CHOICES_SHOWN = 6;

// A saved listing field, read-only, in the words a seller and buyer would
// meet it: its type, whether it's required / filterable / hidden, its
// choices, and when it shows or what limits its answer
export default function FieldSummary({
  field,
  allFields,
}: {
  field: CategoryField;
  // The category's fields, to name the ones a condition points at
  allFields: CategoryField[];
}) {
  const t = useTranslations("Cms.categories.form");
  const locale = useLocale() as Locale;

  const choices = field.type === "select" ? field.options : field.type === "unit_number" ? field.units : null;
  const notes = useFieldNotes(field, allFields);

  return (
    <div className="flex h-full flex-col gap-2.5 rounded-lg border p-3">
      <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
        <p className="min-w-0 text-sm font-medium text-foreground">
          {field.label[locale]}
        </p>

        <span className="shrink-0 rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
          {t(`fieldTypes.${field.type}`)}
        </span>
      </div>

      {(field.required || field.filterable || field.hidden_from_public) && (
        <ul className="flex flex-wrap gap-1.5 text-[11px] font-medium">
          {field.required && (
            <Flag icon={<Asterisk />} className="bg-destructive/10 text-destructive">
              {t("flags.required")}
            </Flag>
          )}
          {field.filterable && (
            <Flag icon={<Filter />} className="bg-secondary/10 text-secondary">
              {t("flags.filterable")}
            </Flag>
          )}
          {field.hidden_from_public && (
            <Flag icon={<EyeOff />} className="bg-muted text-muted-foreground">
              {t("flags.hiddenShort")}
            </Flag>
          )}
        </ul>
      )}

      {choices && choices.length > 0 && (
        <div className="flex flex-col gap-1">
          <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
            {field.type === "select" ? t("options") : t("units")}
          </p>
          <ul className="flex flex-wrap gap-1.5 text-xs">
            {choices.slice(0, CHOICES_SHOWN).map((choice) => (
              <li
                key={choice.value}
                className="rounded-md border px-2 py-0.5 text-foreground"
              >
                {choice.label[locale]}
              </li>
            ))}
            {choices.length > CHOICES_SHOWN && (
              <li className="px-1 py-0.5 text-muted-foreground">
                {t("summary.more", { count: choices.length - CHOICES_SHOWN })}
              </li>
            )}
          </ul>
        </div>
      )}

      {notes.length > 0 && (
        <ul className="flex flex-col gap-0.5 text-xs text-muted-foreground">
          {notes.map((note) => (
            <li key={note}>• {note}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Flag({
  icon,
  className,
  children,
}: {
  icon: React.ReactNode;
  className: string;
  children: React.ReactNode;
}) {
  return (
    <li
      className={`flex items-center gap-1 rounded-full px-2 py-0.5 [&_svg]:size-3 ${className}`}
    >
      {icon}
      {children}
    </li>
  );
}

// Conditions and limits as sentences: "Shown when “Has stones” is Yes",
// "At least 0.01". Keys the dashboard doesn't know are left out
function useFieldNotes(
  field: CategoryField,
  allFields: CategoryField[],
): string[] {
  const t = useTranslations("Cms.categories.form.summary");
  const locale = useLocale() as Locale;
  const format = useFormatter();

  const byKey = (key: string) => allFields.find((f) => f.key === key);
  const nameOf = (key: string) => byKey(key)?.label[locale] ?? key;

  // A condition's value in words: Yes/No, or the option's name
  const valueOf = (key: string, value: unknown): string => {
    if (typeof value === "boolean") return value ? t("yes") : t("no");
    if (Array.isArray(value)) {
      return format.list(value.map((v) => valueOf(key, v)), { type: "disjunction" });
    }
    const option = byKey(key)?.options?.find((o) => o.value === String(value));
    return option?.label[locale] ?? String(value);
  };

  const notes: string[] = [];

  for (const [key, value] of Object.entries(field.show_if ?? {})) {
    notes.push(t("shownWhen", { field: nameOf(key), value: valueOf(key, value) }));
  }

  const rules = field.validation ?? {};
  if (typeof rules.min === "number") {
    notes.push(t("min", { value: format.number(rules.min) }));
  }
  if (typeof rules.max === "number") {
    notes.push(t("max", { value: format.number(rules.max) }));
  }
  if (typeof rules.lte_field === "string") {
    notes.push(t("lteField", { field: nameOf(rules.lte_field) }));
  }
  if (Array.isArray(rules.mimes) && rules.mimes.length > 0) {
    notes.push(t("mimes", { types: rules.mimes.join(", ").toUpperCase() }));
  }
  if (typeof rules.max_files === "number") {
    notes.push(t("maxFiles", { count: rules.max_files }));
  }

  return notes;
}
