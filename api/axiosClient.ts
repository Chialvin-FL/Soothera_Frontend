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
  // On web dev via Metro, relative /api paths fail. 
  // We use direct BACKEND_URL since CORS is enabled.
  if (Platform.OS === 'web') {
    if (API_CONFIG.USE_WEB_PROXY) {
      return '/api';
    }
    return BACKEND_URL;
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
    const isAuthRoute = config.url?.includes('/login') || config.url?.includes('/register') || config.url?.includes('/forgot-password');
    
    if (token && config.headers && !isAuthRoute) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`[axiosClient Debug] Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, {
      headers: config.headers,
      data: config.data,
    });
    return config;
  },
  (error) => {
    console.error('[axiosClient Debug] Request Error:', error);
    return Promise.reject(error);
  },
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

    const apiError: ApiError & { rawError?: any } = {
      success: false,
      message:
        backendBody?.message ??
        error.message ??
        'An unexpected error occurred.',
      statusCode: status,
      data: null,
      rawError: {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        url: error.config?.url,
        baseURL: error.config?.baseURL,
      }
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
