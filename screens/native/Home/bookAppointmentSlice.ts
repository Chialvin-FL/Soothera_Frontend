/**
 * bookAppointmentSlice.ts
 *
 * Custom hook that manages all async booking state — following the
 * same hook-based "slice" pattern used throughout this project
 * (e.g. useUserSlice, useDocUploadSlice).
 *
 * Covers all five BookingController endpoints:
 *   createBooking    → POST   /api/Booking/create-booking
 *   getBookings      → GET    /api/Booking/get-booking
 *   getAvailableSlots → GET   /api/Booking/available-slots
 *   updateBooking    → PUT    /api/Booking/update-booking/:id
 *   deleteBooking    → DELETE /api/Booking/delete-booking/:id
 */

import { useState, useCallback } from 'react';
import {
  createBooking,
  getBookings,
  getAvailableSlots,
  updateBooking,
  deleteBooking,
} from '@/api/endpoints/apiBooking';
import { getSalonServices } from '@/api/endpoints/apiService';
import { getStaffAvailability } from '@/api/endpoints/apiStaff';
import type {
  BookingResponse,
  CreateBookingResponse,
  AvailableSlotsData,
  GetBookingsParams,
  GetAvailableSlotsParams,
  UpdateBookingRequest,
  SalonServiceResponse,
} from '@/api/types';
import type { BookAppointmentParams } from './bookAppointmentService';
import { buildCreateBookingRequest } from './bookAppointmentService';

export interface StaffMember {
  staffId: string;
  staffName: string;
}

// ─────────────────────────────────────────────────────────────

