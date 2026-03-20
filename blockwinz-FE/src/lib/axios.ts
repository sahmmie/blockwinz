import axios from "axios";
import { SERVER_BASE_URL } from "../shared/constants/app.constant";
import useAuth from "../hooks/useAuth";
import { showLoginModal } from "../shared/utils/authModalHandler";

const axiosInstance = axios.create({
  baseURL: `${SERVER_BASE_URL}/api`,
  headers: {
    "Content-type": "application/json",
    Accept: "application/json",
  },
});

// Add an interceptor to dynamically add the Authorization header
axiosInstance.interceptors.request.use(
  (config) => {
    const token = useAuth.getState()?.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle 401 errors
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      useAuth.getState()?.setToken(null);
      const url = error.config?.url || '';
      const excludedEndpoints = [
        'wallet/balances',
        'bet-history',
        // Add more endpoint substrings here as needed
      ];
      const shouldExclude = excludedEndpoints.some(endpoint => url.includes(endpoint));
      if (!shouldExclude) {
        showLoginModal();
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
