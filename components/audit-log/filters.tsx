"use client";

import { useId, useTransition } from "react";
import { XIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { usePathname, useRouter } from "@/i18n/navigation";
import {
  AUDIT_ACTIONS,
  AUDIT_FILTER_KEYS,
  isAuditSubject,
  type AuditSubject,
} from "@/constants/audit-log";
import type { Country } from "@/types/countries";
import type { Locale } from "@/types/shared";
import type {
  AuditLogAdminOption,
  AuditLogFilters as Filters,
} from "@/types/audit-log";
import { useAuditLabels } from "./use-audit-labels";

type FilterKey = (typeof AUDIT_FILTER_KEYS)[number];

// Radix Select can't hold an empty value; this one stands for "no filter"
const ALL = "all";

const SUBJECTS = Object.keys(AUDIT_ACTIONS) as AuditSubject[];

// Filters live in the URL (?admin_id=1&action=role.updated), so the server
// page fetches the matching rows and a filtered view can be shared as a link
export default function AuditLogFilters({
  filters,
  admins,
  countries,
}: {
  filters: Filters;
  // null: the admin can't list admins, so the filter is hidden
  admins: AuditLogAdminOption[] | null;
  countries: Country[];
}) {
  const id = useId();
  const locale = useLocale() as Locale;
  const t = useTranslations("AuditLog.filters");
  const { actionLabel, subjectLabel } = useAuditLabels();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Sets (or clears, with null) some filters and goes back to page 1
  const update = (changes: Partial<Record<FilterKey, string | null>>) => {
    const query = Object.fromEntries(searchParams.entries());
    delete query.page;

    for (const [key, value] of Object.entries(changes)) {
      if (value) query[key] = value;
      else delete query[key];
    }

    startTransition(() => router.replace({ pathname, query }));
  };

  const fromSelect = (value: string) => (value === ALL ? null : value);

  const subject =
    filters.subject_type && isAuditSubject(filters.subject_type)
      ? filters.subject_type
      : undefined;

  // A chosen target narrows the actions to its own
  const actionGroups = subject ? [subject] : SUBJECTS;

  const hasFilters =
    AUDIT_FILTER_KEYS.some((key) => filters[key] !== undefined) ||
    filters.subject_id !== undefined;

  return (
    <div className="flex flex-wrap items-end gap-x-3 gap-y-2.5">
      {admins && (
        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor={`${id}-admin`}
            className="text-xs text-muted-foreground"
          >
            {t("admin")}
          </Label>
          <Select
            value={filters.admin_id?.toString() ?? ALL}
            onValueChange={(v) => update({ admin_id: fromSelect(v) })}
          >
            <SelectTrigger id={`${id}-admin`} className="h-9 w-44 bg-card">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>{t("allAdmins")}</SelectItem>
              {admins.map((admin) => (
                <SelectItem key={admin.id} value={admin.id.toString()}>
                  {admin.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <Label
          htmlFor={`${id}-subject`}
          className="text-xs text-muted-foreground"
        >
          {t("subject")}
        </Label>
        <Select
          value={filters.subject_type ?? ALL}
          onValueChange={(v) => {
            const next = fromSelect(v);
            // An action of another target would match nothing
            const keepAction =
              next !== null && filters.action?.startsWith(`${next}.`);
            update({
              subject_type: next,
              action: keepAction ? filters.action : null,
            });
          }}
        >
          <SelectTrigger id={`${id}-subject`} className="h-9 w-40 bg-card">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{t("allSubjects")}</SelectItem>
            {SUBJECTS.map((type) => (
              <SelectItem key={type} value={type}>
                {subjectLabel(type)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label
          htmlFor={`${id}-action`}
          className="text-xs text-muted-foreground"
        >
          {t("action")}
        </Label>
        <Select
          value={filters.action ?? ALL}
          onValueChange={(v) => update({ action: fromSelect(v) })}
        >
          <SelectTrigger id={`${id}-action`} className="h-9 w-52 bg-card">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{t("allActions")}</SelectItem>
            {actionGroups.map((type) => (
              <SelectGroup key={type}>
                {!subject && <SelectLabel>{subjectLabel(type)}</SelectLabel>}
                {AUDIT_ACTIONS[type].map((verb) => {
                  const action = `${type}.${verb}`;
                  return (
                    <SelectItem key={action} value={action}>
                      {actionLabel(action)}
                    </SelectItem>
                  );
                })}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label
          htmlFor={`${id}-country`}
          className="text-xs text-muted-foreground"
        >
          {t("country")}
        </Label>
        <Select
          value={filters.country_id?.toString() ?? ALL}
          onValueChange={(v) => update({ country_id: fromSelect(v) })}
        >
          <SelectTrigger id={`${id}-country`} className="h-9 w-44 bg-card">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{t("allCountries")}</SelectItem>
            {countries.map((country) => (
              <SelectItem key={country.id} value={country.id.toString()}>
                {country.name[locale]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${id}-from`} className="text-xs text-muted-foreground">
          {t("from")}
        </Label>
        <Input
          id={`${id}-from`}
          type="date"
          value={filters.from ?? ""}
          max={filters.to}
          onChange={(event) => update({ from: event.target.value || null })}
          className="h-9 w-40 bg-card"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${id}-to`} className="text-xs text-muted-foreground">
          {t("to")}
        </Label>
        <Input
          id={`${id}-to`}
          type="date"
          value={filters.to ?? ""}
          min={filters.from}
          onChange={(event) => update({ to: event.target.value || null })}
          className="h-9 w-40 bg-card"
        />
      </div>

      {hasFilters && (
        <Button
          variant="ghost"
          className="h-9"
          onClick={() =>
            startTransition(() => router.replace({ pathname, query: {} }))
          }
        >
          <XIcon />
          {t("clear")}
        </Button>
      )}

      {isPending && <Spinner className="mb-2.5 text-muted-foreground" />}
    </div>
  );
}
