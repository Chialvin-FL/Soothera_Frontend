import axiosClient from '../axiosClient';
import type {
  ApiResponse,
  CreateStaffRequest,
  UpdateStaffRequest,
  StaffAvailability,
  GetStaffParams,
  PaginatedResponse,
  CreateStaffResponse,
} from '../types';

// ─────────────────────────────────────────────────────────────
// Staff Availability Endpoints
// Base route: /api/Staff
// All endpoints require [Authorize] (Bearer token)
// ─────────────────────────────────────────────────────────────

const BASE = '/Staff';

/**
 * POST /api/Staff
 * Creates one or more availability entries for the current user.
 * The backend uses REPLACE logic — existing records for the same
 * establishment/day/date combination will be deleted first.
 *
 * For Recurring: provide daysOfWeek array (multiple days supported).
 * For OneTime:   provide specificDate ("M-dd-yyyy" format).
 */
export async function createStaffAvailability(
  payload: CreateStaffRequest,
): Promise<ApiResponse<CreateStaffResponse>> {
  console.log('[apiStaff] createStaffAvailability: payload =', JSON.stringify({
    establishmentId: payload.establishmentId,
    availabilityType: payload.availabilityType,
    daysOfWeek: payload.daysOfWeek,
    specificDate: payload.specificDate,
    startTime: payload.startTime,
    endTime: payload.endTime,
    isAvailable: payload.isAvailable,
  }));
  console.log('[apiStaff] createStaffAvailability: sending POST to', `${BASE}`);

  const { data } = await axiosClient.post<ApiResponse<CreateStaffResponse>>(
    `${BASE}`,
    payload,
  );

  console.log('[apiStaff] createStaffAvailability: response =', JSON.stringify(data));
  return data;
}

/**
 * GET /api/Staff
 * Retrieves staff availability records with optional filters.
 * Supports pagination via page/pageSize query params.
 */
export async function getStaffAvailability(
  params?: GetStaffParams,
): Promise<ApiResponse<PaginatedResponse<StaffAvailability>>> {
  console.log('[apiStaff] getStaffAvailability: params =', JSON.stringify(params ?? {}));
  console.log('[apiStaff] getStaffAvailability: sending GET to', `${BASE}`);

  const { data } = await axiosClient.get<
    ApiResponse<PaginatedResponse<StaffAvailability>>
  >(`${BASE}`, { params });

  console.log('[apiStaff] getStaffAvailability: response =', JSON.stringify({
    success: data.success,
    message: data.message,
    totalCount: (data.data as any)?.totalCount,
    itemCount: (data.data as any)?.items?.length,
  }));
  return data;
}

/**
 * PUT /api/Staff/:id
 * Updates a single staff availability record by its ID.
 * All fields are optional — only provided fields will be patched.
 */
export async function updateStaffAvailability(
  id: string,
  payload: UpdateStaffRequest,
): Promise<ApiResponse<null>> {
  console.log('[apiStaff] updateStaffAvailability: id =', id, '| payload =', JSON.stringify(payload));
  console.log('[apiStaff] updateStaffAvailability: sending PUT to', `${BASE}/${id}`);

  const { data } = await axiosClient.put<ApiResponse<null>>(
    `${BASE}/${id}`,
    payload,
  );

  console.log('[apiStaff] updateStaffAvailability: response =', JSON.stringify(data));
  return data;
}

/**
 * DELETE /api/Staff/:id
 * Deletes a single staff availability record by its document ID.
 */
export async function deleteStaffAvailability(
  id: string,
): Promise<ApiResponse<null>> {
  console.log('[apiStaff] deleteStaffAvailability: id =', id);
  console.log('[apiStaff] deleteStaffAvailability: sending DELETE to', `${BASE}/${id}`);

  const { data } = await axiosClient.delete<ApiResponse<null>>(
    `${BASE}/${id}`,
  );

  console.log('[apiStaff] deleteStaffAvailability: response =', JSON.stringify(data));
  return data;
}
