import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  saveTokens,
  UNAUTHORIZED_EVENT,
  type AuthTokens,
} from "@/lib/auth";

const baseURL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5050";

export const api = axios.create({
  baseURL,
  timeout: 30000,
});

// A separate client avoids the response interceptor below and, therefore,
// prevents an infinite refresh loop when the refresh token is also invalid.
const refreshClient = axios.create({
  baseURL,
  timeout: 30000,
});

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
  _retryRateLimit?: boolean;
}

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  if (!refreshPromise) {
    refreshPromise = refreshClient
      .post<AuthTokens>("/auth/refresh", { refreshToken })
      .then(({ data }) => {
        if (!data?.accessToken || !data?.refreshToken) return null;

        saveTokens(data);
        return data.accessToken;
      })
      .catch(() => {
        clearTokens();
        return null;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

function redirectToLogin(): void {
  if (typeof window === "undefined") return;
  if (window.location.pathname === "/login") return;

  window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
}

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetryableRequestConfig | undefined;
    const status = error.response?.status;
    const url = original?.url ?? "";
    const isAuthRequest =
      url.includes("/auth/login") || url.includes("/auth/refresh");

    // GET e PUT de status são idempotentes; podem ser repetidos com segurança.
    const method = original?.method?.toLowerCase();
    const isRetryableMethod = method === "get" || method === "put";

    if (
      status === 429 &&
      original &&
      isRetryableMethod &&
      !original._retryRateLimit
    ) {
      original._retryRateLimit = true;

      const retryAfterHeader = error.response?.headers?.["retry-after"];
      const retryAfter = Number(retryAfterHeader);
      const waitMs =
        Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 1000;

      await new Promise((resolve) =>
        setTimeout(resolve, Math.min(waitMs, 5000)),
      );
      return api(original);
    }

    if (status !== 401 || !original || original._retry || isAuthRequest) {
      return Promise.reject(error);
    }

    original._retry = true;

    const newAccessToken = await refreshAccessToken();
    if (!newAccessToken) {
      clearTokens();
      redirectToLogin();
      return Promise.reject(error);
    }

    original.headers.set("Authorization", `Bearer ${newAccessToken}`);
    return api(original);
  },
);
