import { register as apiRegister } from '@/api/endpoints/apiAuth';
import { getUsers, deleteUser, updateUser } from '@/api/endpoints/apiUser';
import type { ApiError, UserDto } from '@/api/types';
import { UserRole } from '@/api/types';

export interface StaffRegisterResult {
    success: true;
    message: string;
}

export interface StaffRegisterError {
    success: false;
    message: string;
}

/**
 * Registers a new staff member (Role 2 - Therapist).
 */
export async function performStaffRegister(
    email: string,
    password: string
): Promise<StaffRegisterResult | StaffRegisterError> {
    console.log('[Staff Registration] Calling apiRegister with:', { email, role: UserRole.Therapist });
    try {
        const response = await apiRegister({ email, password, role: UserRole.Therapist });
        console.log('[Staff Registration] Response:', response);

        if (!response.success) {
            return { success: false, message: response.message };
        }

        return {
            success: true,
            message: response.message,
        };
    } catch (err) {
        const apiErr = err as ApiError;
        console.error('[Staff Registration] Exception:', apiErr);
        return {
            success: false,
            message: apiErr?.message ?? 'An unexpected error occurred during staff registration.',
        };
    }
}

export async function fetchTherapists() {
    try {
        const response = await getUsers({ role: UserRole.Therapist, pageSize: 100, page: 1 });
        if (response.success && response.data) {
            return { success: true, data: response.data.users };
        }
        return { success: false, message: response.message };
    } catch (err) {
        return { success: false, message: (err as ApiError)?.message || 'Failed to fetch therapists' };
    }
}

export async function removeTherapist(uid: string) {
    try {
        const response = await deleteUser(uid);
        if (response.success) {
            return { success: true };
        }
        return { success: false, message: response.message };
    } catch (err) {
        return { success: false, message: (err as ApiError)?.message || 'Failed to delete therapist' };
    }
}

export async function editTherapist(uid: string, email: string) {
    try {
        // We patch the username since UpdateUserRequest uses username, or we could just ignore it if backend doesn't support email updates easily. 
        // Best approach based on the DTO: update username or pass generic update
        const response = await updateUser(uid, { username: email });
        if (response.success) {
            return { success: true };
        }
        return { success: false, message: response.message };
    } catch (err) {
        return { success: false, message: (err as ApiError)?.message || 'Failed to update therapist' };
    }
}
