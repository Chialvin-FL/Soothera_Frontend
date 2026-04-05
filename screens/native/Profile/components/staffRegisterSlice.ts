import { useState } from 'react';
import { performStaffRegister } from './staffRegisterService';

export interface StaffRegisterSliceState {
    email: string;
    isLoading: boolean;
    error: string | null;
    setEmail: (email: string) => void;
    clearError: () => void;
    handleRegister: (onSuccess: (message: string) => void) => Promise<void>;
    resetForm: () => void;
}

export function useStaffRegisterSlice(): StaffRegisterSliceState {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const clearError = () => setError(null);

    const resetForm = () => {
        setEmail('');
        setError(null);
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
            onSuccess(result.message);
        } else {
            setError(result.message);
        }

        setIsLoading(false);
    };

    return {
        email,
        isLoading,
        error,
        setEmail,
        clearError,
        handleRegister,
        resetForm
    };
}
