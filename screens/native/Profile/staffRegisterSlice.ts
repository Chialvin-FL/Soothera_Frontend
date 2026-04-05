import { useState, useCallback } from 'react';
import { performStaffRegister, fetchTherapists, removeTherapist, editTherapist } from './staffRegisterService';
import type { UserDto } from '@/api/types';

export interface StaffRegisterSliceState {
    email: string;
    isLoading: boolean;
    isFetching: boolean;
    error: string | null;
    therapists: UserDto[];
    setEmail: (email: string) => void;
    clearError: () => void;
    handleRegister: (onSuccess: (message: string) => void) => Promise<void>;
    handleUpdate: (uid: string, onSuccess: (message: string) => void) => Promise<void>;
    handleDelete: (uid: string, onSuccess: () => void) => Promise<void>;
    loadTherapists: () => Promise<void>;
    resetForm: () => void;
}

export function useStaffRegisterSlice(): StaffRegisterSliceState {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [therapists, setTherapists] = useState<UserDto[]>([]);

    const clearError = () => setError(null);

    const resetForm = () => {
        setEmail('');
        setError(null);
    };

    const loadTherapists = useCallback(async () => {
        setIsFetching(true);
        const result = await fetchTherapists();
        if (result.success && result.data) {
            setTherapists(result.data);
        } else {
            console.error(result.message);
        }
        setIsFetching(false);
    }, []);

    const handleDelete = async (uid: string, onSuccess: () => void) => {
        setIsLoading(true);
        const result = await removeTherapist(uid);
        if (result.success) {
            await loadTherapists();
            onSuccess();
        } else {
            setError(result.message || 'Failed to delete');
        }
        setIsLoading(false);
    };

    const handleUpdate = async (uid: string, onSuccess: (message: string) => void) => {
        if (!email) {
            setError('Please enter an email address or username.');
            return;
        }

        setIsLoading(true);
        setError(null);
        
        const result = await editTherapist(uid, email);
        if (result.success) {
            resetForm();
            await loadTherapists();
            onSuccess("Staff member updated successfully!");
        } else {
            setError(result.message || 'Failed to update');
        }
        setIsLoading(false);
    };

    const handleRegister = async (
        onSuccess: (message: string) => void
    ) => {
        if (!email) {
            setError('Please enter an email address.');
            return;
        }

        setIsLoading(true);
        setError(null);

        // Default password as requested
        const result = await performStaffRegister(email, 'String123!');

        if (result.success) {
            resetForm();
            await loadTherapists();
            onSuccess(result.message);
        } else {
            setError(result.message);
        }

        setIsLoading(false);
    };

    return {
        email,
        isLoading,
        isFetching,
        error,
        therapists,
        setEmail,
        clearError,
        handleRegister,
        handleUpdate,
        handleDelete,
        loadTherapists,
        resetForm
    };
}
