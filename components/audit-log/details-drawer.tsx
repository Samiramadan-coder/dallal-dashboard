"use client";

import { useState } from "react";
import Image from "next/image";
import { Minus, Plus } from "lucide-react";
import { useFormatter, useLocale, useTranslations } from "next-intl";

import DetailsDrawer, {
  DrawerDetail as Detail,
  DrawerDetails,
  DrawerSection as Section,
} from "@/components/reusable/details-drawer";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { AuditLogRow } from "@/types/audit-log";
import type { Locale } from "@/types/shared";
import { diffSnapshots, type FieldDiff, type Primitive } from "./diff";
import { subjectName, useAuditLabels } from "./use-audit-labels";

// "2026-11-25 19:09:59" (Laravel, UTC) or ISO 8601
const DATE_TIME = /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}/;

// The "view details" button in an audit row and the drawer it opens: who did
// what, when and why, and what changed field by field
export default function AuditLogDetailsDrawer({ log }: { log: AuditLogRow }) {
  const locale = useLocale() as Locale;
  const format = useFormatter();
  const t = useTranslations("AuditLog.details");
  const { actionLabel, subjectLabel, fieldLabel } = useAuditLabels();
  const [showUnchanged, setShowUnchanged] = useState(false);

  const fields = diffSnapshots(log.before, log.after);
  const changed = fields.filter((field) => field.changed);
  const unchanged = fields.filter((field) => !field.changed);
  const shown = showUnchanged ? fields : changed;
  const name = subjectName(log, locale);

  // Only one side: a created or deleted record shows its values plainly
  const created = log.before === null && log.after !== null;
  const deleted = log.after === null && log.before !== null;

  const formatValue = (value: unknown): string => {
    if (value === undefined || value === null || value === "") {
      return t("empty");
    }
    if (typeof value === "boolean") return value ? t("yes") : t("no");
    if (typeof value === "string" && DATE_TIME.test(value)) {
      const iso = value.replace(" ", "T");
      const date = new Date(
        /[zZ]|[+-]\d{2}:?\d{2}$/.test(iso) ? iso : `${iso}Z`,
      );
      if (!Number.isNaN(date.getTime())) {
        return format.dateTime(date, {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      }
    }
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  };

  const chip = (item: Primitive, kind: "kept" | "added" | "removed") => (
    <li
      key={`${kind}-${String(item)}`}
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-mono text-[11px]",
        kind === "kept" && "bg-muted text-muted-foreground",
        kind === "added" && "bg-secondary/10 text-secondary",
        kind === "removed" && "bg-destructive/10 text-destructive line-through",
      )}
    >
      {kind === "added" && <Plus className="size-3" aria-label={t("added")} />}
      {kind === "removed" && (
        <Minus className="size-3" aria-label={t("removed")} />
      )}
      {formatValue(item)}
    </li>
  );

  // Laid out like the details above; lists and before/after pairs take the
  // full width
  const renderField = (field: FieldDiff) => (
    <Detail
      key={field.key}
      label={fieldLabel(field.key)}
      className={cn(
        (field.kind === "list" || (field.changed && !created && !deleted)) &&
          "col-span-2",
        !field.changed && "opacity-70",
      )}
    >
      {field.kind === "list" ? (
        field.kept.length + field.added.length + field.removed.length === 0 ? (
          <span className="text-xs text-muted-foreground">{t("empty")}</span>
        ) : (
          <ul className="flex flex-wrap gap-1.5">
            {field.removed.map((item) => chip(item, "removed"))}
            {field.added.map((item) => chip(item, "added"))}
            {field.kept.map((item) => chip(item, "kept"))}
          </ul>
        )
      ) : !field.changed || created || deleted ? (
        <span className="wrap-break-word">
          {formatValue(created ? field.after : (field.before ?? field.after))}
        </span>
      ) : (
        <span className="mt-1 grid grid-cols-[auto_1fr] items-baseline gap-x-2.5 gap-y-1.5">
          <span className="text-[11px] text-muted-foreground">
            {t("before")}
          </span>
          <span className="rounded-md bg-destructive/10 px-2 py-1 wrap-break-word text-destructive">
            {formatValue(field.before)}
          </span>
          <span className="text-[11px] text-muted-foreground">
            {t("after")}
          </span>
          <span className="rounded-md bg-secondary/10 px-2 py-1 wrap-break-word text-secondary">
            {formatValue(field.after)}
          </span>
        </span>
      )}
    </Detail>
  );

  return (
    <DetailsDrawer
      size="lg"
      onOpenChange={(open) => !open && setShowUnchanged(false)}
      title={actionLabel(log.action)}
      description={
        <span className="font-mono">
          {log.action} · #{log.id}
        </span>
      }
    >
      <DrawerDetails>
        <Detail label={t("time")}>
          {format.dateTime(new Date(log.created_at), {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })}
        </Detail>

        <Detail label={t("admin")}>
          {log.admin ? (
            <span className="flex flex-col">
              <span className="font-semibold">{log.admin.name}</span>
              <span className="text-[11px] text-muted-foreground">
                {log.admin.email}
              </span>
            </span>
          ) : (
            t("system")
          )}
        </Detail>

        <Detail label={t("subject")}>
          <span className="flex flex-col">
            <span className="font-mono text-xs text-secondary">
              {subjectLabel(log.subject_type)}
              {log.subject_id !== null && ` #${log.subject_id}`}
            </span>
            {name && (
              <span className="text-[11px] text-muted-foreground">{name}</span>
            )}
          </span>
        </Detail>

        <Detail label={t("country")}>
          {log.country ? (
            <span className="flex items-center gap-1.5">
              <Image
                src={log.country.flag}
                alt=""
                width={20}
                height={14}
                className="h-3.5 w-5 rounded-xs object-cover"
              />
              {log.country.name[locale]}
            </span>
          ) : (
            t("allCountries")
          )}
        </Detail>

        <Detail label={t("ip")}>
          <span className="font-mono text-xs">{log.ip ?? "—"}</span>
        </Detail>
      </DrawerDetails>

      {log.reason && (
        <Section title={t("reason")}>
          <p className="rounded-lg bg-primary/12 px-3 py-2 text-[13px] leading-relaxed text-pretty text-foreground">
            {log.reason}
          </p>
        </Section>
      )}

      <Section
        title={
          created
            ? t("createdValues")
            : deleted
              ? t("deletedValues")
              : t("changes")
        }
      >
        {fields.length === 0 ? (
          <p className="text-xs text-muted-foreground">{t("noData")}</p>
        ) : (
          <>
            {changed.length === 0 && !showUnchanged && (
              <p className="text-xs text-muted-foreground">{t("noChanges")}</p>
            )}

            <DrawerDetails>{shown.map(renderField)}</DrawerDetails>

            {unchanged.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="self-start text-xs text-secondary"
                onClick={() => setShowUnchanged((value) => !value)}
              >
                {showUnchanged
                  ? t("hideUnchanged")
                  : t("showUnchanged", { count: unchanged.length })}
              </Button>
            )}
          </>
        )}
      </Section>
    </DetailsDrawer>
  );
}
