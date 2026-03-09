import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, UserData, UserRole } from '@/env';

export interface SessionState {
    isLoggedIn: boolean;
    isLoadingSession: boolean;
    userRole: UserRole | null;
    userName: string;
    userEmail: string;
    authScreen: 'login' | 'register' | 'role-selection';
    pendingUserData: { email: string } | null;
    setAuthScreen: (screen: 'login' | 'register' | 'role-selection') => void;
    setPendingUserData: (data: { email: string } | null) => void;
    login: (role: UserRole, name: string, email: string) => Promise<void>;
    logout: () => Promise<void>;
}

export function useSessionLoader(): SessionState {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userRole, setUserRole] = useState<UserRole | null>(null);
    const [userName, setUserName] = useState<string>('');
    const [userEmail, setUserEmail] = useState<string>('');
    const [isLoadingSession, setIsLoadingSession] = useState(true);
    const [authScreen, setAuthScreen] = useState<'login' | 'register' | 'role-selection'>('login');
    const [pendingUserData, setPendingUserData] = useState<{ email: string } | null>(null);

    useEffect(() => {
        const loadSession = async () => {
            try {
                const storedData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
                if (storedData) {
                    const userData: UserData = JSON.parse(storedData);
                    setUserName(userData.name);
                    setUserEmail(userData.email);
                    setUserRole(userData.role);
                    setIsLoggedIn(true);
                }
            } catch (error) {
                console.error('Failed to load session:', error);
            } finally {
                setIsLoadingSession(false);
            }
        };
        loadSession();
    }, []);

    const login = async (role: UserRole, name: string, email: string) => {
        const userData: UserData = { role, name, email };
        try {
            await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
        } catch (e) {
            console.error('Save session error:', e);
        }
        setUserRole(role);
        setUserName(name);
        setUserEmail(email);
        setIsLoggedIn(true);
    };

    const logout = async () => {
        try {
            await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
        } catch (e) {
            console.error('Clear session error:', e);
        }
        setIsLoggedIn(false);
        setUserRole(null);
        setUserName('');
        setUserEmail('');
        setAuthScreen('login');
    };

    return {
        isLoggedIn,
        isLoadingSession,
        userRole,
        userName,
        userEmail,
        authScreen,
        pendingUserData,
        setAuthScreen,
        setPendingUserData,
        login,
        logout,
    };
}
