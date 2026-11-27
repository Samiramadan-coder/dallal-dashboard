import "server-only";

import { cookies, headers } from "next/headers";
import { unstable_rethrow } from "next/navigation";
import type { Locale } from "next-intl";
import { hasLocale } from "next-intl";
import { getLocale } from "next-intl/server";

import { routing } from "@/i18n/routing";

// Set by the next-intl middleware on every request it handles
const INTL_LOCALE_HEADER = "x-next-intl-locale";

const localeCookieName =
  typeof routing.localeCookie === "object" && routing.localeCookie.name
    ? routing.localeCookie.name
    : "admin_lang";

// getLocale() relies on the request config, which reads `next/root-params`.
// That throws in Route Handlers and Server Actions, so fall back to what
// the request itself says about the locale. Like the proxy, this ignores
// Accept-Language: without a chosen language the admin gets the default
export async function resolveLocale(): Promise<Locale> {
  try {
    return await getLocale();
  } catch (error) {
    unstable_rethrow(error);
  }

  try {
    const requestHeaders = await headers();

    const fromMiddleware = requestHeaders.get(INTL_LOCALE_HEADER);
    if (hasLocale(routing.locales, fromMiddleware)) return fromMiddleware;

    const fromCookie = (await cookies()).get(localeCookieName)?.value;
    if (hasLocale(routing.locales, fromCookie)) return fromCookie;
  } catch (error) {
    // No request scope (e.g. inside "use cache")
    unstable_rethrow(error);
  }

  return routing.defaultLocale;
}
