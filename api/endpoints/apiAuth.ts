import axiosClient, { setStoredToken, clearStoredToken } from '../axiosClient';
import type {
  ApiResponse,
  LoginRequest,
  LoginResponseData,
  RegisterRequest,
  RegisterResponseData,
  ForgotPasswordRequest,
  ChangeEmailRequest,
  ChangePasswordRequest,
} from '../types';

// ─────────────────────────────────────────────────────────────
// Auth Endpoints
// Base route: /api/Authentication
// ─────────────────────────────────────────────────────────────

const BASE = '/Authentication';

/**
 * POST /api/Authentication/login
 * Returns a custom JWT token on success.
 * The token is automatically stored in AsyncStorage for
 * subsequent authenticated requests.
 */
export async function login(
  payload: LoginRequest,
): Promise<ApiResponse<LoginResponseData>> {
  const { data } = await axiosClient.post<ApiResponse<LoginResponseData>>(
    `${BASE}/login`,
    payload,
  );

  // Persist the JWT so the interceptor attaches it on future requests
  if (data.success && data.data?.token) {
    await setStoredToken(data.data.token);
  }

  return data;
}

/**
 * POST /api/Authentication/register
 * Registers a new user with Firebase Auth.
 * A verification email is sent automatically.
 */
export async function register(
  payload: RegisterRequest,
): Promise<ApiResponse<RegisterResponseData>> {
  const { data } = await axiosClient.post<ApiResponse<RegisterResponseData>>(
    `${BASE}/register`,
    payload,
  );
  return data;
}

/**
 * POST /api/Authentication/forgot-password
 * Sends a Firebase password-reset email to the given address.
 */
export async function forgotPassword(
  payload: ForgotPasswordRequest,
): Promise<ApiResponse<null>> {
  const { data } = await axiosClient.post<ApiResponse<null>>(
    `${BASE}/forgot-password`,
    payload,
  );
  return data;
}

/**
 * PUT /api/Authentication/change-email
 * Requires a valid Bearer token (handled by interceptor).
 * Also requires the raw Firebase ID token in the body for re-authentication.
 */
export async function changeEmail(
  payload: ChangeEmailRequest,
): Promise<ApiResponse<null>> {
  const { data } = await axiosClient.put<ApiResponse<null>>(
    `${BASE}/change-email`,
    payload,
  );
  return data;
}

/**
 * PUT /api/Authentication/change-password
 * Requires a valid Bearer token (handled by interceptor).
 * Also requires the raw Firebase ID token in the body for re-authentication.
 */
export async function changePassword(
  payload: ChangePasswordRequest,
): Promise<ApiResponse<null>> {
  const { data } = await axiosClient.put<ApiResponse<null>>(
    `${BASE}/change-password`,
    payload,
  );
  return data;
}

/**
 * POST /api/Authentication/logout
 * Stateless on the server side — token is discarded client-side.
 * Clears the stored JWT from AsyncStorage.
 */
export async function logout(): Promise<ApiResponse<null>> {
  const { data } = await axiosClient.post<ApiResponse<null>>(
    `${BASE}/logout`,
  );
  await clearStoredToken();
  return data;
}
