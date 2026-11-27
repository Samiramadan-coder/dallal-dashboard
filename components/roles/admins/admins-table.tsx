"use client";

import { useCallback, useMemo, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import type { ColumnDef } from "@tanstack/react-table";
import { CopyIcon, PencilIcon, Trash2Icon, UsersIcon } from "lucide-react";
import { useFormatter, useLocale, useTranslations } from "next-intl";

import { deleteAdmin } from "@/lib/actions/admins";
import type { Country } from "@/types/countries";
import type { AdminRow, Can, Role } from "@/types/roles";
import type { Locale, Pagination } from "@/types/shared";
import { Button } from "@/components/ui/button";
import DataTable from "@/components/common/data-table/data-table";
import type { DataTableRowAction } from "@/components/common/data-table/types";
import ConfirmDialog from "@/components/reusable/confirm-dialog";
import EmptyState from "@/components/reusable/empty-state";
import StatusBadge from "@/components/reusable/status-badge";
import { AdminsSearch, AdminsStatusTabs } from "./admins-filters";
import { EditAdminDialog } from "./edit-admin-dialog";

// Params the export keeps: the filters and sort, not the page, so the file
// has every matching admin
const EXPORT_SKIPS = new Set(["page", "per_page"]);

export default function AdminsTable({
  admins,
  meta,
  currentAdminId,
  roles,
  countries,
  can,
}: {
  admins: AdminRow[];
  meta: Pagination;
  // Your own account: no edit / delete from here
  currentAdminId: number;
  // Options for the edit dialog
  roles: Role[];
  countries: Country[];
  // Hides actions the admin may not use; the API rejects them anyway
  can: Can<"admins">;
}) {
  const locale = useLocale() as Locale;
  const format = useFormatter();
  const t = useTranslations("Roles.admins");
  const tCommon = useTranslations("Common");
  const searchParams = useSearchParams();

  // The row whose dialog is open. `opening` bumps on every open, so each
  // one mounts a fresh form (no leftovers from a cancelled edit), while
  // closing keeps it mounted for the close animation
  const [editing, setEditing] = useState<{ admin: AdminRow; opening: number }>();
  const [editOpen, setEditOpen] = useState(false);
  const [deleting, setDeleting] = useState<AdminRow>();

  const openEdit = useCallback((admin: AdminRow) => {
    setEditing((current) => ({ admin, opening: (current?.opening ?? 0) + 1 }));
    setEditOpen(true);
  }, []);

  const columns = useMemo<ColumnDef<AdminRow>[]>(
    () => [
      {
        accessorKey: "name",
        header: t("table.admin"),
        enableSorting: true,
        enableHiding: false,
        meta: { className: "min-w-44" },
        cell: ({ row }) => (
          <span className="flex items-center gap-2">
            <span className="font-semibold text-foreground">
              {row.original.name}
            </span>
            {row.original.id === currentAdminId && (
              <span className="rounded-full bg-secondary/10 px-1.5 py-px text-[10px] font-semibold text-secondary">
                {t("you")}
              </span>
            )}
          </span>
        ),
      },
      {
        accessorKey: "email",
        header: t("table.email"),
        enableSorting: true,
        meta: { className: "min-w-48" },
      },
      {
        id: "roles",
        header: t("table.role"),
        cell: ({ row }) =>
          row.original.roleLabels.join(locale === "ar" ? "، " : ", "),
      },
      {
        id: "countries",
        header: t("table.countries"),
        cell: ({ row }) =>
          row.original.resolvedCountries.length > 0 ? (
            <span className="flex flex-wrap items-center gap-3">
              {row.original.resolvedCountries.map((country) => (
                <span
                  key={country.id}
                  title={country.name[locale]}
                  className="flex items-center gap-1.5"
                >
                  <Image
                    src={country.flag}
                    alt=""
                    width={20}
                    height={14}
                    className="h-3.5 w-5 rounded-xs object-cover"
                  />
                  {country.code}
                </span>
              ))}
            </span>
          ) : (
            <span className="text-muted-foreground">{t("noCountries")}</span>
          ),
      },
      {
        accessorKey: "is_active",
        header: t("table.status"),
        enableSorting: true,
        cell: ({ row }) => (
          <StatusBadge status={row.original.is_active ? "active" : "inactive"} />
        ),
      },
      {
        accessorKey: "last_login_at",
        header: t("table.lastLogin"),
        enableSorting: true,
        meta: { className: "min-w-36" },
        cell: ({ row }) =>
          row.original.last_login_at ? (
            <span className="tabular-nums">
              {format.dateTime(new Date(row.original.last_login_at), {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          ) : (
            <span className="text-muted-foreground">{t("never")}</span>
          ),
      },
      {
        accessorKey: "two_factor_enabled",
        header: t("table.twoFactor"),
        cell: ({ row }) =>
          row.original.two_factor_enabled ? t("twoFactorOn") : t("twoFactorOff"),
      },
    ],
    [t, locale, format, currentAdminId],
  );

  // Built from permissions: none allowed → no actions column at all
  const rowActions = useMemo(() => {
    const actions: DataTableRowAction<AdminRow>[] = [];
    const isMe = (admin: AdminRow) => admin.id === currentAdminId;

    if (can.edit) {
      actions.push({
        label: tCommon("Edit"),
        icon: PencilIcon,
        onSelect: openEdit,
        hidden: isMe,
      });
    }
    if (can.delete) {
      actions.push({
        label: tCommon("Delete"),
        icon: Trash2Icon,
        variant: "destructive",
        separatorBefore: true,
        onSelect: setDeleting,
        hidden: isMe,
      });
    }
    return actions;
  }, [can.edit, can.delete, currentAdminId, tCommon, openEdit]);

  const exportQuery = new URLSearchParams(
    [...searchParams.entries()].filter(([key]) => !EXPORT_SKIPS.has(key)),
  ).toString();

  const filtered =
    searchParams.has("status") || Boolean(searchParams.get("search"));

  async function remove(reason: string) {
    if (!deleting) return false;
    const result = await deleteAdmin(deleting.id, reason);

    if (!result.ok) {
      toast.error(result.message || tCommon("ErrorOccurred"));
      return false;
    }

    toast.success(result.data.message || t("deleted"));
  }

  async function copyEmails(selected: AdminRow[], clear: () => void) {
    try {
      await navigator.clipboard.writeText(
        selected.map((admin) => admin.email).join(", "),
      );
      toast.success(t("emailsCopied", { count: selected.length }));
      clear();
    } catch {
      toast.error(tCommon("ErrorOccurred"));
    }
  }

  return (
    <>
      <DataTable
        data={admins}
        meta={meta}
        columns={columns}
        getRowId={(admin) => String(admin.id)}
        header={<AdminsStatusTabs />}
        toolbar={<AdminsSearch />}
        exportUrl={`/api/admins/export${exportQuery ? `?${exportQuery}` : ""}`}
        rowActions={rowActions}
        selectable
        bulkActions={(selected, clear) => (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => copyEmails(selected, clear)}
          >
            <CopyIcon />
            {t("copyEmails")}
          </Button>
        )}
        defaultHidden={["two_factor_enabled"]}
        onRowClick={
          can.edit
            ? (admin) => admin.id !== currentAdminId && openEdit(admin)
            : undefined
        }
        emptyState={
          filtered ? (
            <EmptyState variant="filtered" />
          ) : (
            <EmptyState
              icon={UsersIcon}
              title={t("empty.title")}
              description={t("empty.description")}
            />
          )
        }
      />

      {editing && (
        <EditAdminDialog
          key={`${editing.admin.id}-${editing.opening}`}
          admin={editing.admin}
          roles={roles}
          countries={countries}
          open={editOpen}
          onOpenChange={setEditOpen}
        />
      )}

      <ConfirmDialog
        open={deleting !== undefined}
        onOpenChange={(open) => !open && setDeleting(undefined)}
        tone="destructive"
        icon={Trash2Icon}
        title={tCommon("DeleteTitle")}
        description={
          deleting
            ? t("deleteDescription", { name: deleting.name })
            : tCommon("DeleteConfirmation")
        }
        confirmLabel={tCommon("Delete")}
        onConfirm={remove}
      />
    </>
  );
}
