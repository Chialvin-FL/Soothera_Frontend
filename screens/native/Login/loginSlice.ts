import { useState } from 'react';
import { performLogin, performForgotPassword, type LoginError } from './loginService';

// ─────────────────────────────────────────────────────────────
// Login Slice — manages login form state + async actions
// ─────────────────────────────────────────────────────────────

export interface LoginSliceState {
    email: string;
    password: string;
    isLoading: boolean;
    error: string | null;
    setEmail: (email: string) => void;
    setPassword: (password: string) => void;
    clearError: () => void;
    handleLogin: (
        onSuccess: (user: {
            uid: string;
            email: string;
            role: number;
            name: string;
        }) => Promise<void>
    ) => Promise<void>;
    handleForgotPassword: (
        email: string,
        onResult: (success: boolean, message: string) => void
    ) => Promise<void>;
}

export function useLoginSlice(): LoginSliceState {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const clearError = () => setError(null);

    const handleLogin = async (
        onSuccess: (user: {
            uid: string;
            email: string;
            role: number;
            name: string;
        }) => Promise<void>
    ) => {
        if (!email || !password) {
            setError('Please enter both email and password.');
            return;
        }

        setIsLoading(true);
        setError(null);

        const result = await performLogin(email, password);

        if (result.success) {
            const { user } = result;
            const displayName = [user.firstName, user.lastName]
                .filter(Boolean)
                .join(' ') || user.email;

            await onSuccess({
                uid: user.uid,
                email: user.email,
                role: user.role,
                name: displayName,
            });
        } else {
            setError(result.message);
        }

        setIsLoading(false);
    };

    const handleForgotPassword = async (
        forgotEmail: string,
        onResult: (success: boolean, message: string) => void
    ) => {
        if (!forgotEmail) {
            onResult(false, 'Please enter your email address.');
            return;
        }

        setIsLoading(true);
        const result = await performForgotPassword(forgotEmail);
        setIsLoading(false);
        onResult(result.success, result.message);
    };

    return {
        email,
        password,
        isLoading,
        error,
        setEmail,
        setPassword,
        clearError,
        handleLogin,
        handleForgotPassword,
    };
}
