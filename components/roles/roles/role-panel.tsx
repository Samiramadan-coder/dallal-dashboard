"use client";

import { useState } from "react";
import { toast } from "sonner";
import { LockIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { deleteRole, updateRole } from "@/lib/actions/roles";
import DeleteBtn from "@/components/reusable/delete-btn";
import type { Can, Permission, PermissionModule, Role } from "@/types/roles";
import CreateRole from "./create-role";
import PermissionMatrix from "./permission-matrix";

function sameSet(a: readonly Permission[], b: readonly Permission[]) {
  if (a.length !== b.length) return false;
  const set = new Set(a);
  return b.every((item) => set.has(item));
}

// The selected role and its permission table. Custom roles are edited in
// place: changes stay local until "Save changes"
export default function RolePanel({
  role,
  matrix,
  can,
  onCreated,
}: {
  role: Role;
  matrix: PermissionModule[];
  can: Can<"roles">;
  onCreated: (id: number) => void;
}) {
  const locale = useLocale();
  const t = useTranslations("Roles.roles");
  const tCommon = useTranslations("Common");
  // null = no edits; the table shows what the server has
  const [draft, setDraft] = useState<Permission[] | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // System roles are fixed; custom ones need roles.edit
  const editable = can.edit && !role.is_system;

  const value = draft ?? role.permissions;
  const dirty = draft !== null && !sameSet(draft, role.permissions);
  const empty = value.length === 0;

  const save = async () => {
    if (!editable || !dirty || empty) return;
    setSaving(true);
    const result = await updateRole(role.id, { permissions: value });
    setSaving(false);

    if (!result.ok) {
      toast.error(result.message || tCommon("ErrorOccurred"));
      return;
    }

    setDraft(null);
    toast.success(result.data.message || t("saved"));
  };

  // The page then falls back to the first role
  const remove = async () => {
    setDeleting(true);
    const result = await deleteRole(role.id);
    setDeleting(false);

    if (!result.ok) {
      toast.error(result.message || tCommon("ErrorOccurred"));
      return;
    }

    toast.success(result.data.message || t("deleted"));
  };

  return (
    <section className="min-w-0 overflow-hidden rounded-xl border border-border bg-card">
      <header className="flex flex-wrap items-start justify-between gap-4 px-5 py-4">
        <div className="min-w-0 space-y-1">
          <h2 className="text-base font-semibold text-foreground">
            {role.label[locale]}
          </h2>
          <p className="text-[13px] text-muted-foreground">
            {t("admins", { count: role.admins_count })}
          </p>
          {role.is_system && (
            <p className="flex items-center gap-1.5 pt-1 text-xs text-primary">
              <LockIcon aria-hidden className="size-3" />
              {t("systemNote")}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {dirty ? (
            <>
              <span
                className={
                  empty
                    ? "text-xs text-destructive"
                    : "text-xs text-muted-foreground"
                }
              >
                {empty ? t("minOne") : t("unsaved")}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 text-xs"
                disabled={saving}
                onClick={() => setDraft(null)}
              >
                {t("discard")}
              </Button>
              <Button
                type="button"
                size="sm"
                className="h-8 min-w-28 bg-secondary text-xs text-primary-foreground hover:bg-secondary/90"
                disabled={saving || empty}
                onClick={save}
              >
                {saving ? <Spinner /> : t("save")}
              </Button>
            </>
          ) : (
            <>
              {can.delete && !role.is_system && (
                <DeleteBtn loading={deleting} onDelete={remove} />
              )}
              {can.create && (
                <CreateRole matrix={matrix} onCreated={onCreated} />
              )}
            </>
          )}
        </div>
      </header>

      <PermissionMatrix
        matrix={matrix}
        value={value}
        // Read-only without roles.edit: no onChange, checkboxes disabled
        onChange={editable && !saving ? setDraft : undefined}
      />
    </section>
  );
}
