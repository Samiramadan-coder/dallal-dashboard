// Messages are typed against messages/en.json (types/next-intl.d.ts), so
// t("x") only accepts keys that exist. Some keys come from data instead:
// role names and audit actions from the API, status values. Those can't be
// checked at build time, so they always go through t.has() first:
//   const tRoles = dynamicMessages(useTranslations("layout.header.roles"));
//   tRoles.has(role) ? tRoles(role) : role
// The cast lives here only, so every unchecked key is easy to find

export type DynamicTranslator = {
  (key: string, values?: Record<string, string | number | Date>): string;
  has(key: string): boolean;
  raw(key: string): unknown;
};

export function dynamicMessages(t: unknown): DynamicTranslator {
  return t as DynamicTranslator;
}
