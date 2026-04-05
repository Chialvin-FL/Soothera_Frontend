import { useState } from 'react';
import { performRegister } from './registerService';
import { UserRole } from '@/api/types';

// ─────────────────────────────────────────────────────────────
// Register Slice — manages registration form state + async actions
// ─────────────────────────────────────────────────────────────

export interface RegisterSliceState {
    email: string;
    password: string;
    isLoading: boolean;
    error: string | null;
    setEmail: (email: string) => void;
    setPassword: (password: string) => void;
    clearError: () => void;
    handleRegister: (
        role: UserRole,
        onSuccess: (message: string) => void,
        overrideEmail?: string,
        overridePassword?: string
    ) => Promise<void>;
}

export function useRegisterSlice(): RegisterSliceState {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const clearError = () => setError(null);

    const handleRegister = async (
        role: UserRole,
        onSuccess: (message: string) => void,
        overrideEmail?: string,
        overridePassword?: string
    ) => {
        const currentEmail = overrideEmail ?? email;
        const currentPassword = overridePassword ?? password;

        console.log('[Registration Debug] registerSlice.handleRegister called with role:', role, 'and current email:', currentEmail);
        if (!currentEmail || !currentPassword) {
            console.warn('[Registration Debug] handleRegister aborted: missing email or password');
            setError('Please fill in all fields.');
            return;
        }

        setIsLoading(true);
        setError(null);

        console.log('[Registration Debug] calling performRegister');
        const result = await performRegister(currentEmail, currentPassword, role);
        console.log('[Registration Debug] performRegister result:', result);

        if (result.success) {
            onSuccess(result.message);
        } else {
            setError(result.message);
        }

        setIsLoading(false);
    };

    return {
        email,
        password,
        isLoading,
        error,
        setEmail,
        setPassword,
        clearError,
        handleRegister,
    };
}
