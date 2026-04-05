import { register as apiRegister } from '@/api/endpoints/apiAuth';
import type { ApiError } from '@/api/types';
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
