"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";
import RolePanel from "./role-panel";
import { LockIcon, ShieldIcon } from "lucide-react";
import EmptyState from "@/components/reusable/empty-state";
import { useLocale, useTranslations } from "next-intl";
import type { Can, PermissionModule, Role } from "@/types/roles";

export default function DataPreview({
  roles,
  matrix,
  can,
}: {
  roles: Role[];
  matrix: PermissionModule[];
  can: Can<"roles">;
}) {
  const locale = useLocale();
  const t = useTranslations("Roles.roles");
  const [selectedId, setSelectedId] = useState(roles[0]?.id);
  const selected = roles.find((role) => role.id === selectedId) ?? roles[0];

  if (!selected) {
    return <EmptyState framed icon={ShieldIcon} title={t("empty")} />;
  }

  return (
    <div className="grid items-start gap-4 lg:grid-cols-[16rem_minmax(0,1fr)]">
      {/* Role list */}
      <nav aria-label={t("list")} className="flex flex-col gap-2">
        {roles.map((role) => {
          const isActive = role.id === selected.id;

          return (
            <button
              key={role.id}
              type="button"
              onClick={() => setSelectedId(role.id)}
              aria-current={isActive ? "true" : undefined}
              className={cn(
                "flex items-start justify-between gap-3 rounded-xl border bg-card px-4 py-3.5 text-start transition-colors outline-none focus-visible:ring-2 focus-visible:ring-secondary/30",
                isActive
                  ? "border-secondary ring-1 ring-secondary"
                  : "border-border hover:border-secondary/40",
              )}
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-foreground">
                  {role.label[locale]}
                </span>
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  {t("admins", { count: role.admins_count })}
                </span>
              </span>

              {role.is_system && (
                <LockIcon
                  aria-hidden
                  className="mt-0.5 size-3.5 shrink-0 text-muted-foreground/70"
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Keyed so unsaved edits reset when another role is picked */}
      <RolePanel
        key={selected.id}
        role={selected}
        matrix={matrix}
        can={can}
        onCreated={setSelectedId}
      />
    </div>
  );
}
