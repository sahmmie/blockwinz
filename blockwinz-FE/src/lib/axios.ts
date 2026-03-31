import axios from "axios";
import { SERVER_BASE_URL } from "../shared/constants/app.constant";
import useAuth from "../hooks/useAuth";
import { showLoginModal } from "../shared/utils/authModalHandler";
import { reportClientError } from "@/shared/utils/monitoring";

const axiosInstance = axios.create({
  baseURL: `${SERVER_BASE_URL}/api`,
  withCredentials: true,
  headers: {
    "Content-type": "application/json",
    Accept: "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = useAuth.getState()?.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    reportClientError('http-request', error);
    return Promise.reject(error);
  }
);

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = axios
      .post<{ token: string }>(
        `${SERVER_BASE_URL}/api/authentication/refresh`,
        {},
        { withCredentials: true },
      )
      .then((res) => {
        const t = res.data?.token ?? null;
        if (t) useAuth.getState().setToken(t);
        return t;
      })
      .catch(() => {
        reportClientError('auth-refresh', 'Access token refresh failed');
        useAuth.getState().setToken(null);
        return null;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config as typeof error.config & {
      _retry?: boolean;
    };
    const url = originalRequest?.url || "";

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !url.includes("authentication/login") &&
      !url.includes("authentication/registration") &&
      !url.includes("authentication/refresh")
    ) {
      originalRequest._retry = true;
      const newToken = await refreshAccessToken();
      if (newToken) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
      }
    }

    reportClientError('http-response', error, {
      url,
      status: error.response?.status,
    });

    if (error.response?.status === 401) {
      useAuth.getState()?.setToken(null);
      const excludedEndpoints = [
        "wallet/balances",
        "bet-history",
        "authentication/refresh",
      ];
      const shouldExclude = excludedEndpoints.some((endpoint) =>
        url.includes(endpoint),
      );
      if (!shouldExclude) {
        showLoginModal();
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
