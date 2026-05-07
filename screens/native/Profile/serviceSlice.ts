import { useState, useEffect, useCallback } from 'react';
import {
    fetchMyServices,
    createService,
    editService,
    removeService,
    type ServiceFormData,
} from './serviceService';
import type { SalonServiceResponse } from '@/api/types';

// ─────────────────────────────────────────────────────────────
// Service Slice — state management hook for Services CRUD
// ─────────────────────────────────────────────────────────────

export interface ServiceSliceState {
    // List
    services: SalonServiceResponse[];
    totalCount: number;
    isLoading: boolean;

    // Form / modal state
    modalMode: 'create' | 'edit' | null;
    editingService: SalonServiceResponse | null;
    form: ServiceFormData;
    setForm: (partial: Partial<ServiceFormData>) => void;

    // Status
    isSaving: boolean;
    isDeleting: boolean;
    error: string | null;
    successMessage: string | null;
    clearMessages: () => void;

    // Actions
    loadServices: (establishmentId: string) => Promise<void>;
    openCreate: () => void;
    openEdit: (service: SalonServiceResponse) => void;
    closeModal: () => void;
    handleSave: (establishmentId: string, onSuccess?: () => void) => Promise<void>;
    handleDelete: (serviceId: string, establishmentId: string, onSuccess?: () => void) => Promise<void>;
}

const EMPTY_FORM: ServiceFormData = {
    serviceName: '',
    description: '',
    category: 0,
    tiers: [{ price: '', duration: '' }],
    addOns: [],
    imageFile: null,
    isActive: true,
};

export function useServiceSlice(): ServiceSliceState {
    const [services, setServices] = useState<SalonServiceResponse[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
    const [editingService, setEditingService] = useState<SalonServiceResponse | null>(null);
    const [form, setFormState] = useState<ServiceFormData>({ ...EMPTY_FORM });

    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const clearMessages = useCallback(() => {
        setError(null);
        setSuccessMessage(null);
    }, []);

    const setForm = useCallback((partial: Partial<ServiceFormData>) => {
        setFormState((prev) => ({ ...prev, ...partial }));
    }, []);

    // ── Load services ──
    const loadServices = useCallback(async (establishmentId: string) => {
        if (!establishmentId) {
            console.warn('[ServiceSlice] loadServices: no establishmentId, skipping.');
            return;
        }
        console.log('[ServiceSlice] loadServices: establishmentId =', establishmentId);
        setIsLoading(true);
        clearMessages();

        const result = await fetchMyServices(establishmentId);
        console.log('[ServiceSlice] loadServices: result success =', result.success, 'count =', result.data.length);

        if (result.success) {
            setServices(result.data);
            setTotalCount(result.totalCount);
        } else {
            setError(result.message);
        }
        setIsLoading(false);
    }, [clearMessages]);

    // ── Open create modal ──
    const openCreate = useCallback(() => {
        setFormState({ ...EMPTY_FORM });
        setEditingService(null);
        setModalMode('create');
        clearMessages();
    }, [clearMessages]);

    // ── Open edit modal ──
    const openEdit = useCallback((service: SalonServiceResponse) => {
        setEditingService(service);
        setFormState({
            serviceName: service.serviceName,
            description: service.description,
            category: CATEGORY_VALUE(service.category),
            tiers: service.price.map((p, i) => ({
                price: String(p),
                duration: String(service.durationMinutes[i] ?? ''),
            })),
            addOns: service.addOns.map((name, i) => ({
                name,
                price: String(service.addOnPrices[i] ?? 0),
            })),
            imageFile: null,
            isActive: service.isActive,
        });
        setModalMode('edit');
        clearMessages();
    }, [clearMessages]);

    // ── Close modal ──
    const closeModal = useCallback(() => {
        setModalMode(null);
        setEditingService(null);
        clearMessages();
    }, [clearMessages]);

    // ── Save (create or update) ──
    const handleSave = useCallback(async (establishmentId: string, onSuccess?: () => void) => {
        // Validate
        if (!form.serviceName.trim()) {
            setError('Service name is required.');
            return;
        }
        const hasValidTier = form.tiers.some(
            (t) => t.price.trim() && t.duration.trim(),
        );
        if (!hasValidTier) {
            setError('At least one pricing tier with price and duration is required.');
            return;
        }

        setIsSaving(true);
        clearMessages();

        let result;
        if (modalMode === 'edit' && editingService) {
            result = await editService(editingService.salonServiceId, form);
        } else {
            result = await createService(form);
        }

        console.log('[ServiceSlice] handleSave: result =', JSON.stringify(result));

        if (result.success) {
            setSuccessMessage(result.message || 'Saved successfully.');
            await loadServices(establishmentId);
            closeModal();
            if (onSuccess) onSuccess();
        } else {
            setError(result.message);
        }
        setIsSaving(false);
    }, [form, modalMode, editingService, clearMessages, loadServices, closeModal]);

    // ── Delete ──
    const handleDelete = useCallback(async (
        serviceId: string,
        establishmentId: string,
        onSuccess?: () => void,
    ) => {
        setIsDeleting(true);
        clearMessages();

        const result = await removeService(serviceId);
        console.log('[ServiceSlice] handleDelete: result =', JSON.stringify(result));

        if (result.success) {
            setSuccessMessage(result.message || 'Service deleted.');
            await loadServices(establishmentId);
            if (onSuccess) onSuccess();
        } else {
            setError(result.message);
        }
        setIsDeleting(false);
    }, [clearMessages, loadServices]);

    return {
        services,
        totalCount,
        isLoading,
        modalMode,
        editingService,
        form,
        setForm,
        isSaving,
        isDeleting,
        error,
        successMessage,
        clearMessages,
        loadServices,
        openCreate,
        openEdit,
        closeModal,
        handleSave,
        handleDelete,
    };
}

// ─────────────────────────────────────────────────────────────
// Helper: map category string → int value
// ─────────────────────────────────────────────────────────────

const CATEGORY_MAP: Record<string, number> = {
    swedish: 0,
    'deep tissue': 1,
    'hot stone': 2,
    aromatherapy: 3,
    reflexology: 4,
    shiatsu: 5,
    thai: 6,
    sports: 7,
    prenatal: 8,
    other: 9,
};

function CATEGORY_VALUE(category: string): number {
    const num = parseInt(category, 10);
    if (!isNaN(num)) return num;
    return CATEGORY_MAP[category.toLowerCase()] ?? 9;
}
