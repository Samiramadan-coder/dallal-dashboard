import type { NextRequest } from "next/server";

import { api } from "@/lib/api/client";
import { toErrorResponse } from "@/lib/api/route";
import {
  adminsApiQuery,
  loadAdminsSearchParams,
} from "@/components/roles/admins/search-params";

// TODO(backend): placeholder path until the export endpoint is agreed
const BACKEND_EXPORT_PATH = "/api/v1/admin/admins/export";
const FALLBACK_FILENAME = "admins.csv";

// Both forms, so every browser keeps non-ASCII (Arabic) names:
// filename="…" for old ones, filename*=UTF-8''… (RFC 6266) for the rest
function contentDisposition(filename: string): string {
  const ascii = filename.replace(/[^\x20-\x7e]/g, "_").replace(/["\\]/g, "_");
  return `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(filename)}`;
}

// GET /admin/api/admins/export?status=…&search=…&sort=…
// Reads the table's URL params the same way the page does, sends them to
// the backend export and streams the file back. The backend checks the
// admin's permissions; this route only relays
export async function GET(request: NextRequest) {
  try {
    const params = loadAdminsSearchParams(request.nextUrl.searchParams);
    // Every matching admin, not one page of them
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { page, per_page, ...query } = adminsApiQuery(params);

    const file = await api.get(BACKEND_EXPORT_PATH, {
      query,
      responseType: "stream",
      // A 401 becomes a JSON error for the button, not a redirect whose
      // HTML would be saved as the "file"
      skipAuthRedirect: true,
      cache: "no-store",
    });

    return new Response(file.data, {
      headers: {
        "Content-Type": file.contentType ?? "text/csv; charset=utf-8",
        "Content-Disposition": contentDisposition(
          file.filename ?? FALLBACK_FILENAME,
        ),
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
