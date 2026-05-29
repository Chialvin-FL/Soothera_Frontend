import { login as apiLogin, forgotPassword as apiForgotPassword } from '@/api/endpoints/apiAuth';
import { clearStoredToken } from '@/api/axiosClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { LoginResponse, ApiError, SalonEstablishment } from '@/api/types';
import { viewSalons } from '@/api/endpoints/apiSalonEstablishment';

// ─────────────────────────────────────────────────────────────
// Storage keys
// ─────────────────────────────────────────────────────────────

const USER_DATA_KEY = 'soothera_user_data';
const TOKEN_EXPIRY_KEY = 'soothera_token_expiry';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export interface StoredUserData {
    uid: string;
    email: string;
    firstName: string;
    lastName: string;
    role: number;
    profilePicture: string | null;
    createdAt: string;
    /** Only populated for therapists (role 2) */
    establishmentId?: string | null;
}

export interface LoginResult {
    success: true;
    user: StoredUserData;
}

export interface LoginError {
    success: false;
    message: string;
}

// ─────────────────────────────────────────────────────────────
// Login
// ─────────────────────────────────────────────────────────────

/**
 * Authenticates the user, persists token + user data + expiry.
 * The token itself is stored by `apiAuth.login` → `setStoredToken`.
 */
    export async function performLogin(
    email: string,
    password: string
): Promise<LoginResult | LoginError> {
    try {
        const response = await apiLogin({ email, password });

        if (!response.success || !response.user) {
            return { success: false, message: response.message };
        }

        const { user } = response;

        // Build the user object to persist
        const userData: StoredUserData = {
            uid: user.uid,
            email: user.email,
            firstName: user.firstName ?? '',
            lastName: user.lastName ?? '',
            role: user.role ?? 3,
            profilePicture: user.profilePicture ?? null,
            createdAt: user.createdAt?.toString() ?? '',
            establishmentId: user.establishmentId ?? null,
        };

        // Fail-proof check for Salon Owner (role === 1, i.e., Admin)
        if (userData.role === 1 && !userData.establishmentId) {
            console.log('[LoginService] performLogin: Salon Owner logged in but establishmentId not detected. Fetching...');
            try {
                const establishmentResponse = await viewSalons(undefined, userData.uid);
                if (establishmentResponse.success && establishmentResponse.data) {
                    const all = Array.isArray(establishmentResponse.data)
                        ? (establishmentResponse.data as SalonEstablishment[])
                        : [establishmentResponse.data as SalonEstablishment];
                    const paginatedData = establishmentResponse.data as any;
                    const items: SalonEstablishment[] = paginatedData?.items ?? all;

                    const mine = items.find((s) => s.uid === userData.uid) ?? null;
                    if (mine) {
                        console.log('[LoginService] performLogin: Found owned establishment:', mine.id);
                        userData.establishmentId = mine.id;
                    }
                }
            } catch (err) {
                console.warn('[LoginService] performLogin: Failed to fetch establishment for owner:', err);
            }
        }

        // Persist user data
        await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));

        // Persist token expiry (assume 1 hr for Firebase ID tokens)
        const expiryTimestamp = Date.now() + (3600 * 1000);
        await AsyncStorage.setItem(TOKEN_EXPIRY_KEY, expiryTimestamp.toString());

        return { success: true, user: userData };
    } catch (err) {
        const apiErr = err as any;
        const raw = apiErr?.rawError || apiErr || {};
        const errMsg = apiErr?.message || raw.message || 'An unexpected error occurred.';
        const details = [
            `Msg: ${errMsg}`,
            `Code: ${raw.code || 'N/A'}`,
            `Status: ${raw.status || 'N/A'}`,
            `URL: ${raw.url || 'N/A'}`,
            `BaseURL: ${raw.baseURL || 'N/A'}`
        ].join('\n');
        
        return {
            success: false,
            message: `Login Failed Debug Info:\n${details}`,
        };
    }
}

// ─────────────────────────────────────────────────────────────
// Forgot Password
// ─────────────────────────────────────────────────────────────

