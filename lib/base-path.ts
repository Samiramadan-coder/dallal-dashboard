// The dashboard is served under this path (next.config.ts `basePath`).
// next/link, next-intl and next/navigation add it on their own; a raw
// fetch() from the browser doesn't, so prefix it with withBasePath()
export const BASE_PATH = "/admin";

// "/api/admins/export?x=1" → "/admin/api/admins/export?x=1"
export function withBasePath(path: string): string {
  if (!path.startsWith("/") || path.startsWith(`${BASE_PATH}/`)) return path;
  return `${BASE_PATH}${path}`;
}
