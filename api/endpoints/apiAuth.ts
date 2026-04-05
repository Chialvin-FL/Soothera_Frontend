import axiosClient, { setStoredToken, clearStoredToken } from '../axiosClient';
import type {
  ApiResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
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
): Promise<LoginResponse> {
  const { data } = await axiosClient.post<LoginResponse>(
    `${BASE}/login`,
    payload,
  );

  // Persist the JWT so the interceptor attaches it on future requests
  if (data.success && data.token) {
    await setStoredToken(data.token);
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
): Promise<RegisterResponse> {
  console.log('[Registration Debug] apiAuth.register calling POST /Authentication/register with payload:', payload);
  try {
    const { data } = await axiosClient.post<RegisterResponse>(
      `${BASE}/register`,
      payload,
    );
    console.log('[Registration Debug] apiAuth.register received response:', data);
    return data;
  } catch (error) {
    console.error('[Registration Debug] apiAuth.register axios error:', error);
    throw error;
  }
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
