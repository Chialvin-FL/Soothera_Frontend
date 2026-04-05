import { useState } from 'react';
import { performChangePassword, performApiLogout } from './profileService';

// ─────────────────────────────────────────────────────────────
// Profile Slice — manages profile related state + async actions
// ─────────────────────────────────────────────────────────────

export interface ProfileSliceState {
    isLoading: boolean;
    error: string | null;
    successMessage: string | null;
    clearMessages: () => void;
    handleChangePassword: (
        currentPass: string,
        newPass: string,
        confirmPass: string,
        onSuccess?: () => void
    ) => Promise<void>;
    handleLogout: (onSuccess: () => void) => Promise<void>;
}

export function useProfileSlice(): ProfileSliceState {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const clearMessages = () => {
        setError(null);
        setSuccessMessage(null);
    };

    const handleChangePassword = async (
        currentPass: string,
        newPass: string,
        confirmPass: string,
        onSuccess?: () => void
    ) => {
        if (!currentPass || !newPass || !confirmPass) {
            setError('Please fill in all fields.');
            return;
        }

        if (newPass !== confirmPass) {
            setError('New passwords do not match.');
            return;
        }

        setIsLoading(true);
        clearMessages();

        const result = await performChangePassword(newPass, currentPass);

        if (result.success) {
            setSuccessMessage(result.message);
            if (onSuccess) onSuccess();
        } else {
            setError(result.message);
        }

        setIsLoading(false);
    };

    const handleLogout = async (onSuccess: () => void) => {
        setIsLoading(true);
        clearMessages();

        await performApiLogout();
        
        setIsLoading(false);
        onSuccess();
    };

    return {
        isLoading,
        error,
        successMessage,
        clearMessages,
        handleChangePassword,
        handleLogout,
    };
}
