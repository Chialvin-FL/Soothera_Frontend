import {
    viewSalons,
    addSalon,
    updateSalon,
    deleteSalon,
} from '@/api/endpoints/apiSalonEstablishment';
import { loadStoredSession } from '@/screens/native/Login/loginService';
import type { SalonEstablishment, ApiError } from '@/api/types';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export interface BusinessSettingsActionResponse {
    success: boolean;
    message: string;
}

export interface FetchEstablishmentResponse {
    success: boolean;
    message: string;
    data: SalonEstablishment | null;
}

export interface SalonFormData {
    name: string;
    address: string;
    description: string;
    contactNumber: string;
    businessHours: string;
    facebookLink: string;
    /** RN ImagePicker asset or null */
    pictureFile?: { uri: string; name: string; type: string } | null;
}

// ─────────────────────────────────────────────────────────────
// Fetch the current user's salon establishment (1 per Admin)
// ─────────────────────────────────────────────────────────────

export async function fetchMyEstablishment(): Promise<FetchEstablishmentResponse> {
    try {
        const session = await loadStoredSession();
        if (!session?.uid) {
            return { success: false, message: 'Not authenticated.', data: null };
        }

        const response = await viewSalons();

        if (!response.success || !response.data) {
            return { success: true, message: 'No establishment found.', data: null };
        }

        // The API returns all salons — find the one belonging to this user
        const all = Array.isArray(response.data)
            ? (response.data as SalonEstablishment[])
            : [response.data as SalonEstablishment];

        // Paginated wrapper: data may actually be { items, ... }
        const paginatedData = response.data as any;
        const items: SalonEstablishment[] = paginatedData?.items ?? all;
        const mine = items.find((s) => s.uid === session.uid) ?? null;

        return {
            success: true,
            message: mine ? 'Establishment loaded.' : 'No establishment found.',
            data: mine,
        };
    } catch (err: any) {
        // 404 simply means no establishment has been created yet — not a real error
        if (err?.response?.status === 404) {
            return { success: true, message: 'No establishment found.', data: null };
        }
        const apiErr = err as ApiError;
        return {
            success: false,
            message: apiErr?.message ?? 'Failed to fetch establishment.',
            data: null,
        };
    }
}

// ─────────────────────────────────────────────────────────────
// Save (create OR update) the establishment
// ─────────────────────────────────────────────────────────────

export async function saveEstablishment(
    form: SalonFormData,
    existingId?: string | null,
): Promise<BusinessSettingsActionResponse> {
    try {
        const session = await loadStoredSession();
        if (!session?.uid) {
            return { success: false, message: 'Not authenticated.' };
        }

        const socials = form.facebookLink.trim() ? [form.facebookLink.trim()] : [];

        if (existingId) {
            // ── UPDATE ──
            const response = await updateSalon(existingId, {
                name: form.name,
                address: form.address,
                description: form.description,
                contactNumber: form.contactNumber,
                businessHours: form.businessHours,
                socials,
                pictureFile: form.pictureFile ?? undefined,
            });

            return {
                success: response.success,
                message: response.message,
            };
        } else {
            // ── CREATE ──
            const response = await addSalon({
                name: form.name,
                address: form.address,
                description: form.description,
                contactNumber: form.contactNumber,
                businessHours: form.businessHours,
                socials,
                uid: session.uid,
                pictureFile: form.pictureFile ?? undefined,
            });

            return {
                success: response.success,
                message: response.message,
            };
        }
    } catch (err) {
        const apiErr = err as ApiError;
        return {
            success: false,
            message: apiErr?.message ?? 'Failed to save establishment.',
        };
    }
}

// ─────────────────────────────────────────────────────────────
// Delete the establishment
// ─────────────────────────────────────────────────────────────

export async function removeEstablishment(
    id: string,
): Promise<BusinessSettingsActionResponse> {
    try {
        const response = await deleteSalon(id);
        return { success: response.success, message: response.message };
    } catch (err) {
        const apiErr = err as ApiError;
        return {
            success: false,
            message: apiErr?.message ?? 'Failed to delete establishment.',
        };
    }
}
