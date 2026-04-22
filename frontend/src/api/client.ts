import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const http = axios.create({
  baseURL: BASE_URL,
  withCredentials: false,
  timeout: 15000,
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('opsflow_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

http.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem('opsflow_token');
      localStorage.removeItem('opsflow_user');
    }
    return Promise.reject(err);
  },
);

// Runtime override (set via DevTools: localStorage.setItem('opsflow_mode', 'live')).
// Falls back to the build-time env var.
const override = typeof localStorage !== 'undefined' ? localStorage.getItem('opsflow_mode') : null;
const RAW_USE_MOCK = import.meta.env.VITE_USE_MOCK;

export const USE_MOCK =
  override === 'live' ? false :
  override === 'mock' ? true :
  String(RAW_USE_MOCK).toLowerCase() !== 'false';

// eslint-disable-next-line no-console
console.info(
  `[opsflow] API mode = ${USE_MOCK ? 'MOCK (in-memory)' : 'LIVE'} → ${BASE_URL}` +
  (override ? ` (override: ${override})` : ''),
);
