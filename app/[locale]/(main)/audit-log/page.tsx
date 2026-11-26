import {
  getAuditLogAdmins,
  getAuditLogs,
  parseAuditLogFilters,
} from "@/lib/audit-log";

import { hasPermission } from "@/lib/permissions";
import { getAllCountries, getCurrentAdmin } from "@/lib/admin";
import DataPreview from "@/components/audit-log/data-preview";
import AuditLogFilters from "@/components/audit-log/filters";

type SearchParams = {
  page?: string;
  admin_id?: string;
  action?: string;
  subject_type?: string;
  subject_id?: string;
  country_id?: string;
  from?: string;
  to?: string;
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  // Access is checked by the layout
  const { page, ...params } = await searchParams;
  const filters = parseAuditLogFilters(params);

  // The admins list needs its own permission; without it the "Admin"
  // filter is hidden. Cached since the layout fetched it
  const me = await getCurrentAdmin();
  const canListAdmins = hasPermission(me.permissions, "admins.view");

  const [{ logs, pagination }, admins, countries] = await Promise.all([
    getAuditLogs(Math.max(1, Number(page) || 1), filters),
    canListAdmins ? getAuditLogAdmins() : null,
    getAllCountries(),
  ]);

  return (
    <div className="flex flex-col gap-3">
      <AuditLogFilters
        filters={filters}
        admins={admins}
        countries={countries}
      />
      <DataPreview
        logs={logs}
        pagination={pagination}
        filtered={Object.values(filters).some((value) => value !== undefined)}
      />
    </div>
  );
}
