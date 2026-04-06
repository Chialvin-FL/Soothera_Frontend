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
        setIsLoading(true);
        clearMessages();

        const result = await fetchMyEstablishment();

        if (result.success && result.data) {
            const e = result.data;
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
            setError(result.message);
        }
        // result.success but no data = no establishment yet — leave form empty

        setIsLoading(false);
    }, []);

    useEffect(() => {
        loadEstablishment();
    }, [loadEstablishment]);

    // ── Save (create or update) ──
    const handleSave = async (onSuccess?: () => void) => {
        if (!form.name.trim() || !form.address.trim()) {
            setError('Salon name and address are required.');
            return;
        }

        setIsSaving(true);
        clearMessages();

        const result = await saveEstablishment(form, existingId);

        if (result.success) {
            setSuccessMessage(result.message || 'Saved successfully.');
            // Reload to get updated data and the new ID (in case it was a create)
            await loadEstablishment();
            if (onSuccess) onSuccess();
        } else {
            setError(result.message);
        }

        setIsSaving(false);
    };

    // ── Delete ──
    const handleDelete = async (onSuccess?: () => void) => {
        if (!existingId) return;

        setIsDeleting(true);
        clearMessages();

        const result = await removeEstablishment(existingId);

        if (result.success) {
            setSuccessMessage(result.message || 'Establishment deleted.');
            setEstablishment(null);
            setExistingId(null);
            setFormState({ ...EMPTY_FORM });
            if (onSuccess) onSuccess();
        } else {
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
