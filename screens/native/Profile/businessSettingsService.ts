import {
    viewSalons,
    addSalon,
    updateSalon,
    deleteSalon,
} from '@/api/endpoints/apiSalonEstablishment';
import { loadStoredSession, updateStoredUserData } from '@/screens/native/Login/loginService';
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
// Fetch the current user's massage spa establishment (1 per Admin)
// ─────────────────────────────────────────────────────────────

export async function fetchMyEstablishment(): Promise<FetchEstablishmentResponse> {
    console.log('[BusinessSettingsService] fetchMyEstablishment: starting...');
    try {
        const session = await loadStoredSession();
        if (!session?.uid) {
            console.warn('[BusinessSettingsService] fetchMyEstablishment: no session/uid found.');
            return { success: false, message: 'Not authenticated.', data: null };
        }
        console.log('[BusinessSettingsService] fetchMyEstablishment: session uid =', session.uid);

        const response = await viewSalons(undefined, session.uid);
        console.log('[BusinessSettingsService] fetchMyEstablishment: API response =', JSON.stringify(response));

        if (!response.success || !response.data) {
            console.log('[BusinessSettingsService] fetchMyEstablishment: no data in response, treating as no establishment.');
            return { success: true, message: 'No establishment found.', data: null };
        }

        // The API returns all massage spas — find the one belonging to this user
        const all = Array.isArray(response.data)
            ? (response.data as SalonEstablishment[])
            : [response.data as SalonEstablishment];

        // Paginated wrapper: data may actually be { items, ... }
        const paginatedData = response.data as any;
        const items: SalonEstablishment[] = paginatedData?.items ?? all;
        console.log('[BusinessSettingsService] fetchMyEstablishment: total items =', items.length, '| looking for uid =', session.uid);

        const mine = items.find((s) => s.uid === session.uid) ?? null;
        console.log('[BusinessSettingsService] fetchMyEstablishment: mine =', mine ? `found (id: ${mine.id})` : 'not found');

        if (mine) {
            await updateStoredUserData({ establishmentId: mine.id });
        }

        return {
            success: true,
            message: mine ? 'Establishment loaded.' : 'No establishment found.',
            data: mine,
        };
    } catch (err: any) {
        console.warn('[BusinessSettingsService] fetchMyEstablishment: caught error =', err);
        // 404 simply means no establishment has been created yet — not a real error
        if (err?.statusCode === 404 || err?.response?.status === 404) {
            console.log('[BusinessSettingsService] fetchMyEstablishment: 404 = no establishment yet, suppressing.');
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
    const mode = existingId ? 'UPDATE' : 'CREATE';
    console.log(`[BusinessSettingsService] saveEstablishment: mode=${mode}, existingId=${existingId ?? 'none'}`);
    console.log('[BusinessSettingsService] saveEstablishment: form =', JSON.stringify({
        name: form.name,
        address: form.address,
        description: form.description,
        contactNumber: form.contactNumber,
        businessHours: form.businessHours,
        facebookLink: form.facebookLink,
        hasPictureFile: !!form.pictureFile?.uri,
    }));

    try {
        const session = await loadStoredSession();
        if (!session?.uid) {
            console.warn('[BusinessSettingsService] saveEstablishment: no session found — aborting.');
            return { success: false, message: 'Not authenticated.' };
        }
        console.log('[BusinessSettingsService] saveEstablishment: session uid =', session.uid);

        const socials = form.facebookLink.trim() ? [form.facebookLink.trim()] : [];

        if (existingId) {
            // ── UPDATE ──
            console.log('[BusinessSettingsService] saveEstablishment: calling updateSalon for id =', existingId);
            const response = await updateSalon(existingId, {
                name: form.name,
                address: form.address,
                description: form.description,
                contactNumber: form.contactNumber,
                businessHours: form.businessHours,
                socials,
                pictureFile: form.pictureFile ?? undefined,
            });
            console.log('[BusinessSettingsService] saveEstablishment: updateSalon response =', JSON.stringify(response));

            return {
                success: response.success,
                message: response.message,
            };
        } else {
            // ── CREATE ──
            console.log('[BusinessSettingsService] saveEstablishment: calling addSalon with uid =', session.uid);
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
            console.log('[BusinessSettingsService] saveEstablishment: addSalon response =', JSON.stringify(response));

            if (response.success && response.data?.id) {
                await updateStoredUserData({ establishmentId: response.data.id });
            }

            return {
                success: response.success,
                message: response.message,
            };
        }
    } catch (err: any) {
        console.error(`[BusinessSettingsService] saveEstablishment: ERROR during ${mode}:`, err);
        const apiErr = err as ApiError;
        return {
            success: false,
            message: apiErr?.message ?? `Failed to ${mode === 'CREATE' ? 'create' : 'update'} establishment.`,
        };
    }
}

// ─────────────────────────────────────────────────────────────
// Delete the establishment
// ─────────────────────────────────────────────────────────────

export async function removeEstablishment(
    id: string,
): Promise<BusinessSettingsActionResponse> {
    console.log('[BusinessSettingsService] removeEstablishment: deleting id =', id);
    try {
        const response = await deleteSalon(id);
        console.log('[BusinessSettingsService] removeEstablishment: deleteSalon response =', JSON.stringify(response));
        if (response.success) {
            await updateStoredUserData({ establishmentId: null });
        }
        return { success: response.success, message: response.message };
    } catch (err: any) {
        console.error('[BusinessSettingsService] removeEstablishment: ERROR:', err);
        const apiErr = err as ApiError;
        return {
            success: false,
            message: apiErr?.message ?? 'Failed to delete establishment.',
        };
    }
}
