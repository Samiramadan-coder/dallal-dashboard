"use client";

import { XIcon } from "lucide-react";
import { useQueryStates } from "nuqs";
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
import { Button } from "@/components/ui/button";
import DateRangeFilter from "@/components/common/data-table/date-range-filter";
import {
  AUDIT_ACTIONS,
  isAuditSubject,
  type AuditSubject,
} from "@/constants/audit-log";
import type { Country } from "@/types/countries";
import type { Locale } from "@/types/shared";
import type { AuditLogAdminOption } from "@/types/audit-log";
import {
  CLEAR_FILTERS,
  RESET_PAGE,
  auditLogFilters,
  auditLogSearchParams,
  hasAuditLogFilters,
} from "./search-params";
import { useAuditLabels } from "./use-audit-labels";

// Radix Select can't hold an empty value; this one stands for "no filter"
const ALL = "all";

const SUBJECTS = Object.keys(AUDIT_ACTIONS) as AuditSubject[];

const TRIGGER = "h-8 bg-card text-xs";

// The audit log's filters, for the table's toolbar. They live in the URL
// (shallow: false re-runs the server page), so a filtered view is a link
export default function AuditLogFilters({
  admins,
  countries,
}: {
  // null: the admin can't list admins, so the filter is hidden
  admins: AuditLogAdminOption[] | null;
  countries: Country[];
}) {
  const locale = useLocale() as Locale;
  const t = useTranslations("AuditLog.filters");
  const { actionLabel, subjectLabel } = useAuditLabels();
  const [params, setParams] = useQueryStates(auditLogSearchParams, {
    shallow: false,
  });

  // The validated view, the same one the server queried with
  const filters = auditLogFilters(params);

  const fromSelect = (value: string) => (value === ALL ? null : value);
  const idFromSelect = (value: string) =>
    value === ALL ? null : Number(value);

  const subject =
    filters.subject_type && isAuditSubject(filters.subject_type)
      ? filters.subject_type
      : undefined;

  // A chosen target narrows the actions to its own
  const actionGroups = subject ? [subject] : SUBJECTS;

  return (
    <>
      {admins && (
        <Select
          value={filters.admin_id?.toString() ?? ALL}
          onValueChange={(v) =>
            void setParams({ admin_id: idFromSelect(v), ...RESET_PAGE })
          }
        >
          <SelectTrigger aria-label={t("admin")} className={`${TRIGGER} w-40`}>
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
      )}

      <Select
        value={filters.subject_type ?? ALL}
        onValueChange={(v) => {
          const next = fromSelect(v);
          // An action of another target would match nothing
          const keepAction =
            next !== null && filters.action?.startsWith(`${next}.`);
          void setParams({
            subject_type: next,
            action: keepAction ? (filters.action ?? null) : null,
            ...RESET_PAGE,
          });
        }}
      >
        <SelectTrigger aria-label={t("subject")} className={`${TRIGGER} w-36`}>
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

      <Select
        value={filters.action ?? ALL}
        onValueChange={(v) =>
          void setParams({ action: fromSelect(v), ...RESET_PAGE })
        }
      >
        <SelectTrigger aria-label={t("action")} className={`${TRIGGER} w-48`}>
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

      <Select
        value={filters.country_id?.toString() ?? ALL}
        onValueChange={(v) =>
          void setParams({ country_id: idFromSelect(v), ...RESET_PAGE })
        }
      >
        <SelectTrigger aria-label={t("country")} className={`${TRIGGER} w-40`}>
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

      <DateRangeFilter
        label={t("dates")}
        value={{ from: filters.from ?? null, to: filters.to ?? null }}
        onChange={(range) => void setParams({ ...range, ...RESET_PAGE })}
      />

      {hasAuditLogFilters(filters) && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => void setParams(CLEAR_FILTERS)}
        >
          <XIcon />
          {t("clear")}
        </Button>
      )}
    </>
  );
}
