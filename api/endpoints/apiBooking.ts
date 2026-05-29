import axiosClient from '../axiosClient';
import type {
  ApiResponse,
  PaginatedResponse,
  CreateBookingRequest,
  CreateBookingResponse,
  UpdateBookingRequest,
  GetBookingsParams,
  GetAvailableSlotsParams,
  BookingResponse,
  AvailableSlotsData,
  TherapistAnalyticsData,
} from '../types';

// ─────────────────────────────────────────────────────────────
// Booking Endpoints
// Base route: /api/Booking
// All endpoints require [Authorize] (Bearer token)
// ─────────────────────────────────────────────────────────────

const BASE = '/Booking';

/**
 * Builds a FormData object from a CreateBookingRequest.
 * Required because the backend expects [FromForm] with an optional IFormFile (IdImage).
 */
function buildBookingFormData(payload: CreateBookingRequest): FormData {
  const formData = new FormData();

  formData.append('EstablishmentId', payload.establishmentId);
  formData.append('SalonServiceId', payload.salonServiceId);
  formData.append('SelectedDurationIndex', String(payload.selectedDurationIndex));
  formData.append('TherapistPref', String(payload.therapistPref));
  formData.append('StartTime', payload.startTime);

  if (payload.selectedAddOnIndices && payload.selectedAddOnIndices.length > 0) {
    payload.selectedAddOnIndices.forEach((idx) =>
      formData.append('SelectedAddOnIndices', String(idx)),
    );
  }

  if (payload.staffId != null) {
    formData.append('StaffId', payload.staffId);
  }

  if (payload.options != null) {
    formData.append('Options', payload.options);
  }

  if (payload.latitude != null) {
    formData.append('Latitude', String(payload.latitude));
  }

  if (payload.longitude != null) {
    formData.append('Longitude', String(payload.longitude));
  }

  if (payload.idImage != null) {
    const file = payload.idImage as any;
    if (file.uri) {
      // React Native ImagePicker asset: { uri, name, type }
      formData.append('IdImage', {
        uri: file.uri,
        name: file.name ?? 'id_image.jpg',
        type: file.type ?? 'image/jpeg',
      } as any);
    } else {
      // Web File object
      formData.append('IdImage', file);
    }
  }

  return formData;
}

/**
 * POST /api/Booking/create-booking
 * Creates a new booking for the authenticated customer.
 * Sends FormData (includes optional ID image upload for PWD/Senior).
 *
 * Backend fields:
 *   - EstablishmentId, SalonServiceId, SelectedDurationIndex
 *   - SelectedAddOnIndices[], TherapistPref, StaffId?
 *   - StartTime ("M-dd-yyyy:HH:mm"), Options?, IdImage?, Latitude?, Longitude?
 */
export async function createBooking(
  payload: CreateBookingRequest,
): Promise<CreateBookingResponse> {
  console.log('[apiBooking] createBooking: payload =', JSON.stringify({
    establishmentId: payload.establishmentId,
    salonServiceId: payload.salonServiceId,
    selectedDurationIndex: payload.selectedDurationIndex,
    therapistPref: payload.therapistPref,
    startTime: payload.startTime,
    options: payload.options,
    hasIdImage: !!payload.idImage,
  }));
  console.log('[apiBooking] createBooking: sending POST to', `${BASE}/create-booking`);

  const formData = buildBookingFormData(payload);
  const { data } = await axiosClient.post<CreateBookingResponse>(
    `${BASE}/create-booking`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );

  console.log('[apiBooking] createBooking: response =', JSON.stringify(data));
  return data;
}

/**
 * GET /api/Booking/get-booking
 * Retrieves bookings with optional filters and pagination.
 *
 * Filters: bookingId, establishmentId, customerId, staffId, status
 * Pagination: page (default 1), pageSize (default 10)
 *
 * Returns a single BookingResponse when `bookingId` is supplied,
 * or a paginated list otherwise.
 */
