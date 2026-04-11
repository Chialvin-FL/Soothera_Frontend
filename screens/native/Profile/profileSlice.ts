import { useState } from 'react';
import { performChangePassword, performApiLogout, performUpdateProfile, performFetchProfile } from './profileService';
import { UpdateUserRequest, UserDto } from '@/api/types';

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
    handleUpdateProfile: (
        uid: string,
        payload: UpdateUserRequest,
        onSuccess?: () => void
    ) => Promise<void>;
    /**
     * Updates email by routing through updateUser (PUT /api/User/update-user/:uid).
     * Pass email + firebaseToken in the UpdateUserRequest payload.
     */
    handleUpdateEmail: (
        newEmail: string,
        firebaseToken: string,
        onSuccess?: () => void
    ) => Promise<void>;
    handleFetchProfile: (
        uid: string
    ) => Promise<UserDto | null>;
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

    const handleUpdateProfile = async (
        uid: string,
        payload: UpdateUserRequest,
        onSuccess?: () => void
    ) => {
        setIsLoading(true);
        clearMessages();

        const result = await performUpdateProfile(uid, payload);

        if (result.success) {
            setSuccessMessage(result.message);
            if (onSuccess) onSuccess();
        } else {
            setError(result.message);
        }

        setIsLoading(false);
    };

    const handleUpdateEmail = async (
        newEmail: string,
        firebaseToken: string,
        onSuccess?: () => void
    ) => {
        // Email changes route through updateUser (PUT /api/User/update-user/:uid),
        // which accepts Email + FirebaseToken as [FromForm] fields on the backend.
        await handleUpdateProfile(
            '', // uid must be supplied by the caller via handleUpdateProfile if a uid is needed
            { email: newEmail, firebaseToken },
            onSuccess,
        );
    };

    const handleFetchProfile = async (uid: string): Promise<UserDto | null> => {
        setIsLoading(true);
        clearMessages();

        const result = await performFetchProfile(uid);

        if (result.success) {
            setIsLoading(false);
            return result.data;
        } else {
            setError(result.message);
            setIsLoading(false);
            return null;
        }
    };

    return {
        isLoading,
        error,
        successMessage,
        clearMessages,
        handleChangePassword,
        handleLogout,
        handleUpdateProfile,
        handleUpdateEmail,
        handleFetchProfile,
    };
}
