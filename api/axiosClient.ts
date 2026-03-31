import axios, {
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ApiResponse, ApiError } from './types';
import { API_CONFIG } from './config';

// ─────────────────────────────────────────────────────────────
// Base URL resolution
// ─────────────────────────────────────────────────────────────
// • Web (dev)  → Vite proxy handles /api → backend
// • Web (prod) → Vercel rewrites handle /api → backend
// • Native     → Direct URL (no proxy available)
// ─────────────────────────────────────────────────────────────

const BACKEND_URL = API_CONFIG.API_URL;

function resolveBaseUrl(): string {
  if (Platform.OS === 'web') {
    // On web, /api is proxied (Vite in dev, Vercel rewrites in prod)
    return '/api';
  }
  // React Native (iOS / Android) — call backend directly
  return BACKEND_URL;
}

// ─────────────────────────────────────────────────────────────
// Token storage helpers
// ─────────────────────────────────────────────────────────────

const TOKEN_KEY = 'soothera_auth_token';

export async function getStoredToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function setStoredToken(token: string): Promise<void> {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } catch (e) {
    console.error('[axiosClient] Failed to store token:', e);
  }
}

export async function clearStoredToken(): Promise<void> {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
  } catch (e) {
    console.error('[axiosClient] Failed to clear token:', e);
  }
}

// ─────────────────────────────────────────────────────────────
// Axios instance
// ─────────────────────────────────────────────────────────────

const axiosClient = axios.create({
  baseURL: resolveBaseUrl(),
  timeout: 30_000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ─────────────────────────────────────────────────────────────
// Request interceptor – attach Bearer token
// ─────────────────────────────────────────────────────────────

axiosClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await getStoredToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ─────────────────────────────────────────────────────────────
// Response interceptor – normalise errors
// ─────────────────────────────────────────────────────────────

axiosClient.interceptors.response.use(
  // ── Success path ──
  (response) => response,

  // ── Error path ──
  async (error: AxiosError<ApiResponse>) => {
    // Build a normalised ApiError from the backend response or fallback
    const status = error.response?.status ?? 0;
    const backendBody = error.response?.data;

    const apiError: ApiError = {
      success: false,
      message:
        backendBody?.message ??
        error.message ??
        'An unexpected error occurred.',
      statusCode: status,
      data: null,
    };

    // ── Handle 401 Unauthorized globally ──
    if (status === 401) {
      // Token expired or invalid — clear stored credentials
      await clearStoredToken();
      // NOTE: navigation to login should be handled by the app's
      // auth state listener (useSessionLoader) reacting to
      // the cleared token, not here.
    }

    return Promise.reject(apiError);
  },
);

export default axiosClient;
