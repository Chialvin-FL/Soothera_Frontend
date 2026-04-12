import { useState, useEffect, useCallback } from 'react';
import {
    fetchMySchedule,
    postSchedule,
    removeScheduleEntry,
    type PostSchedulePayload,
} from './scheduleService';
import type { StaffAvailability } from '@/api/types';

// ─────────────────────────────────────────────────────────────
// Schedule Slice
// Manages state for the therapist's schedule management screen.
// ─────────────────────────────────────────────────────────────

// ── Modal feedback shape (maps 1-to-1 with SuccessModal props) ──
export interface ScheduleModalState {
    visible: boolean;
    title: string;
    message: string;
    variant: 'success' | 'error';
}

const HIDDEN_MODAL: ScheduleModalState = {
    visible: false,
    title: '',
    message: '',
    variant: 'success',
};

// ── Slice state interface ──────────────────────────────────────
export interface ScheduleSliceState {
    // Data
    scheduleItems: StaffAvailability[];

    // Status flags
    isLoading: boolean;
    isPosting: boolean;
    isDeleting: boolean;

    // Modal feedback (drives SuccessModal)
    modal: ScheduleModalState;
    closeModal: () => void;

    // Actions
    loadSchedule: (establishmentId: string) => Promise<void>;
    handlePost: (
        payload: PostSchedulePayload,
        onSuccess?: () => void,
    ) => Promise<void>;
    handleDelete: (
        id: string,
        onSuccess?: () => void,
    ) => Promise<void>;
}

// ─────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────

export function useScheduleSlice(
    /** Pass the establishment ID so the slice auto-loads on mount. */
    establishmentId: string | null,
): ScheduleSliceState {
    const [scheduleItems, setScheduleItems] = useState<StaffAvailability[]>([]);

    const [isLoading, setIsLoading] = useState(false);
    const [isPosting, setIsPosting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const [modal, setModal] = useState<ScheduleModalState>(HIDDEN_MODAL);

    // ── Helpers ────────────────────────────────────────────────

    const showSuccess = (title: string, message: string) => {
        console.log('[ScheduleSlice] showSuccess:', title, '|', message);
        setModal({ visible: true, title, message, variant: 'success' });
    };

    const showError = (title: string, message: string) => {
        console.warn('[ScheduleSlice] showError:', title, '|', message);
        setModal({ visible: true, title, message, variant: 'error' });
    };

    const closeModal = () => {
        console.log('[ScheduleSlice] closeModal called.');
        setModal(HIDDEN_MODAL);
    };

    // ── Load schedule ──────────────────────────────────────────

    const loadSchedule = useCallback(async (estId: string) => {
        console.log('[ScheduleSlice] loadSchedule: starting... establishmentId =', estId);
        setIsLoading(true);

        const result = await fetchMySchedule(estId);

        console.log('[ScheduleSlice] loadSchedule: result =', JSON.stringify({
            success: result.success,
            message: result.message,
            itemCount: result.data.length,
        }));

        if (result.success) {
            setScheduleItems(result.data);
            console.log('[ScheduleSlice] loadSchedule: set', result.data.length, 'items.');
        } else {
            console.warn('[ScheduleSlice] loadSchedule: failed =', result.message);
            showError('Failed to Load Schedule', result.message);
        }

        setIsLoading(false);
    }, []);

    // Auto-load when establishmentId becomes available
    useEffect(() => {
        if (establishmentId) {
            console.log('[ScheduleSlice] useEffect: auto-loading schedule for establishmentId =', establishmentId);
            loadSchedule(establishmentId);
        } else {
            console.log('[ScheduleSlice] useEffect: no establishmentId yet, skipping load.');
        }
    }, [establishmentId, loadSchedule]);

    // ── Post / create schedule ─────────────────────────────────

    const handlePost = async (
        payload: PostSchedulePayload,
        onSuccess?: () => void,
    ) => {
        console.log('[ScheduleSlice] handlePost: called with payload =', JSON.stringify({
            establishmentId: payload.establishmentId,
            availabilityType: payload.availabilityType,
            daysOfWeek: payload.daysOfWeek,
            specificDate: payload.specificDate,
            startTime: payload.startTime,
            endTime: payload.endTime,
            isAvailable: payload.isAvailable,
        }));

        // ── Client-side validation ────────────────────────────
        if (!payload.establishmentId) {
            console.warn('[ScheduleSlice] handlePost: missing establishmentId.');
            showError('Validation Error', 'Establishment ID is required.');
            return;
        }
        if (!payload.startTime || !payload.endTime) {
            console.warn('[ScheduleSlice] handlePost: missing startTime or endTime.');
            showError('Validation Error', 'Start time and end time are required.');
            return;
        }

        setIsPosting(true);

        const result = await postSchedule(payload);
        console.log('[ScheduleSlice] handlePost: result =', JSON.stringify(result));

        if (result.success) {
            showSuccess('Schedule Saved', result.message || 'Your schedule has been saved successfully.');
            // Reload to reflect the server-side REPLACE logic
            console.log('[ScheduleSlice] handlePost: reloading schedule after save...');
            await loadSchedule(payload.establishmentId);
            if (onSuccess) onSuccess();
        } else {
            showError('Save Failed', result.message || 'Failed to save schedule. Please try again.');
        }

        setIsPosting(false);
    };

    // ── Delete a single schedule entry ─────────────────────────

    const handleDelete = async (
        id: string,
        onSuccess?: () => void,
    ) => {
        console.log('[ScheduleSlice] handleDelete: called for id =', id);

        if (!id) {
            console.warn('[ScheduleSlice] handleDelete: no id provided, aborting.');
            showError('Delete Error', 'Invalid schedule record ID.');
            return;
        }

        setIsDeleting(true);

        const result = await removeScheduleEntry(id);
        console.log('[ScheduleSlice] handleDelete: result =', JSON.stringify(result));

        if (result.success) {
            showSuccess('Entry Removed', result.message || 'Schedule entry deleted successfully.');
            // Optimistic UI: remove from local state immediately
            setScheduleItems((prev) => {
                const updated = prev.filter((item) => item.id !== id);
                console.log('[ScheduleSlice] handleDelete: removed from local state. remaining =', updated.length);
                return updated;
            });
            if (onSuccess) onSuccess();
        } else {
            showError('Delete Failed', result.message || 'Failed to delete schedule entry. Please try again.');
        }

        setIsDeleting(false);
    };

    // ── Return ─────────────────────────────────────────────────

    return {
        scheduleItems,
        isLoading,
        isPosting,
        isDeleting,
        modal,
        closeModal,
        loadSchedule,
        handlePost,
        handleDelete,
    };
}
