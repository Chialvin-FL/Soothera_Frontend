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
    console.log('[Registration Debug] performRegister calling apiRegister with:', { email, role });
    try {
        const response = await apiRegister({ email, password, role });
        console.log('[Registration Debug] apiRegister response:', response);

        if (!response.success) {
            console.error('[Registration Debug] apiRegister failed:', response.message);
            return { success: false, message: response.message };
        }

        return {
            success: true,
            message: response.message,
        };
    } catch (err) {
        const apiErr = err as ApiError;
        console.error('[Registration Debug] Exception in performRegister:', apiErr);
        return {
            success: false,
            message: apiErr?.message ?? 'An unexpected error occurred during registration.',
        };
    }
}
