import "server-only";

import { api, type QueryParams } from "@/lib/api/client";
import { getAllCountries } from "@/lib/admin";
import type { AdminsResponse } from "@/types/roles";
import type {
  AuditLogAdminOption,
  AuditLogRow,
  AuditLogsResponse,
} from "@/types/audit-log";

// One page of the audit log, newest first, with countries resolved.
// `query` comes from auditLogApiQuery (components/audit-log/search-params),
// which validates the filters
export async function getAuditLogs(query: QueryParams) {
  const [response, countries] = await Promise.all([
    api.get<AuditLogsResponse>("/api/v1/admin/audit-logs", {
      query,
      next: { tags: ["audit-logs"] },
    }),
    getAllCountries(),
  ]);

  const byId = new Map(countries.map((country) => [country.id, country]));

  const logs: AuditLogRow[] = response.data.data.map((log) => ({
    ...log,
    country:
      log.country_id === null ? null : (byId.get(log.country_id) ?? null),
  }));

  return { logs, pagination: response.data.meta };
}

// Every admin, for the "Admin" filter. The team is small; 100 covers it
export async function getAuditLogAdmins(): Promise<AuditLogAdminOption[]> {
  const response = await api.get<AdminsResponse>("/api/v1/admin/admins", {
    query: { per_page: 100 },
    next: { tags: ["admins"] },
  });
  return response.data.data.map(({ id, name }) => ({ id, name }));
}