export function useBookAppointmentSlice() {

  // ── Create ────────────────────────────────────────────────
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [lastCreatedBookingId, setLastCreatedBookingId] = useState<string | null>(null);

  // ── List / Fetch ──────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // ── Available Slots ───────────────────────────────────────
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  /**
   * Map of date string → available time slots.
   * Key: "M-dd-yyyy"  Value: ["HH:mm", ...]
   */
  const [availableSlots, setAvailableSlots] = useState<AvailableSlotsData>({});

  // ── Update ────────────────────────────────────────────────
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  // ── Delete ────────────────────────────────────────────────
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // ── Establishment Services ────────────────────────────────
  const [services, setServices] = useState<SalonServiceResponse[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [servicesError, setServicesError] = useState<string | null>(null);

  // ── Establishment Therapists ──────────────────────────────
  const [therapists, setTherapists] = useState<StaffMember[]>([]);
  const [therapistsLoading, setTherapistsLoading] = useState(false);
  const [therapistsError, setTherapistsError] = useState<string | null>(null);

  // ─── Actions ──────────────────────────────────────────────

  /**
   * POST /api/Booking/create-booking
   * Accepts the raw BookAppointmentParams (screen state). Internally
   * calls buildCreateBookingRequest() to format dates + build FormData payload.
   *
   * Returns the response on success, null on failure.
   */
  const submitBooking = useCallback(
    async (params: BookAppointmentParams): Promise<CreateBookingResponse | null> => {
      setCreating(true);
      setCreateError(null);
      setLastCreatedBookingId(null);
      try {
        const request = buildCreateBookingRequest(params);
        const response = await createBooking(request);
        if (response.success) {
          setLastCreatedBookingId(response.id ?? null);
          return response;
        } else {
          setCreateError(response.message);
          return null;
        }
      } catch (e: any) {
        const msg = e?.message ?? 'Failed to create booking.';
        setCreateError(msg);
        return null;
      } finally {
        setCreating(false);
      }
    },
    [],
  );

  /**
   * GET /api/Booking/get-booking
   * Accepts optional filter / pagination params.
   */
  const loadBookings = useCallback(
    async (params?: GetBookingsParams): Promise<boolean> => {
      setLoading(true);
      setFetchError(null);
      try {
        const response = await getBookings(params);
        if (response.success && response.data) {
          setBookings(response.data.items);
          setTotalCount(response.data.totalCount);
          setCurrentPage(response.data.page);
          setPageSize(response.data.pageSize);
          return true;
        } else {
          setFetchError(response.message);
          return false;
        }
      } catch (e: any) {
        setFetchError(e?.message ?? 'Failed to fetch bookings.');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  /**
   * GET /api/Booking/available-slots
   * Requires at minimum: establishmentId + date (or startDate+endDate).
   */
  const loadAvailableSlots = useCallback(
    async (params: GetAvailableSlotsParams): Promise<boolean> => {
      setSlotsLoading(true);
      setSlotsError(null);
      try {
        const response = await getAvailableSlots(params);
        if (response.success && response.data) {
          setAvailableSlots(response.data);
          return true;
        } else {
          setSlotsError(response.message);
          return false;
        }
      } catch (e: any) {
        setSlotsError(e?.message ?? 'Failed to fetch available slots.');
        return false;
      } finally {
        setSlotsLoading(false);
      }
    },
    [],
  );

  /**
   * PUT /api/Booking/update-booking/:id
   * Returns true on success, false on failure.
   */
  const editBooking = useCallback(
    async (id: string, payload: UpdateBookingRequest): Promise<boolean> => {
      setUpdating(true);
      setUpdateError(null);
      try {
        const response = await updateBooking(id, payload);
        if (response.success) {
          // Optimistically update the local list
          setBookings((prev) =>
            prev.map((b) => {
              if (b.bookingId !== id) return b;
              return {
                ...b,
                ...(payload.status ? { status: payload.status } : {}),
                ...(payload.paymentStatus ? { paymentStatus: payload.paymentStatus } : {}),
                ...(payload.startTime ? { startTime: payload.startTime } : {}),
              };
            }),
          );
          return true;
        } else {
          setUpdateError(response.message);
          return false;
        }
      } catch (e: any) {
        setUpdateError(e?.message ?? 'Failed to update booking.');
        return false;
      } finally {
        setUpdating(false);
      }
    },
    [],
  );

  /**
   * DELETE /api/Booking/delete-booking/:id
   * Returns true on success, false on failure.
   */
  const removeBooking = useCallback(
    async (id: string): Promise<boolean> => {
      setDeleting(true);
      setDeleteError(null);
      try {
        const response = await deleteBooking(id);
        if (response.success) {
          setBookings((prev) => prev.filter((b) => b.bookingId !== id));
          setTotalCount((prev) => Math.max(0, prev - 1));
          return true;
        } else {
          setDeleteError(response.message);
          return false;
        }
      } catch (e: any) {
        setDeleteError(e?.message ?? 'Failed to delete booking.');
        return false;
      } finally {
        setDeleting(false);
      }
    },
    [],
  );

  // ─── Establishment Services ───────────────────────────────

  /**
   * Loads all active salon services for the given establishment.
   * GET /api/SalonService/get-service?establishmentId=...
   */
  const loadEstablishmentServices = useCallback(
    async (establishmentId: string): Promise<boolean> => {
      setServicesLoading(true);
      setServicesError(null);
      try {
        const response = await getSalonServices({
          establishmentId,
          isActive: true,
          pageSize: 100,
        });
        if (response.success && response.data) {
          setServices(response.data.items);
          return true;
        } else {
          setServicesError(response.message);
          return false;
        }
      } catch (e: any) {
        setServicesError(e?.message ?? 'Failed to load services.');
        return false;
      } finally {
        setServicesLoading(false);
      }
    },
    [],
  );

  // ─── Establishment Therapists ─────────────────────────────

  /**
   * Loads unique therapists that have availability records for the given establishment.
   * GET /api/Staff?establishmentId=... — deduplicates by staffId.
   */
  const loadEstablishmentTherapists = useCallback(
    async (establishmentId: string): Promise<boolean> => {
      setTherapistsLoading(true);
      setTherapistsError(null);
      try {
        const response = await getStaffAvailability({
          establishmentId,
          pageSize: 200,
        });
        if (response.success && response.data) {
          const seen = new Set<string>();
          const unique: StaffMember[] = [];
          for (const item of response.data.items) {
            if (!seen.has(item.staffId)) {
              seen.add(item.staffId);
              unique.push({ staffId: item.staffId, staffName: item.staffName });
            }
          }
          setTherapists(unique);
          return true;
        } else {
          setTherapistsError(response.message);
          return false;
        }
      } catch (e: any) {
        setTherapistsError(e?.message ?? 'Failed to load therapists.');
        return false;
      } finally {
        setTherapistsLoading(false);
      }
    },
    [],
  );

  // ─── Convenience wrappers ─────────────────────────────────

  /** Cancel a booking (sets status → "Cancelled"). */
  const cancelBooking = useCallback(
    (id: string) => editBooking(id, { status: 'Cancelled' }),
    [editBooking],
  );

  /** Confirm a pending booking (sets status → "Confirmed"). */
  const confirmBooking = useCallback(
    (id: string) => editBooking(id, { status: 'Confirmed' }),
    [editBooking],
  );

  /** Mark a booking as completed (sets status → "Completed"). */
  const completeBooking = useCallback(
    (id: string) => editBooking(id, { status: 'Completed' }),
    [editBooking],
  );

  /** Mark a booking as no-show (sets status → "NoShow"). */
  const markNoShow = useCallback(
    (id: string) => editBooking(id, { status: 'NoShow' }),
    [editBooking],
  );

  // ─── Reset helpers ────────────────────────────────────────

  const resetCreateState = useCallback(() => {
    setCreateError(null);
    setLastCreatedBookingId(null);
  }, []);

  const clearBookings = useCallback(() => {
    setBookings([]);
    setTotalCount(0);
    setCurrentPage(1);
  }, []);

  const clearAvailableSlots = useCallback(() => {
    setAvailableSlots({});
    setSlotsError(null);
  }, []);

  const clearErrors = useCallback(() => {
    setCreateError(null);
    setFetchError(null);
    setSlotsError(null);
    setUpdateError(null);
    setDeleteError(null);
  }, []);

  // ─────────────────────────────────────────────────────────
  return {
    // ── Create ──
    creating,
    createError,
    lastCreatedBookingId,
    submitBooking,
    resetCreateState,

    // ── List ──
    loading,
    fetchError,
    bookings,
    totalCount,
    currentPage,
    pageSize,
    loadBookings,
    clearBookings,

    // ── Available Slots ──
    slotsLoading,
    slotsError,
    availableSlots,
    loadAvailableSlots,
    clearAvailableSlots,

    // ── Update ──
    updating,
    updateError,
    editBooking,
    cancelBooking,
    confirmBooking,
    completeBooking,
    markNoShow,

    // ── Delete ──
    deleting,
    deleteError,
    removeBooking,

    // ── Establishment Services ──
    services,
    servicesLoading,
    servicesError,
    loadEstablishmentServices,

    // ── Establishment Therapists ──
    therapists,
    therapistsLoading,
    therapistsError,
    loadEstablishmentTherapists,

    // ── Misc ──
    clearErrors,
  };
}
