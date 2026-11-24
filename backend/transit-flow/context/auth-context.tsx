"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { apiFetch, apiFetchWithResponse } from "@/lib/api";
import type { SessionUser, Role } from "@/lib/types";
import {
  getAccessToken,
  getStoredUser,
  setTokens,
  setStoredUser,
  clearTokens,
  extractTokensFromHeaders,
} from "@/lib/token";
import { toBackendRole } from "@/lib/utils";

interface AuthContextValue {
  user: SessionUser | null;
  loading: boolean;
  login: (email: string, password: string, name?: string, role?: Role) => Promise<SessionUser>;
  register: (name: string, email: string, password: string, role?: Role) => Promise<SessionUser>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const PUBLIC_ROUTES = ["/", "/login", "/signup", "/forgot-password", "/reset-password"];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (PUBLIC_ROUTES.includes(pathname)) {
      setLoading(false);
      return;
    }
    const token = getAccessToken();
    const storedUser = getStoredUser();

    if (!token) {
      setUser(null);
      setLoading(false);
      router.replace("/login");
      return;
    }

    if (storedUser) {
      setUser(storedUser);
      setLoading(false);
      return;
    }

    let cancelled = false;
    apiFetch<SessionUser>("/auth/me")
      .then((data) => {
        if (!cancelled && data) {
          setUser(data);
          setStoredUser(data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          clearTokens();
          setUser(null);
          router.replace("/login");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  const login = useCallback(
    async (email: string, password: string, name?: string, role?: Role): Promise<SessionUser> => {
      const payload = {
        name: name?.trim() || email.split("@")[0] || "User",
        email: email.trim(),
        password,
        role: toBackendRole(role),
      };

      const res = await apiFetchWithResponse<SessionUser>("/auth/login", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const { accessToken, refreshToken } = extractTokensFromHeaders(res.headers);
      if (accessToken) {
        setTokens(accessToken, refreshToken);
      } else if ((res.data as unknown as { token?: string })?.token) {
        setTokens((res.data as unknown as { token: string }).token, null);
      }

      const returnedUser = res.data;
      setStoredUser(returnedUser);
      setUser(returnedUser);
      router.replace("/dashboard");
      return returnedUser;
    },
    [router]
  );

  const registerUser = useCallback(
    async (
      name: string,
      email: string,
      password: string,
      role: Role = "FLEET_MANAGER"
    ): Promise<SessionUser> => {
      const payload = {
        name: name.trim(),
        email: email.trim(),
        password,
        role: toBackendRole(role),
      };

      const res = await apiFetchWithResponse<SessionUser>("/auth/register", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const { accessToken, refreshToken } = extractTokensFromHeaders(res.headers);
      if (accessToken) {
        setTokens(accessToken, refreshToken);
      } else if ((res.data as unknown as { token?: string })?.token) {
        setTokens((res.data as unknown as { token: string }).token, null);
      }

      const returnedUser = res.data;
      setStoredUser(returnedUser);
      setUser(returnedUser);
      router.replace("/dashboard");
      return returnedUser;
    },
    [router]
  );

  const logout = useCallback(async () => {
    try {
      await apiFetch("/auth/logout", { method: "POST" }).catch(() => {});
    } finally {
      // Delete access token and refresh token on logout
      clearTokens();
      setUser(null);
      router.replace("/login");
    }
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, loading, login, register: registerUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
