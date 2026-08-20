import axios from "axios";

const baseURL = `${String(import.meta.env.VITE_API_BASE_URL || "http://localhost:4000").replace(/\/+$/, "")}/api/v1`;
const ACCESS_KEY = "influencer_access_token";
const REFRESH_KEY = "influencer_refresh_token";

export const tokens = {
  access: () => localStorage.getItem(ACCESS_KEY),
  refresh: () => localStorage.getItem(REFRESH_KEY),
  set: (value = {}) => {
    if (value.accessToken) localStorage.setItem(ACCESS_KEY, value.accessToken);
    if (value.refreshToken) localStorage.setItem(REFRESH_KEY, value.refreshToken);
  },
  clear: () => {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

export const api = axios.create({ baseURL });

const loadingListeners = new Set();
let activeRequests = 0;

const notifyLoading = () => {
  loadingListeners.forEach((listener) => listener(activeRequests));
};

const startLoading = (config) => {
  const shouldTrack = config.globalLoader ?? config.method?.toLowerCase() !== "get";

  if (shouldTrack && !config.__tracksGlobalLoader) {
    config.__tracksGlobalLoader = true;
    activeRequests += 1;
    notifyLoading();
  }
  return config;
};

const stopLoading = (config) => {
  if (config?.__tracksGlobalLoader) {
    config.__tracksGlobalLoader = false;
    activeRequests = Math.max(0, activeRequests - 1);
    notifyLoading();
  }
};

export const subscribeToApiLoading = (listener) => {
  loadingListeners.add(listener);
  listener(activeRequests);
  return () => loadingListeners.delete(listener);
};

api.interceptors.request.use((config) => {
  startLoading(config);
  const token = tokens.access();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, (error) => {
  stopLoading(error.config);
  return Promise.reject(error);
});

let refreshRequest;
api.interceptors.response.use((response) => {
  stopLoading(response.config);
  return response;
}, async (error) => {
  const request = error.config;
  stopLoading(request);
  const refreshToken = tokens.refresh();
  if (error.response?.status !== 401 || request?._retry || !refreshToken || request?.url?.includes("/auth/refresh")) {
    return Promise.reject(error);
  }

  request._retry = true;
  try {
    if (!refreshRequest) {
      refreshRequest = axios.post(`${baseURL}/auth/refresh`, { refreshToken })
        .then((response) => {
          const refreshed = response?.data?.data?.tokens || response?.data?.data || response?.data?.tokens || response?.data;
          tokens.set(refreshed);
          return refreshed?.accessToken;
        })
        .finally(() => { refreshRequest = undefined; });
    }
    const accessToken = await refreshRequest;
    if (!accessToken) throw error;
    request.headers = request.headers || {};
    request.headers.Authorization = `Bearer ${accessToken}`;
    return api(request);
  } catch (refreshError) {
    tokens.clear();
    if (window.location.pathname !== "/login") window.location.replace("/login");
    return Promise.reject(refreshError);
  }
});

export const unwrap = (response) => response?.data?.data ?? response?.data;
export const endpoints = {
  login: "/auth/influencer/login",
  session: "/influencer/referral/session",
  dashboard: "/influencer/referral/dashboard/summary",
  codes: "/influencer/referral/codes",
  orders: "/influencer/referral/orders",
  earnings: "/influencer/referral/ledger",
  wallet: "/influencer/referral/wallet",
  withdrawals: "/influencer/referral/withdrawals",
  bonuses: "/influencer/referral/bonus-progress",
  analytics: "/influencer/referral/analytics",
  network: "/influencer/referral/network",
  networkChild: (childId) => `/influencer/referral/network/children/${childId}`,
  createBrandAssociate: "/influencer/referral/network/children",
  profile: "/influencer/referral/profile",
  uploadImage: "/file-uploader/upload",
  uploadDocument: "/file-uploader/upload-document",
};
