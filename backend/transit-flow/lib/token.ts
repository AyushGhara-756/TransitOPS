import type { SessionUser } from "./types";

export const ACCESS_TOKEN_KEY = "transitops_access_token";
export const REFRESH_TOKEN_KEY = "transitops_refresh_token";
export const LEGACY_TOKEN_KEY = "transitops_token";
export const USER_KEY = "transitops_user";

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return (
    localStorage.getItem(ACCESS_TOKEN_KEY) ||
    localStorage.getItem(LEGACY_TOKEN_KEY)
  );
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

// Backwards-compatible alias for getAccessToken
export function getToken(): string | null {
  return getAccessToken();
}

export function setTokens(
  accessToken: string | null,
  refreshToken?: string | null
) {
  if (typeof window === "undefined") return;

  if (accessToken) {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(LEGACY_TOKEN_KEY, accessToken);
  } else {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(LEGACY_TOKEN_KEY);
  }

  if (refreshToken !== undefined) {
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    } else {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  }
}

// Backwards-compatible alias for setting the access token
export function setToken(token: string | null) {
  setTokens(token, undefined);
}

export function getStoredUser<T = SessionUser>(): T | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function setStoredUser(user: SessionUser | null) {
  if (typeof window === "undefined") return;
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }
}

export function clearTokens() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(LEGACY_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function extractTokensFromHeaders(headers: Headers): {
  accessToken: string | null;
  refreshToken: string | null;
} {
  const accessToken =
    headers.get("Access_Token") ||
    headers.get("access_token") ||
    headers.get("Access-Token") ||
    headers.get("access-token") ||
    headers.get("Authorization")?.replace(/^Bearer\s+/i, "") ||
    null;

  const refreshToken =
    headers.get("Refresh_Token") ||
    headers.get("refresh_token") ||
    headers.get("Refresh-Token") ||
    headers.get("refresh-token") ||
    null;

  return { accessToken, refreshToken };
}
