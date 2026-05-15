/**
 * bookAppointmentService.ts
 *
 * Business-logic helpers that bridge the BookAppointmentScreen state
 * with the raw API calls in api/endpoints/apiBooking.ts.
 *
 * Responsibilities:
 *  - Format dates / times into the "M-dd-yyyy:HH:mm" format the backend expects.
 *  - Build CreateBookingRequest from screen-level state.
 *  - Build GetAvailableSlotsParams for slot-picker queries.
 *  - Re-export the raw API functions for convenience.
 */

import {
  createBooking,
  getBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
  getAvailableSlots,
} from '@/api/endpoints/apiBooking';
import { getSalonServices } from '@/api/endpoints/apiService';
import { getStaffAvailability } from '@/api/endpoints/apiStaff';
import type {
  CreateBookingRequest,
  UpdateBookingRequest,
  GetBookingsParams,
  GetAvailableSlotsParams,
  TherapistPref,
} from '@/api/types';

// ─── Re-exports (raw API) ────────────────────────────────────
export {
  createBooking,
  getBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
  getAvailableSlots,
  getSalonServices,
  getStaffAvailability,
};

// ─── Duration Label Helper ────────────────────────────────────

/**
 * Converts a duration in minutes to a human-readable label.
 * e.g. 60 → "60 mins", 90 → "90 mins"
 */
export function formatDurationLabel(minutes: number): string {
  return `${minutes} mins`;
}

// ─── Date Helpers ────────────────────────────────────────────

/**
 * Formats a JS Date into the backend's "M-dd-yyyy:HH:mm" string.
 * Example: new Date(2026, 4, 6, 14, 30) → "5-06-2026:14:30"
 */
export function formatStartTime(date: Date, time: Date): string {
  const month = date.getMonth() + 1; // 1-indexed
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(time.getHours()).padStart(2, '0');
  const minutes = String(time.getMinutes()).padStart(2, '0');
  return `${month}-${day}-${year}:${hours}:${minutes}`;
}

/**
 * Formats a JS Date into the backend's date-only "M-dd-yyyy" string.
 * Example: new Date(2026, 4, 6) → "5-06-2026"
 */
export function formatDateOnly(date: Date): string {
  const month = date.getMonth() + 1;
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  return `${month}-${day}-${year}`;
}

// ─── Payload Builders ─────────────────────────────────────────

/**
 * Parameters collected from the BookAppointmentScreen steps.
 * All fields that map directly to CreateBookingRequest.
 */
export interface BookAppointmentParams {
  establishmentId: string;
  salonServiceId: string;
  /** Index of the selected duration option (0-based) */
  selectedDurationIndex: number;
  /** Indices of the selected add-ons (0-based) */
  selectedAddOnIndices?: number[];
  therapistPref: TherapistPref;
  /** Specific staff UID or undefined for "any therapist" */
  staffId?: string;
  /** Date selected on Step 5 */
  date: Date;
  /** Time selected on Step 5 */
  time: Date;
  /**
   * Comma-separated option string.
   * e.g. "PWD,HomeService" or "Senior"
   * Build with buildOptionsString() below.
   */
  options?: string;
  /** ImagePicker asset for PWD/Senior ID */
  idImage?: { uri: string; name: string; type: string } | File | null;
  latitude?: number | null;
  longitude?: number | null;
}

/**
 * Builds the "Options" comma-separated string expected by the backend
 * from individual boolean flags used in the UI.
 */
export function buildOptionsString(opts: {
  isPWD?: boolean;
  isSenior?: boolean;
  isHomeService?: boolean;
}): string | undefined {
  const parts: string[] = [];
  if (opts.isPWD) parts.push('PWD');
  if (opts.isSenior) parts.push('Senior');
  if (opts.isHomeService) parts.push('HomeService');
  return parts.length > 0 ? parts.join(',') : undefined;
}

/**
 * Assembles a CreateBookingRequest from the screen's booking params.
 * Handles date/time formatting and strips null/undefined optional fields.
 */
