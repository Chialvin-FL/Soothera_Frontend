import {
    createStaffAvailability,
    getStaffAvailability,
    deleteStaffAvailability,
} from '@/api/endpoints/apiStaff';
import { loadStoredSession } from '@/screens/native/Login/loginService';
import type {
    StaffAvailability,
    CreateStaffRequest,
    ApiError,
    AvailabilityType,
    DayOfWeekEnum,
} from '@/api/types';

// ─────────────────────────────────────────────────────────────
// Shared response shapes
// ─────────────────────────────────────────────────────────────

export interface ScheduleActionResponse {
    success: boolean;
    message: string;
}

export interface FetchScheduleResponse {
    success: boolean;
    message: string;
    data: StaffAvailability[];
}

// ─────────────────────────────────────────────────────────────
// Fetch the current user's schedule for a given establishment
// ─────────────────────────────────────────────────────────────

export async function fetchMySchedule(
    establishmentId: string,
): Promise<FetchScheduleResponse> {
    console.log('[ScheduleService] fetchMySchedule: starting... establishmentId =', establishmentId);
    try {
        const session = await loadStoredSession();
        if (!session?.uid) {
            console.warn('[ScheduleService] fetchMySchedule: no session/uid found.');
            return { success: false, message: 'Not authenticated.', data: [] };
        }
        console.log('[ScheduleService] fetchMySchedule: session uid =', session.uid);

        const response = await getStaffAvailability({
            establishmentId,
            staffId: session.uid,
            pageSize: 100, // fetch all records; staff won't have hundreds of slots
        });

        console.log('[ScheduleService] fetchMySchedule: API response =', JSON.stringify({
            success: response.success,
            message: response.message,
            itemCount: response.data?.items?.length ?? 0,
        }));

        if (!response.success) {
            console.warn('[ScheduleService] fetchMySchedule: API returned failure:', response.message);
            return { success: false, message: response.message, data: [] };
        }

        const items = response.data?.items ?? [];
        return {
            success: true,
            message: items.length > 0 ? 'Schedule loaded.' : 'No schedule records found.',
            data: items,
        };
    } catch (err: any) {
        console.error('[ScheduleService] fetchMySchedule: caught error =', err);
        if (err?.statusCode === 404 || err?.response?.status === 404) {
            console.log('[ScheduleService] fetchMySchedule: 404 = no records yet, suppressing.');
            return { success: true, message: 'No schedule records found.', data: [] };
        }
        const apiErr = err as ApiError;
        return {
            success: false,
            message: apiErr?.message ?? 'Failed to fetch schedule.',
            data: [],
        };
    }
}

// ─────────────────────────────────────────────────────────────
// Post (create) one or more schedule entries
// ─────────────────────────────────────────────────────────────

export interface PostSchedulePayload {
    establishmentId: string;
    availabilityType: AvailabilityType;
    /** For Recurring */
    daysOfWeek?: DayOfWeekEnum[];
    /** For OneTime — "M-dd-yyyy" */
    specificDate?: string;
    /** "HH:mm:00" */
    startTime: string;
    /** "HH:mm:00" */
    endTime: string;
    isAvailable?: boolean;
}

export async function postSchedule(
    payload: PostSchedulePayload,
): Promise<ScheduleActionResponse> {
    console.log('[ScheduleService] postSchedule: starting... payload =', JSON.stringify({
        establishmentId: payload.establishmentId,
        availabilityType: payload.availabilityType,
        daysOfWeek: payload.daysOfWeek,
        specificDate: payload.specificDate,
        startTime: payload.startTime,
        endTime: payload.endTime,
        isAvailable: payload.isAvailable,
    }));

    try {
        const session = await loadStoredSession();
        if (!session?.uid) {
            console.warn('[ScheduleService] postSchedule: no session/uid found.');
            return { success: false, message: 'Not authenticated.' };
        }
        console.log('[ScheduleService] postSchedule: session uid =', session.uid);

        const request: CreateStaffRequest = {
            establishmentId: payload.establishmentId,
            availabilityType: payload.availabilityType,
            daysOfWeek: payload.daysOfWeek,
            specificDate: payload.specificDate,
            startTime: payload.startTime,
            endTime: payload.endTime,
            isAvailable: payload.isAvailable ?? true,
        };

        console.log('[ScheduleService] postSchedule: calling createStaffAvailability...');
        const response = await createStaffAvailability(request);

        console.log('[ScheduleService] postSchedule: API response =', JSON.stringify({
            success: response.success,
            message: response.message,
            ids: (response.data as any)?.ids ?? [],
        }));

        return {
            success: response.success,
            message: response.message,
        };
    } catch (err: any) {
        console.error('[ScheduleService] postSchedule: caught error =', err);
        const apiErr = err as ApiError;
        return {
            success: false,
            message: apiErr?.message ?? 'Failed to save schedule.',
        };
    }
}

// ─────────────────────────────────────────────────────────────
// Delete a single schedule entry by its Firestore document ID
// ─────────────────────────────────────────────────────────────

export async function removeScheduleEntry(
    id: string,
): Promise<ScheduleActionResponse> {
    console.log('[ScheduleService] removeScheduleEntry: id =', id);
    try {
        const response = await deleteStaffAvailability(id);
        console.log('[ScheduleService] removeScheduleEntry: API response =', JSON.stringify(response));
        return {
            success: response.success,
            message: response.message,
        };
    } catch (err: any) {
        console.error('[ScheduleService] removeScheduleEntry: caught error =', err);
        const apiErr = err as ApiError;
        return {
            success: false,
            message: apiErr?.message ?? 'Failed to delete schedule entry.',
        };
    }
}
