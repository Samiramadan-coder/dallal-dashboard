// Shared between the proxy and server code, so it must stay free of
// `server-only` and request-time APIs

// httpOnly cookie holding the Laravel API Bearer token. Named "token" because
// the existing login flow (lib/actions/auth.ts) and logout route already use it
export const AUTH_COOKIE_NAME = "token";

// `?session=expired` marks a redirect caused by a 401 from the API.
// The proxy treats it as signed out and deletes the cookie
export const SESSION_PARAM = "session";
export const SESSION_EXPIRED = "expired";

// httpOnly cookie holding the token from step one of sign-in, until the 2FA
// code is confirmed. The proxy ignores it, so the user isn't signed in yet
export const PENDING_AUTH_COOKIE_NAME = "pending_token";