export function buildCreateBookingRequest(
  params: BookAppointmentParams,
): CreateBookingRequest {
  const payload: CreateBookingRequest = {
    establishmentId: params.establishmentId,
    salonServiceId: params.salonServiceId,
    selectedDurationIndex: params.selectedDurationIndex,
    therapistPref: params.therapistPref,
    startTime: formatStartTime(params.date, params.time),
  };

  if (params.selectedAddOnIndices && params.selectedAddOnIndices.length > 0) {
    payload.selectedAddOnIndices = params.selectedAddOnIndices;
  }

  if (params.staffId) {
    payload.staffId = params.staffId;
  }

  if (params.options) {
    payload.options = params.options;
  }

  if (params.idImage) {
    payload.idImage = params.idImage as CreateBookingRequest['idImage'];
  }

  if (params.latitude != null) {
    payload.latitude = params.latitude;
  }

  if (params.longitude != null) {
    payload.longitude = params.longitude;
  }

  return payload;
}

/**
 * Builds GetAvailableSlotsParams for a single-day query
 * (used by the date/time picker on Step 5).
 */
export function buildAvailableSlotsParams(opts: {
  establishmentId: string;
  salonServiceId?: string;
  date: Date;
  durationMinutes?: number;
  staffId?: string;
}): GetAvailableSlotsParams {
  return {
    establishmentId: opts.establishmentId,
    salonServiceId: opts.salonServiceId,
    date: formatDateOnly(opts.date),
    durationMinutes: opts.durationMinutes ?? 0,
    staffId: opts.staffId,
  };
}

/**
 * Builds GetAvailableSlotsParams for a date-range query
 * (used when loading a full month of available days).
 */
export function buildAvailableSlotsRangeParams(opts: {
  establishmentId: string;
  salonServiceId?: string;
  startDate: Date;
  endDate: Date;
  durationMinutes?: number;
  staffId?: string;
}): GetAvailableSlotsParams {
  return {
    establishmentId: opts.establishmentId,
    salonServiceId: opts.salonServiceId,
    startDate: formatDateOnly(opts.startDate),
    endDate: formatDateOnly(opts.endDate),
    durationMinutes: opts.durationMinutes ?? 0,
    staffId: opts.staffId,
  };
}

/**
 * Builds GetBookingsParams for customer-facing "My Bookings" queries.
 */
export function buildGetBookingsParams(opts: {
  customerId?: string;
  establishmentId?: string;
  staffId?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}): GetBookingsParams {
  return {
    customerId: opts.customerId,
    establishmentId: opts.establishmentId,
    staffId: opts.staffId,
    status: opts.status,
    page: opts.page ?? 1,
    pageSize: opts.pageSize ?? 10,
  };
}

/**
 * Convenience wrapper: submit a booking from the screen's collected state.
 *
 * Usage:
 *   const response = await submitBooking({ ...params });
 */
export async function submitBooking(
  params: BookAppointmentParams,
) {
  const request = buildCreateBookingRequest(params);
  return createBooking(request);
}

/**
 * Convenience wrapper: cancel a booking (sets status to "Cancelled").
 */
export async function cancelBooking(bookingId: string) {
  const payload: UpdateBookingRequest = { status: 'Cancelled' };
  return updateBooking(bookingId, payload);
}

/**
 * Convenience wrapper: mark a booking as completed.
 */
export async function completeBooking(bookingId: string) {
  const payload: UpdateBookingRequest = { status: 'Completed' };
  return updateBooking(bookingId, payload);
}

/**
 * Convenience wrapper: mark a booking as no-show.
 */
export async function markNoShow(bookingId: string) {
  const payload: UpdateBookingRequest = { status: 'NoShow' };
  return updateBooking(bookingId, payload);
}

/**
 * Convenience wrapper: confirm a pending booking.
 */
export async function confirmBooking(bookingId: string) {
  const payload: UpdateBookingRequest = { status: 'Confirmed' };
  return updateBooking(bookingId, payload);
}
