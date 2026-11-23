import "server-only";

import { api } from "@/lib/api/client";
import { getAllCountries } from "@/lib/admin";
import type { AuditLogRow, AuditLogsResponse } from "@/types/audit-log";

// One page of the audit log, newest first, with countries resolved
export async function getAuditLogs(page: number) {
  const [response, countries] = await Promise.all([
    api.get<AuditLogsResponse>("/api/v1/admin/audit-logs", {
      query: { page },
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
