import { useState, useEffect, useRef, useCallback } from 'react';
import {
    loadStoredSession,
    getTokenRemainingMs,
    performLogout,
    type StoredUserData,
} from '@/screens/native/Login/loginService';
import { getRoleLabel } from '@/utils/roleHelpers';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

/** Role label used by the UI for tab/layout branching. */
export type UIRole = 'superadmin' | 'admin' | 'therapist' | 'customer';

export interface SessionState {
    isLoggedIn: boolean;
    isLoadingSession: boolean;
    userRole: UIRole | null;
    userName: string;
    userEmail: string;
    uid: string;
    userProfilePic: string | null;
    authScreen: 'login' | 'register' | 'role-selection';
    pendingUserData: { email: string; password: string } | null;
    setAuthScreen: (screen: 'login' | 'register' | 'role-selection') => void;
    setPendingUserData: (data: { email: string; password: string } | null) => void;
    login: (role: number, name: string, email: string, profilePic?: string | null) => Promise<void>;
    updateSessionData: (firstName: string, lastName: string, profilePic?: string | null) => void;
    logout: () => Promise<void>;
}

// ─────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────

export function useSessionLoader(): SessionState {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userRole, setUserRole] = useState<UIRole | null>(null);
    const [userName, setUserName] = useState<string>('');
    const [userEmail, setUserEmail] = useState<string>('');
    const [uid, setUid] = useState<string>('');
    const [userProfilePic, setUserProfilePic] = useState<string | null>(null);
    const [isLoadingSession, setIsLoadingSession] = useState(true);
    const [authScreen, setAuthScreen] = useState<'login' | 'register' | 'role-selection'>('login');
    const [pendingUserData, setPendingUserData] = useState<{ email: string; password: string } | null>(null);

    const expiryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // ── Logout handler ──
    const logout = useCallback(async () => {
        // Clear the expiry timer
        if (expiryTimerRef.current) {
            clearTimeout(expiryTimerRef.current);
            expiryTimerRef.current = null;
        }

        await performLogout();
        setIsLoggedIn(false);
        setUserRole(null);
        setUserName('');
        setUserEmail('');
        setUid('');
        setUserProfilePic(null);
        setAuthScreen('login');
    }, []);

    // ── Schedule auto-logout when JWT expires ──
    const scheduleAutoLogout = useCallback(async () => {
        if (expiryTimerRef.current) {
            clearTimeout(expiryTimerRef.current);
        }

        const remainingMs = await getTokenRemainingMs();
        if (remainingMs <= 0) {
            // Already expired
            await logout();
            return;
        }

        // Cap at 2^31 - 1 ms to avoid setTimeout overflow
        const safeDelay = Math.min(remainingMs, 2147483647);
        expiryTimerRef.current = setTimeout(async () => {
            console.log('[Session] JWT expired — auto-logging out');
            await logout();
        }, safeDelay);
    }, [logout]);

    // ── Load session on mount ──
    useEffect(() => {
        const loadSession = async () => {
            try {
                const storedUser = await loadStoredSession();
                if (storedUser) {
                    applyUserData(storedUser);
                    setIsLoggedIn(true);
                    await scheduleAutoLogout();
                }
            } catch (error) {
                console.error('Failed to load session:', error);
            } finally {
                setIsLoadingSession(false);
            }
        };
        loadSession();

        // Cleanup timer on unmount
        return () => {
            if (expiryTimerRef.current) {
                clearTimeout(expiryTimerRef.current);
            }
        };
    }, [scheduleAutoLogout]);

    // ── Apply user data to state ──
    const applyUserData = (user: StoredUserData) => {
        const displayName = [user.firstName, user.lastName]
            .filter(Boolean)
            .join(' ') || user.email;
        setUserName(displayName);
        setUserEmail(user.email);
        setUid(user.uid);
        setUserProfilePic(user.profilePicture);
        setUserRole(getRoleLabel(user.role) as UIRole);
    };

    // ── Login handler (called after API login succeeds) ──
    const login = async (role: number, name: string, email: string, profilePic?: string | null) => {
        setUserRole(getRoleLabel(role) as UIRole);
        setUserName(name);
        setUserEmail(email);
        // UID will be re-synced on next load since it's already in storage
        setIsLoggedIn(true);
        await scheduleAutoLogout();
    };

    // ── Update session handler (called after profile update success) ──
    const updateSessionData = (firstName: string, lastName: string, profilePic?: string | null) => {
        const displayName = [firstName, lastName]
            .filter(Boolean)
            .join(' ') || userEmail;
        setUserName(displayName);
        if (profilePic !== undefined) {
            setUserProfilePic(profilePic);
        }
    };

    return {
        isLoggedIn,
        isLoadingSession,
        userRole,
        userName,
        userEmail,
        uid,
        userProfilePic,
        authScreen,
        pendingUserData,
        setAuthScreen,
        setPendingUserData,
        login,
        updateSessionData,
        logout,
    };
}
