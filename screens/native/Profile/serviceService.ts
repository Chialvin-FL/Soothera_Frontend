import {
    addSalonService,
    getSalonServices,
    updateSalonService,
    deleteSalonService,
} from '@/api/endpoints/apiService';
import { loadStoredSession } from '@/screens/native/Login/loginService';
import type { SalonServiceResponse, ApiError } from '@/api/types';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export interface ServiceActionResponse {
    success: boolean;
    message: string;
}

export interface FetchServicesResponse {
    success: boolean;
    message: string;
    data: SalonServiceResponse[];
    totalCount: number;
}

/** One pricing tier (a price + a duration pair). */
export interface PricingTier {
    price: string;       // kept as string for TextInput convenience
    duration: string;    // minutes, kept as string
}

/** One add-on row (name + price). */
export interface AddOnRow {
    name: string;
    price: string;       // kept as string for TextInput convenience
}

/** Form state for the Create / Edit service modal. */
export interface ServiceFormData {
    serviceName: string;
    description: string;
    /** MassageCategory enum value (int) */
    category: number;
    tiers: PricingTier[];
    addOns: AddOnRow[];
    imageFile?: { uri: string; name: string; type: string } | null;
    isActive: boolean;
}

export const MASSAGE_CATEGORIES = [
    { label: 'Swedish',        value: 0 },
    { label: 'Deep Tissue',    value: 1 },
    { label: 'Hot Stone',      value: 2 },
    { label: 'Aromatherapy',   value: 3 },
    { label: 'Reflexology',    value: 4 },
    { label: 'Shiatsu',        value: 5 },
    { label: 'Thai',           value: 6 },
    { label: 'Sports',         value: 7 },
    { label: 'Prenatal',       value: 8 },
    { label: 'Other',          value: 9 },
] as const;

export function categoryLabel(category: string | number): string {
    const cat = MASSAGE_CATEGORIES.find(
        (c) => String(c.value) === String(category) || c.label.toLowerCase() === String(category).toLowerCase(),
    );
    return cat?.label ?? String(category);
}

// ─────────────────────────────────────────────────────────────
// Fetch services for the current admin's establishment
// ─────────────────────────────────────────────────────────────

export async function fetchMyServices(
    establishmentId: string,
    page = 1,
    pageSize = 50,
): Promise<FetchServicesResponse> {
    console.log('[ServiceService] fetchMyServices: establishmentId =', establishmentId, 'page =', page);
    try {
        const response = await getSalonServices({ establishmentId, page, pageSize });
        console.log('[ServiceService] fetchMyServices: API response success =', response.success);

        if (!response.success) {
            return { success: false, message: response.message, data: [], totalCount: 0 };
        }

        const items = response.data?.items ?? [];
        const totalCount = response.data?.totalCount ?? 0;
        console.log('[ServiceService] fetchMyServices: items =', items.length, 'total =', totalCount);
        return { success: true, message: response.message, data: items, totalCount };
    } catch (err: any) {
        console.error('[ServiceService] fetchMyServices: ERROR =', err);
        if (err?.statusCode === 404 || err?.response?.status === 404) {
            return { success: true, message: 'No services found.', data: [], totalCount: 0 };
        }
        const apiErr = err as ApiError;
        return { success: false, message: apiErr?.message ?? 'Failed to fetch services.', data: [], totalCount: 0 };
    }
}

// ─────────────────────────────────────────────────────────────
// Create service
// ─────────────────────────────────────────────────────────────

export async function createService(
    form: ServiceFormData,
): Promise<ServiceActionResponse> {
    console.log('[ServiceService] createService: starting, serviceName =', form.serviceName);
    try {
        const session = await loadStoredSession();
        if (!session?.uid) {
            return { success: false, message: 'Not authenticated.' };
        }

        const prices = form.tiers.map((t) => parseInt(t.price, 10) || 0);
        const durations = form.tiers.map((t) => parseInt(t.duration, 10) || 0);
        const addOnNames = form.addOns.map((a) => a.name).filter(Boolean);
        const addOnPrices = form.addOns.map((a) => parseInt(a.price, 10) || 0);

        const response = await addSalonService({
            serviceName: form.serviceName,
            description: form.description,
            category: form.category,
            price: prices,
            durationMinutes: durations,
            addOns: addOnNames.length ? addOnNames : undefined,
            addOnPrices: addOnPrices.length ? addOnPrices : undefined,
            imageFile: form.imageFile ?? undefined,
            isActive: form.isActive,
        });
        console.log('[ServiceService] createService: response =', JSON.stringify(response));
        return { success: response.success, message: response.message };
    } catch (err: any) {
        console.error('[ServiceService] createService: ERROR =', err);
        const apiErr = err as ApiError;
        return { success: false, message: apiErr?.message ?? 'Failed to create service.' };
    }
}

// ─────────────────────────────────────────────────────────────
// Update service
// ─────────────────────────────────────────────────────────────

export async function editService(
    serviceId: string,
    form: ServiceFormData,
): Promise<ServiceActionResponse> {
    console.log('[ServiceService] editService: id =', serviceId);
    try {
        const session = await loadStoredSession();
        if (!session?.uid) {
            return { success: false, message: 'Not authenticated.' };
        }

        const prices = form.tiers.map((t) => parseInt(t.price, 10) || 0);
        const durations = form.tiers.map((t) => parseInt(t.duration, 10) || 0);
        const addOnNames = form.addOns.map((a) => a.name).filter(Boolean);
        const addOnPrices = form.addOns.map((a) => parseInt(a.price, 10) || 0);

        const response = await updateSalonService(serviceId, {
            serviceName: form.serviceName,
            description: form.description,
            category: form.category,
            price: prices,
            durationMinutes: durations,
            addOns: addOnNames.length ? addOnNames : undefined,
            addOnPrices: addOnPrices.length ? addOnPrices : undefined,
            imageFile: form.imageFile ?? undefined,
            isActive: form.isActive,
            updatedBy: session.uid,
        });
        console.log('[ServiceService] editService: response =', JSON.stringify(response));
        return { success: response.success, message: response.message };
    } catch (err: any) {
        console.error('[ServiceService] editService: ERROR =', err);
        const apiErr = err as ApiError;
        return { success: false, message: apiErr?.message ?? 'Failed to update service.' };
    }
}

// ─────────────────────────────────────────────────────────────
// Delete service
// ─────────────────────────────────────────────────────────────

export async function removeService(
    serviceId: string,
): Promise<ServiceActionResponse> {
    console.log('[ServiceService] removeService: id =', serviceId);
    try {
        const response = await deleteSalonService(serviceId);
        console.log('[ServiceService] removeService: response =', JSON.stringify(response));
        return { success: response.success, message: response.message };
    } catch (err: any) {
        console.error('[ServiceService] removeService: ERROR =', err);
        const apiErr = err as ApiError;
        return { success: false, message: apiErr?.message ?? 'Failed to delete service.' };
    }
}
