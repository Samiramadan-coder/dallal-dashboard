import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";

import {
  AUTH_COOKIE_NAME,
  SESSION_EXPIRED,
  SESSION_PARAM,
} from "./lib/api/auth-cookie";
import {
  CALLBACK_URL_PARAM,
  HOME_PATH,
  PATHNAME_HEADER,
  SIGN_IN_PATH,
  isGuestOnlyRoute,
  isProtectedRoute,
  localizePath,
  safeCallbackUrl,
  splitLocale,
} from "./lib/auth-routes";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

const OVERRIDE_HEADERS = "x-middleware-override-headers";
const REQUEST_HEADER_PREFIX = "x-middleware-request-";

// Adds a request header for the server without dropping the ones next-intl
// already forwards (it overrides request headers via NextResponse.next/rewrite)
function forwardRequestHeader(
  request: NextRequest,
  response: NextResponse,
  name: string,
  value: string,
) {
  const existing = response.headers.get(OVERRIDE_HEADERS);
  const names = existing
    ? existing.split(",").map((header) => header.trim())
    : // No override yet: an override list replaces all request headers,
      // so carry over the original ones
      [...request.headers.keys()].map((header) => {
        response.headers.set(
          `${REQUEST_HEADER_PREFIX}${header}`,
          request.headers.get(header) ?? "",
        );
        return header;
      });

  if (!names.includes(name)) names.push(name);
  response.headers.set(OVERRIDE_HEADERS, names.join(","));
  response.headers.set(`${REQUEST_HEADER_PREFIX}${name}`, value);
}

// `nextUrl.pathname` and every app path (callbackUrl included) leave out the
// basePath ("/admin", see next.config.ts); only a redirect's absolute URL
// needs it, which `new URL(path, request.url)` would drop
function appUrl(request: NextRequest, path: string): URL {
  return new URL(`${request.nextUrl.basePath}${path}`, request.url);
}

// next-intl picks the locale from the URL, then the admin_lang cookie, then
// Accept-Language. Hiding the header from it makes Arabic the default for
// everyone who hasn't chosen a language, whatever their browser says.
// Only next-intl sees this copy; the page still gets the original request
function withoutAcceptLanguage(request: NextRequest): NextRequest {
  if (!request.headers.has("accept-language")) return request;

  const headers = new Headers(request.headers);
  headers.delete("accept-language");

  return new NextRequest(request.url, {
    headers,
    nextConfig: { basePath: request.nextUrl.basePath || undefined },
  });
}

export default function proxy(request: NextRequest) {
  const { nextUrl } = request;
  const sessionExpired =
    nextUrl.searchParams.get(SESSION_PARAM) === SESSION_EXPIRED;
  // Only checks that the cookie exists; the API decides if it's still valid
  const isSignedIn =
    !sessionExpired && Boolean(request.cookies.get(AUTH_COOKIE_NAME)?.value);

  let response = intlMiddleware(withoutAcceptLanguage(request));
  const isRedirect = response.headers.has("location");

  // Let next-intl's own redirects (e.g. adding the locale prefix) run first;
  // past this point the URL's locale is the final one
  if (!isRedirect) {
    const { locale } = splitLocale(nextUrl.pathname);

    if (!isSignedIn && isProtectedRoute(nextUrl.pathname)) {
      const callbackSearch = new URLSearchParams(nextUrl.search);
      callbackSearch.delete(SESSION_PARAM);
      const query = callbackSearch.toString();

      const url = appUrl(request, localizePath(SIGN_IN_PATH, locale));
      url.searchParams.set(
        CALLBACK_URL_PARAM,
        `${nextUrl.pathname}${query ? `?${query}` : ""}`,
      );
      response = NextResponse.redirect(url);
    } else if (isSignedIn && isGuestOnlyRoute(nextUrl.pathname)) {
      const target = safeCallbackUrl(
        nextUrl.searchParams.get(CALLBACK_URL_PARAM),
        localizePath(HOME_PATH, locale),
      );
      response = NextResponse.redirect(appUrl(request, target));
    } else {
      // Always overwritten, so clients can't spoof it
      forwardRequestHeader(
        request,
        response,
        PATHNAME_HEADER,
        `${nextUrl.pathname}${nextUrl.search}`,
      );
    }
  }

  if (sessionExpired) response.cookies.delete(AUTH_COOKIE_NAME);

  return response;
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  // - "/" on its own: with basePath the pattern below becomes "/admin/(...)",
  //   which needs a trailing slash, so the bare "/admin" would skip the proxy
  matcher: ["/", "/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};
