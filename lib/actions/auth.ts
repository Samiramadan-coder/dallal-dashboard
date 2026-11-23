"use server";

import { unstable_rethrow } from "next/navigation";

import { redirect } from "@/i18n/navigation";
import { SIGN_IN_PATH } from "@/lib/auth-routes";
import { api } from "@/lib/api/client";
import { resolveLocale } from "@/lib/api/locale";
import { getServerTranslator } from "@/lib/api/messages";
import {
  ValidationError,
  runAction,
  type ActionResult,
} from "@/lib/api/errors";
import {
  clearAuthToken,
  clearPendingAuthToken,
  getPendingAuthToken,
  setAuthToken,
  setPendingAuthToken,
} from "@/lib/api/auth-token";
import type { LoginFormData } from "@/types/auth";

const TOKEN_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
};

type LoginResponse = ApiResponse<{
  token: string;
  admin: { two_factor_enabled: boolean };
}>;

type SetupResponse = ApiResponse<{
  secret: string;
  otpauth_url: string;
}>;

export type LoginStep =
  // Done: the auth cookie is set
  | { step: "signed-in"; message?: string }
  // 2FA is on: send the same credentials again with `totp`
  | { step: "verify"; message?: string }
  // 2FA is off: add the account to an authenticator app, then confirm a code
  | { step: "setup"; message?: string; secret: string; otpauthUrl: string };

type LoginInput = LoginFormData & {
  // 6-digit code from the authenticator app, once the API asks for it
  totp?: string;
};

// Wrong credentials come back as 401/422: show the message, don't redirect
const PUBLIC = { auth: false, skipAuthRedirect: true } as const;

function asUser(token: string) {
  return { ...PUBLIC, headers: { Authorization: `Bearer ${token}` } };
}

// Signs in, or says what the user has to do next. Accounts without 2FA are
// made to set it up first; until then the token is kept aside, so the user
// isn't signed in yet
export async function login({
  totp,
  ...credentials
}: LoginInput): Promise<ActionResult<LoginStep>> {
  return runAction<LoginStep>(async () => {
    let response: LoginResponse;
    try {
      response = await api.post<LoginResponse>(
        "/api/v1/admin/auth/login",
        { ...credentials, device_name: "web", ...(totp ? { totp } : {}) },
        PUBLIC,
      );
    } catch (error) {
      // 422 with an error on `totp` and no code sent yet: 2FA is on
      if (!totp && error instanceof ValidationError && error.fieldErrors.totp) {
        return { step: "verify" };
      }
      throw error;
    }

    const { token, admin } = response.data;

    if (admin.two_factor_enabled) {
      await clearPendingAuthToken();
      await setAuthToken(token, { maxAge: TOKEN_MAX_AGE });
      return { step: "signed-in", message: response.message };
    }

    await setPendingAuthToken(token);
    // Without a JSON body the API answers 405
    const setup = await api.post<SetupResponse>(
      "/api/v1/admin/auth/2fa/setup",
      {},
      asUser(token),
    );

    return {
      step: "setup",
      message: setup.message,
      secret: setup.data.secret,
      otpauthUrl: setup.data.otpauth_url,
    };
  });
}

// Finishes the 2FA setup started by `login` and signs the user in
export async function confirmTwoFactorSetup(
  code: string,
): Promise<ActionResult<{ message?: string }>> {
  const pendingToken = await getPendingAuthToken();

  if (!pendingToken) {
    const t = await getServerTranslator("Auth.TwoFactor");
    return { ok: false, message: t("SessionExpired") };
  }

  return runAction(async () => {
    const response = await api.post<ApiResponse<null>>(
      "/api/v1/admin/auth/2fa/confirm",
      { code },
      asUser(pendingToken),
    );

    // The API keeps the login token valid; confirming doesn't issue a new one
    await setAuthToken(pendingToken, { maxAge: TOKEN_MAX_AGE });
    await clearPendingAuthToken();

    return { message: response.message };
  });
}

// For the signed-in user's account settings
export async function disableTwoFactor(input: {
  password: string;
  code: string;
}): Promise<ActionResult<{ message?: string }>> {
  return runAction(async () => {
    const response = await api.post<ApiResponse<null>>(
      "/api/v1/admin/auth/2fa/disable",
      input,
    );
    return { message: response.message };
  });
}

// Revokes the token on the API, clears the cookie and goes to sign-in
export async function logout(): Promise<void> {
  try {
    await api.post("/api/v1/admin/auth/logout", {}, { skipAuthRedirect: true });
  } catch (error) {
    // Already invalid or the API is down: signing out locally is enough
    unstable_rethrow(error);
  }

  await clearAuthToken();
  redirect({ href: SIGN_IN_PATH, locale: await resolveLocale() });
}
