import "server-only";

import { api } from "@/lib/api/client";
import { getAllCountries } from "@/lib/admin";
import type { AdminsResponse } from "@/types/roles";
import type {
  AuditLogAdminOption,
  AuditLogFilters,
  AuditLogRow,
  AuditLogsResponse,
} from "@/types/audit-log";

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const SLUG = /^[a-z_]+$/;
const ACTION = /^[a-z_]+(\.[a-z_]+)?$/;

function positiveInt(value: string | undefined): number | undefined {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : undefined;
}

function matching(value: string | undefined, pattern: RegExp) {
  return value && pattern.test(value) ? value : undefined;
}

// The filters in the URL, with anything malformed dropped, so a hand-edited
// link shows an unfiltered log instead of the API's 422
export function parseAuditLogFilters(
  params: Partial<Record<keyof AuditLogFilters, string>>,
): AuditLogFilters {
  return {
    admin_id: positiveInt(params.admin_id),
    action: matching(params.action, ACTION),
    subject_type: matching(params.subject_type, SLUG),
    subject_id: positiveInt(params.subject_id),
    country_id: positiveInt(params.country_id),
    from: matching(params.from, DATE),
    to: matching(params.to, DATE),
  };
}

// One page of the audit log, newest first, with countries resolved
export async function getAuditLogs(page: number, filters: AuditLogFilters) {
  const [response, countries] = await Promise.all([
    api.get<AuditLogsResponse>("/api/v1/admin/audit-logs", {
      query: {
        page,
        ...filters,
        // The API reads a bare date as midnight, which would leave the
        // chosen day out
        to: filters.to && `${filters.to} 23:59:59`,
      },
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
