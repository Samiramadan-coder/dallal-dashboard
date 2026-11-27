import type { SearchParams } from "nuqs/server";

import { getAuditLogAdmins, getAuditLogs } from "@/lib/audit-log";
import { hasPermission } from "@/lib/permissions";
import { getAllCountries, getCurrentAdmin } from "@/lib/admin";
import DataPreview from "@/components/audit-log/data-preview";
import AuditLogFilters from "@/components/audit-log/filters";
import {
  auditLogApiQuery,
  auditLogFilters,
  hasAuditLogFilters,
  loadAuditLogSearchParams,
} from "@/components/audit-log/search-params";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  // Access is checked by the layout
  const params = await loadAuditLogSearchParams(searchParams);

  // The admins list needs its own permission; without it the "Admin"
  // filter is hidden. Cached since the layout fetched it
  const me = await getCurrentAdmin();
  const canListAdmins = hasPermission(me.permissions, "admins.view");

  const [{ logs, pagination }, admins, countries] = await Promise.all([
    getAuditLogs(auditLogApiQuery(params)),
    canListAdmins ? getAuditLogAdmins() : null,
    getAllCountries(),
  ]);

  return (
    <DataPreview
      logs={logs}
      meta={pagination}
      filtered={hasAuditLogFilters(auditLogFilters(params))}
      toolbar={<AuditLogFilters admins={admins} countries={countries} />}
    />
  );
}
