"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type {
  Permission,
  PermissionAction,
  PermissionModule,
} from "@/types/roles";

// Sections as rows, actions as columns. Read-only without `onChange`;
// with it, every checkbox toggles and a section name toggles its whole row
export default function PermissionMatrix({
  matrix,
  value,
  onChange,
  className,
}: {
  matrix: PermissionModule[];
  value: readonly Permission[];
  onChange?: (value: Permission[]) => void;
  className?: string;
}) {
  const t = useTranslations("Roles.roles");
  const editable = onChange !== undefined;
  const selected = useMemo(() => new Set(value), [value]);

  // Every action any section supports, in the order the API first lists them
  const actions = useMemo(() => {
    const seen = new Map<PermissionAction, string>();
    for (const section of matrix) {
      for (const permission of section.permissions) {
        if (!seen.has(permission.action)) {
          seen.set(permission.action, permission.label);
        }
      }
    }
    return [...seen].map(([action, label]) => ({ action, label }));
  }, [matrix]);

  const update = (names: Permission[], on: boolean) => {
    const next = new Set(selected);
    names.forEach((name) => (on ? next.add(name) : next.delete(name)));
    onChange?.([...next]);
  };

  const headClass =
    "h-9 text-[10px] font-semibold tracking-wider text-muted-foreground/70 uppercase";

  return (
    <Table className={cn("[&_td]:px-4 [&_td]:py-3 [&_th]:px-4", className)}>
      <TableHeader className="bg-muted/60">
        <TableRow className="border-y border-border/60 hover:bg-transparent">
          <TableHead className={headClass}>{t("section")}</TableHead>
          {actions.map(({ action, label }) => (
            <TableHead key={action} className={cn(headClass, "text-center")}>
              {label}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>

      <TableBody className="[&_tr]:border-border/50">
        {matrix.map((section) => {
          const names = section.permissions.map((item) => item.name);
          const allOn = names.every((name) => selected.has(name));

          return (
            <TableRow key={section.module}>
              <TableCell className="text-[13px] font-semibold text-foreground">
                {editable ? (
                  <button
                    type="button"
                    onClick={() => update(names, !allOn)}
                    className="text-start outline-none hover:text-secondary focus-visible:text-secondary"
                  >
                    {section.label}
                  </button>
                ) : (
                  section.label
                )}
              </TableCell>

              {actions.map(({ action, label }) => {
                const permission = section.permissions.find(
                  (item) => item.action === action,
                );

                return (
                  <TableCell key={action} className="text-center">
                    {permission ? (
                      <Checkbox
                        checked={selected.has(permission.name)}
                        disabled={!editable}
                        onCheckedChange={(checked) =>
                          update([permission.name], checked === true)
                        }
                        aria-label={`${section.label}: ${label}`}
                        className={cn(
                          "mx-auto",
                          editable &&
                            "cursor-pointer data-checked:border-secondary data-checked:bg-secondary",
                        )}
                      />
                    ) : (
                      <span
                        aria-label={t("notAvailable")}
                        className="text-muted-foreground/40"
                      >
                        ·
                      </span>
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