export async function performForgotPassword(
    email: string
): Promise<{ success: boolean; message: string }> {
    try {
        const response = await apiForgotPassword({ email });
        return { success: response.success, message: response.message };
    } catch (err) {
        const apiErr = err as ApiError;
        return {
            success: false,
            message: apiErr?.message ?? 'Failed to send password reset email.',
        };
    }
}

// ─────────────────────────────────────────────────────────────
// Session Restoration
// ─────────────────────────────────────────────────────────────

/**
 * Loads stored user data and checks if the token is still valid.
 * Returns null if no session or token is expired.
 */
export async function loadStoredSession(): Promise<StoredUserData | null> {
    try {
        const [userJson, expiryStr, token] = await Promise.all([
            AsyncStorage.getItem(USER_DATA_KEY),
            AsyncStorage.getItem(TOKEN_EXPIRY_KEY),
            AsyncStorage.getItem('soothera_auth_token'),
        ]);

        if (!userJson || !token) {
            console.log('[LoginService] loadStoredSession: missing user data or auth token.');
            return null;
        }

        // Check token expiry
        if (expiryStr) {
            const expiry = parseInt(expiryStr, 10);
            if (Date.now() >= expiry) {
                // Token expired — clean up
                await performLogout();
                return null;
            }
        }

        const storedUser = JSON.parse(userJson) as StoredUserData;

        // Fail-proof check for Salon Owner (role === 1, i.e., Admin)
        if (storedUser.role === 1 && !storedUser.establishmentId) {
            console.log('[LoginService] loadStoredSession: Salon Owner logged in but establishmentId not detected. Fetching...');
            try {
                const establishmentResponse = await viewSalons(undefined, storedUser.uid);
                if (establishmentResponse.success && establishmentResponse.data) {
                    const all = Array.isArray(establishmentResponse.data)
                        ? (establishmentResponse.data as SalonEstablishment[])
                        : [establishmentResponse.data as SalonEstablishment];
                    const paginatedData = establishmentResponse.data as any;
                    const items: SalonEstablishment[] = paginatedData?.items ?? all;

                    const mine = items.find((s) => s.uid === storedUser.uid) ?? null;
                    if (mine) {
                        console.log('[LoginService] loadStoredSession: Found owned establishment:', mine.id);
                        storedUser.establishmentId = mine.id;
                        // Persist updated user data in background
                        await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(storedUser));
                    }
                }
            } catch (err) {
                console.warn('[LoginService] loadStoredSession: Failed to fetch establishment for owner:', err);
            }
        }

        return storedUser;
    } catch {
        return null;
    }
}

/**
 * Returns milliseconds until the token expires.
 * Returns 0 if already expired or no expiry is stored.
 */
export async function getTokenRemainingMs(): Promise<number> {
    try {
        const expiryStr = await AsyncStorage.getItem(TOKEN_EXPIRY_KEY);
        if (!expiryStr) return 0;
        const remaining = parseInt(expiryStr, 10) - Date.now();
        return Math.max(0, remaining);
    } catch {
        return 0;
    }
}

/**
 * Partially updates the stored user data.
 */
export async function updateStoredUserData(updates: Partial<StoredUserData>): Promise<void> {
    try {
        const userJson = await AsyncStorage.getItem(USER_DATA_KEY);
        if (!userJson) return;

        const currentData = JSON.parse(userJson) as StoredUserData;
        const newData = { ...currentData, ...updates };

        await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(newData));
    } catch (error) {
        console.error('[LoginService] Failed to update stored user data:', error);
    }
}

// ─────────────────────────────────────────────────────────────
// Logout
// ─────────────────────────────────────────────────────────────

/**
 * Clears all stored auth data (token, user, expiry).
 */
export async function performLogout(): Promise<void> {
    await Promise.all([
        clearStoredToken(),
        AsyncStorage.removeItem(USER_DATA_KEY),
        AsyncStorage.removeItem(TOKEN_EXPIRY_KEY),
    ]);
}
