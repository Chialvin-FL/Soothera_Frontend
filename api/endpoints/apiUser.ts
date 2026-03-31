import axiosClient from '../axiosClient';
import type {
  ApiResponse,
  CreateUserRequest,
  UpdateUserRequest,
  GetUsersParams,
  PaginatedResponse,
  UserDto,
} from '../types';

// ─────────────────────────────────────────────────────────────
// User Endpoints
// Base route: /api/User
// ─────────────────────────────────────────────────────────────

const BASE = '/User';

/**
 * POST /api/User/create-user
 * Creates a new user profile.
 * UID and email are extracted from the JWT token.
 * Policy: Authorize (any authenticated user)
 */
export async function createUser(
  payload: CreateUserRequest,
): Promise<ApiResponse<null>> {
  const { data } = await axiosClient.post<ApiResponse<null>>(
    `${BASE}/create-user`,
    payload,
  );
  return data;
}

/**
 * PATCH /api/User/update-user/:uid
 * Updates user profile fields. All fields are optional.
 * Policy: All
 */
export async function updateUser(
  uid: string,
  payload: UpdateUserRequest,
): Promise<ApiResponse<UserDto>> {
  const { data } = await axiosClient.patch<ApiResponse<UserDto>>(
    `${BASE}/update-user/${uid}`,
    payload,
  );
  return data;
}

/**
 * DELETE /api/User/delete-user/:uid
 * Deletes a user by UID.
 * Policy: All
 */
export async function deleteUser(
  uid: string,
): Promise<ApiResponse<null>> {
  const { data } = await axiosClient.delete<ApiResponse<null>>(
    `${BASE}/delete-user/${uid}`,
  );
  return data;
}

/**
 * GET /api/User/get-user
 * Retrieves a paginated list of users with optional filters.
 * Policy: All
 */
export async function getUsers(
  params?: GetUsersParams,
): Promise<ApiResponse<PaginatedResponse<UserDto>>> {
  const { data } = await axiosClient.get<
    ApiResponse<PaginatedResponse<UserDto>>
  >(`${BASE}/get-user`, { params });
  return data;
}