export async function getBookings(
  params?: GetBookingsParams,
): Promise<ApiResponse<PaginatedResponse<BookingResponse>>> {
  console.log('[apiBooking] getBookings: params =', JSON.stringify(params ?? {}));
  console.log('[apiBooking] getBookings: sending GET to', `${BASE}/get-booking`);

  const { data } = await axiosClient.get<ApiResponse<PaginatedResponse<BookingResponse>>>(
    `${BASE}/get-booking`,
    { params },
  );

  console.log('[apiBooking] getBookings: response =', JSON.stringify({
    success: data.success,
    message: data.message,
    totalCount: (data.data as any)?.totalCount,
    itemCount: (data.data as any)?.items?.length,
  }));
  return data;
}

/**
 * GET /api/Booking/get-booking?bookingId=...
 * Convenience wrapper to fetch a single booking by its ID.
 */
export async function getBookingById(
  bookingId: string,
): Promise<ApiResponse<PaginatedResponse<BookingResponse>>> {
  return getBookings({ bookingId });
}

/**
 * PUT /api/Booking/update-booking/:id
 * Updates a booking's status, paymentStatus, or startTime.
 * Sent as JSON body ([FromBody]).
 */
export async function updateBooking(
  id: string,
  payload: UpdateBookingRequest,
): Promise<ApiResponse<null>> {
  console.log('[apiBooking] updateBooking: id =', id, '| payload =', JSON.stringify(payload));
  console.log('[apiBooking] updateBooking: sending PUT to', `${BASE}/update-booking/${id}`);

  const { data } = await axiosClient.put<ApiResponse<null>>(
    `${BASE}/update-booking/${id}`,
    payload,
  );

  console.log('[apiBooking] updateBooking: response =', JSON.stringify(data));
  return data;
}

/**
 * DELETE /api/Booking/delete-booking/:id
 * Deletes a booking by its document ID.
 */
export async function deleteBooking(
  id: string,
): Promise<ApiResponse<null>> {
  console.log('[apiBooking] deleteBooking: id =', id);
  console.log('[apiBooking] deleteBooking: sending DELETE to', `${BASE}/delete-booking/${id}`);

  const { data } = await axiosClient.delete<ApiResponse<null>>(
    `${BASE}/delete-booking/${id}`,
  );

  console.log('[apiBooking] deleteBooking: response =', JSON.stringify(data));
  return data;
}

/**
 * GET /api/Booking/available-slots
 * Returns available time slots for a given establishment / service / date range.
 *
 * Requires: establishmentId + (date OR startDate+endDate).
 * Response data is a map of "M-dd-yyyy" → ["HH:mm", ...].
 */
export async function getAvailableSlots(
  params: GetAvailableSlotsParams,
): Promise<ApiResponse<AvailableSlotsData>> {
  console.log('[apiBooking] getAvailableSlots: params =', JSON.stringify(params));
  console.log('[apiBooking] getAvailableSlots: sending GET to', `${BASE}/available-slots`);

  const { data } = await axiosClient.get<ApiResponse<AvailableSlotsData>>(
    `${BASE}/available-slots`,
    { params },
  );

  console.log('[apiBooking] getAvailableSlots: response =', JSON.stringify({
    success: data.success,
    dateKeys: data.data ? Object.keys(data.data) : [],
  }));
  return data;
}

/**
 * GET /api/Booking/therapist-analytics
 * Retrieves performance analytics for the authenticated therapist.
 *
 * Filter: 'weekly' or 'monthly'
 */
export async function getTherapistAnalytics(
  filter: string = 'monthly',
): Promise<ApiResponse<TherapistAnalyticsData>> {
  console.log('[apiBooking] getTherapistAnalytics: filter =', filter);
  console.log('[apiBooking] getTherapistAnalytics: sending GET to', `${BASE}/therapist-analytics`);

  const { data } = await axiosClient.get<ApiResponse<TherapistAnalyticsData>>(
    `${BASE}/therapist-analytics`,
    { params: { filter } },
  );

  console.log('[apiBooking] getTherapistAnalytics: response success =', data.success);
  return data;
}
