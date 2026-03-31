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
        onSuccess: (message: string) => void
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
        onSuccess: (message: string) => void
    ) => {
        if (!email || !password) {
            setError('Please fill in all fields.');
            return;
        }

        setIsLoading(true);
        setError(null);

        const result = await performRegister(email, password, role);

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
