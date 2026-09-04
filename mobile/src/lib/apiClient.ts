import axios, { AxiosError, create, InternalAxiosRequestConfig } from "axios";
import { config } from "./config";
import { tokenStorage } from "./tokenStorage";
import { useAuthStore } from "../store/authStore";

export const apiClient = create({
  baseURL: config.apiBaseUrl,
  timeout: 15_000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ─── Request interceptor: attach access token ─────────────────────────────────
apiClient.interceptors.request.use(
  async (reqConfig: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      reqConfig.headers.Authorization = `Bearer ${token}`;
    }
    return reqConfig;
  },
);

// ─── Response interceptor: silent refresh on 401 ─────────────────────────────
let isRefreshing = false;
let pendingQueue: {
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}[] = [];

function processQueue(error: unknown, token: string | null) {
  pendingQueue.forEach((p) => {
    if (error) p.reject(error);
    else p.resolve(token!);
  });
  pendingQueue = [];
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push({
          resolve: (token) => {
            original.headers.Authorization = `Bearer ${token}`;
            resolve(apiClient(original));
          },
          reject,
        });
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = await tokenStorage.getRefreshToken();
      if (!refreshToken) throw new Error("No refresh token available");

      // A plain axios call, not `apiClient` itself — going through apiClient
      // would loop this same 401 handler if the refresh endpoint ever also
      // returned 401.
      const { data } = await axios.post<{
        accessToken: string;
        refreshToken: string;
      }>(`${config.apiBaseUrl}/auth/refresh`, { refreshToken });

      useAuthStore.getState().setAccessToken(data.accessToken);
      await tokenStorage.saveTokens(data.accessToken, data.refreshToken);

      processQueue(null, data.accessToken);
      original.headers.Authorization = `Bearer ${data.accessToken}`;
      return apiClient(original);
    } catch (refreshError) {
      processQueue(refreshError, null);
      await useAuthStore.getState().logout();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
