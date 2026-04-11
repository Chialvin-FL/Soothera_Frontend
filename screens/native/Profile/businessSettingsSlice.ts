import { useState, useEffect, useCallback } from 'react';
import {
    fetchMyEstablishment,
    saveEstablishment,
    removeEstablishment,
    type SalonFormData,
} from './businessSettingsService';
import type { SalonEstablishment } from '@/api/types';

// ─────────────────────────────────────────────────────────────
// Business Settings Slice
// ─────────────────────────────────────────────────────────────

export interface BusinessSettingsSliceState {
    // Loaded establishment (null = none yet)
    establishment: SalonEstablishment | null;
    existingId: string | null;

    // Form field state
    form: SalonFormData;
    setForm: (partial: Partial<SalonFormData>) => void;

    // Status
    isLoading: boolean;
    isSaving: boolean;
    isDeleting: boolean;
    error: string | null;
    successMessage: string | null;
    clearMessages: () => void;

    // Actions
    loadEstablishment: () => Promise<void>;
    handleSave: (onSuccess?: () => void) => Promise<void>;
    handleDelete: (onSuccess?: () => void) => Promise<void>;
}

const EMPTY_FORM: SalonFormData = {
    name: '',
    address: '',
    description: '',
    contactNumber: '',
    businessHours: '',
    facebookLink: '',
    pictureFile: null,
};

export function useBusinessSettingsSlice(): BusinessSettingsSliceState {
    const [establishment, setEstablishment] = useState<SalonEstablishment | null>(null);
    const [existingId, setExistingId] = useState<string | null>(null);
    const [form, setFormState] = useState<SalonFormData>({ ...EMPTY_FORM });

    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const clearMessages = () => {
        setError(null);
        setSuccessMessage(null);
    };

    const setForm = (partial: Partial<SalonFormData>) => {
        setFormState((prev) => ({ ...prev, ...partial }));
    };

    // ── Load on mount ──
    const loadEstablishment = useCallback(async () => {
        console.log('[BusinessSettingsSlice] loadEstablishment: starting...');
        setIsLoading(true);
        clearMessages();

        const result = await fetchMyEstablishment();
        console.log('[BusinessSettingsSlice] loadEstablishment: result =', JSON.stringify({
            success: result.success,
            message: result.message,
            hasData: !!result.data,
        }));

        if (result.success && result.data) {
            const e = result.data;
            console.log('[BusinessSettingsSlice] loadEstablishment: setting establishment id =', e.id);
            setEstablishment(e);
            setExistingId(e.id);
            setFormState({
                name: e.name ?? '',
                address: e.address ?? '',
                description: e.description ?? '',
                contactNumber: e.contactNumber ?? '',
                businessHours: e.businessHours ?? '',
                facebookLink: e.socials?.[0] ?? '',
                pictureFile: null, // don't pre-fill — user picks a new one if desired
            });
        } else if (!result.success) {
            console.warn('[BusinessSettingsSlice] loadEstablishment: error =', result.message);
            setError(result.message);
        } else {
            console.log('[BusinessSettingsSlice] loadEstablishment: no establishment found, form stays empty.');
        }
        // result.success but no data = no establishment yet — leave form empty

        setIsLoading(false);
    }, []);

    useEffect(() => {
        loadEstablishment();
    }, [loadEstablishment]);

    // ── Save (create or update) ──
    const handleSave = async (onSuccess?: () => void) => {
        console.log('[BusinessSettingsSlice] handleSave: called. existingId =', existingId ?? 'none (CREATE)');
        if (!form.name.trim() || !form.address.trim()) {
            console.warn('[BusinessSettingsSlice] handleSave: validation failed — name or address missing.');
            setError('Massage spa name and address are required.');
            return;
        }

        setIsSaving(true);
        clearMessages();

        console.log('[BusinessSettingsSlice] handleSave: calling saveEstablishment...');
        const result = await saveEstablishment(form, existingId);
        console.log('[BusinessSettingsSlice] handleSave: result =', JSON.stringify(result));

        if (result.success) {
            setSuccessMessage(result.message || 'Saved successfully.');
            // Reload to get updated data and the new ID (in case it was a create)
            console.log('[BusinessSettingsSlice] handleSave: success, reloading establishment...');
            await loadEstablishment();
            if (onSuccess) onSuccess();
        } else {
            console.warn('[BusinessSettingsSlice] handleSave: failed =', result.message);
            setError(result.message);
        }

        setIsSaving(false);
    };

    // ── Delete ──
    const handleDelete = async (onSuccess?: () => void) => {
        console.log('[BusinessSettingsSlice] handleDelete: called. existingId =', existingId);
        if (!existingId) {
            console.warn('[BusinessSettingsSlice] handleDelete: no existingId, aborting.');
            return;
        }

        setIsDeleting(true);
        clearMessages();

        const result = await removeEstablishment(existingId);
        console.log('[BusinessSettingsSlice] handleDelete: result =', JSON.stringify(result));

        if (result.success) {
            console.log('[BusinessSettingsSlice] handleDelete: success, clearing state.');
            setSuccessMessage(result.message || 'Establishment deleted.');
            setEstablishment(null);
            setExistingId(null);
            setFormState({ ...EMPTY_FORM });
            if (onSuccess) onSuccess();
        } else {
            console.warn('[BusinessSettingsSlice] handleDelete: failed =', result.message);
            setError(result.message);
        }

        setIsDeleting(false);
    };

    return {
        establishment,
        existingId,
        form,
        setForm,
        isLoading,
        isSaving,
        isDeleting,
        error,
        successMessage,
        clearMessages,
        loadEstablishment,
        handleSave,
        handleDelete,
    };
}
