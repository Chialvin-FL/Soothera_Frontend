import { register as apiRegister } from '@/api/endpoints/apiAuth';
import type { ApiError } from '@/api/types';
import { UserRole } from '@/api/types';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export interface RegisterResult {
    success: true;
    message: string;
}

export interface RegisterError {
    success: false;
    message: string;
}

// ─────────────────────────────────────────────────────────────
// Register
// ─────────────────────────────────────────────────────────────

/**
 * Registers a new user with the given credentials and role.
 * The backend creates a Firebase Auth user + Firestore User doc.
 */
export async function performRegister(
    email: string,
    password: string,
    role: UserRole
): Promise<RegisterResult | RegisterError> {
    try {
        const response = await apiRegister({ email, password, role });

        if (!response.success) {
            return { success: false, message: response.message };
        }

        return {
            success: true,
            message: response.message,
        };
    } catch (err) {
        const apiErr = err as ApiError;
        return {
            success: false,
            message: apiErr?.message ?? 'An unexpected error occurred during registration.',
        };
    }
}
