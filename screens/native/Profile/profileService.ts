import { changePassword as apiChangePassword, logout as apiLogout } from '@/api/endpoints/apiAuth';
import { updateUser as apiUpdateUser, getUsers as apiGetUsers } from '@/api/endpoints/apiUser';
import type { ApiError, UpdateUserRequest, UserDto } from '@/api/types';
import { getStoredToken } from '@/api/axiosClient';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export interface ProfileActionResponse {
    success: boolean;
    message: string;
}

export interface ProfileDataResponse extends ProfileActionResponse {
    data: UserDto | null;
}

// ─────────────────────────────────────────────────────────────
// Profile Actions
// ─────────────────────────────────────────────────────────────

export async function performChangePassword(
    newPassword: string
): Promise<ProfileActionResponse> {
    try {
        const token = await getStoredToken();
        const response = await apiChangePassword({ 
            newPassword, 
            firebaseToken: token || '' 
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

/**
 * Updates basic user profile information.
 */
export async function performUpdateProfile(
    uid: string,
    payload: UpdateUserRequest
): Promise<ProfileActionResponse> {
    try {
        const response = await apiUpdateUser(uid, payload);
        if (!response.success) {
            return { success: false, message: response.message };
        }
        return { success: true, message: response.message || 'Profile updated successfully.' };
    } catch (err) {
        const apiErr = err as ApiError;
        return {
            success: false,
            message: apiErr?.message ?? 'Failed to update profile.',
        };
    }
}


/**
 * Fetches the user profile data from the API filtered by UID.
 */
export async function performFetchProfile(uid: string): Promise<ProfileDataResponse> {
    try {
        const response = await apiGetUsers({ uid });
        const responseData = response.data as any;
        const user = Array.isArray(responseData?.items)
            ? responseData.items[0]
            : Array.isArray(responseData)
                ? responseData[0]
                : responseData;

        if (!response.success || !user) {
            return { 
                success: false, 
                message: response.message || 'User not found.', 
                data: null 
            };
        }
        return { 
            success: true, 
            message: 'Profile fetched successfully.', 
            data: user,
        };
    } catch (err) {
        const apiErr = err as ApiError;
        return {
            success: false,
            message: apiErr?.message ?? 'Failed to fetch profile.',
            data: null,
        };
    }
}
