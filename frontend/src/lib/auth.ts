export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface JwtPayload {
  exp?: number;
  [key: string]: unknown;
}

export const UNAUTHORIZED_EVENT = "leadevent:unauthorized";

const ACCESS_TOKEN_KEY = "leadevent.accessToken";
const REFRESH_TOKEN_KEY = "leadevent.refreshToken";

function getStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  return window.localStorage;
}

export function saveTokens(tokens: AuthTokens): void {
  const storage = getStorage();
  if (!storage) return;

  storage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
  storage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
}

export function clearTokens(): void {
  const storage = getStorage();
  if (!storage) return;

  storage.removeItem(ACCESS_TOKEN_KEY);
  storage.removeItem(REFRESH_TOKEN_KEY);
}

export function getAccessToken(): string | null {
  return getStorage()?.getItem(ACCESS_TOKEN_KEY) ?? null;
}

export function getRefreshToken(): string | null {
  return getStorage()?.getItem(REFRESH_TOKEN_KEY) ?? null;
}

export function decodeToken(token: string): JwtPayload | null {
  const payload = token.split(".")[1];
  if (!payload) return null;

  try {
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    return JSON.parse(globalThis.atob(padded)) as JwtPayload;
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string, skewSeconds = 30): boolean {
  const payload = decodeToken(token);
  if (!payload?.exp) return true;

  return payload.exp * 1000 <= Date.now() + skewSeconds * 1000;
}

export function hasValidAccessToken(): boolean {
  const token = getAccessToken();
  return Boolean(token && !isTokenExpired(token));
}

/**
 * A session can still be recovered when the access token is expired, as long
 * as a refresh token exists. The API client refreshes it on the first 401.
 */
export function hasSession(): boolean {
  if (hasValidAccessToken()) return true;

  const refreshToken = getRefreshToken();
  return Boolean(refreshToken && !isTokenExpired(refreshToken, 0));
}
