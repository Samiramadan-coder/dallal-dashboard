import { NextRequest, NextResponse } from "next/server";

import { AUTH_COOKIE_NAME } from "@/lib/api/auth-cookie";
import { SIGN_IN_PATH, safeCallbackUrl } from "@/lib/auth-routes";

export async function GET(request: NextRequest) {
  // `next` is an app path without the basePath; only same-site paths are kept
  const nextPath = safeCallbackUrl(
    request.nextUrl.searchParams.get("next"),
    SIGN_IN_PATH,
  );

  const response = NextResponse.redirect(
    new URL(`${request.nextUrl.basePath}${nextPath}`, request.url),
  );

  response.cookies.delete(AUTH_COOKIE_NAME);

  return response;
}
