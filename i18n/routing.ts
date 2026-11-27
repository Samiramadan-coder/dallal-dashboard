import { defineRouting } from "next-intl/routing";

export const locales = ["en", "ar"] as const;
export type AppLocale = (typeof locales)[number];

export const routing = defineRouting({
  locales,
  defaultLocale: "ar",
  // Use 'as-needed' so default locale is served at `/` and
  // non-default locales are prefixed (e.g. `/en`).
  localePrefix: "as-needed",
  // Remembers the admin's language choice. The browser's Accept-Language is
  // ignored (see proxy.ts), so a first visit is always Arabic
  localeCookie: { name: "admin_lang" },
});
