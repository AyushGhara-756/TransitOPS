import { getAccessToken } from "./token";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

if (!BASE_URL) {
  // Fails loudly in dev instead of silently hitting a relative path
  console.warn("NEXT_PUBLIC_BACKEND_URL is not set — API calls will fail.");
}

export interface ApiOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
  signal?: AbortSignal;
}

export interface ApiResponse<T> {
  data: T;
  headers: Headers;
  status: number;
  ok: boolean;
}

export async function apiFetch<T>(route: string, options: ApiOptions = {}): Promise<T> {
  const result = await apiFetchWithResponse<T>(route, options);
  return result.data;
}

export async function apiFetchWithResponse<T>(
  route: string,
  options: ApiOptions = {}
): Promise<ApiResponse<T>> {
  const { params, ...init } = options;

  const url = new URL(`${BASE_URL ?? ""}${route.startsWith("/") ? route : `/${route}`}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== "") url.searchParams.set(key, String(value));
    });
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string>),
  };

  const token = getAccessToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url.toString(), {
    ...init,
    headers,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`API ${route} failed: ${res.status} ${body}`);
  }

  // Handle empty responses (e.g. 204 on DELETE)
  const text = await res.text();
  const data = (text ? JSON.parse(text) : undefined) as T;

  return {
    data,
    headers: res.headers,
    status: res.status,
    ok: res.ok,
  };
}
