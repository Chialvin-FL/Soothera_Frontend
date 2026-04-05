import { changePassword as apiChangePassword, logout as apiLogout } from '@/api/endpoints/apiAuth';
import type { ApiError } from '@/api/types';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export interface ProfileActionResponse {
    success: boolean;
    message: string;
}

// ─────────────────────────────────────────────────────────────
// Profile Actions
// ─────────────────────────────────────────────────────────────

/**
 * Changes the user's password using the provided new password and current password (as fallback for firebase token).
 */
export async function performChangePassword(
    newPassword: string,
    currentPassword: string
): Promise<ProfileActionResponse> {
    try {
        const response = await apiChangePassword({ 
            newPassword, 
            firebaseToken: currentPassword 
        });

        if (!response.success) {
            return { success: false, message: response.message };
        }

        return { success: true, message: response.message || 'Password changed successfully.' };
    } catch (err) {
        const apiErr = err as ApiError;
        return {
            success: false,
            message: apiErr?.message ?? 'Failed to change password.',
        };
    }
}

/**
 * Calls the API logout endpoint.
 * Storage clearing is delegated to the session loader's onLogout property to guarantee session consistency.
 */
export async function performApiLogout(): Promise<ProfileActionResponse> {
    try {
        const response = await apiLogout();
        return { success: response.success, message: response.message || 'Logged out successfully.' };
    } catch (err) {
        const apiErr = err as ApiError;
        return {
            success: false,
            message: apiErr?.message ?? 'Failed to call logout API.',
        };
    }
}
