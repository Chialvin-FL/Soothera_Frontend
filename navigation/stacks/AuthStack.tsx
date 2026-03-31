import React, { useState } from 'react';
import LoginScreen from '../../screens/native/Login/LoginScreen.native';
import RegisterScreen from '../../screens/native/Register/RegisterScreen.native';
import RoleSelectionScreen from '../../screens/native/Register/RoleSelectionScreen.native';
import type { SessionState } from '../hooks/useSessionLoader';
import { useRegisterSlice } from '../../screens/native/Register/registerSlice';
import { UserRole } from '@/api/types';

interface AuthStackProps {
    session: SessionState;
}

export function AuthStack({ session }: AuthStackProps) {
    const { authScreen, setAuthScreen, setPendingUserData, pendingUserData, login } = session;
    const registerSlice = useRegisterSlice();

    // Success/error modal state for registration result
    const [registerResult, setRegisterResult] = useState<{
        success: boolean;
        message: string;
    } | null>(null);

    return (
        <>
            {authScreen === 'login' && (
                <LoginScreen
                    onLogin={async (role, name, email) => {
                        await login(role, name, email);
                    }}
                    onNavigateToRegister={() => setAuthScreen('register')}
                    onForgotPassword={() => console.log('Forgot password')}
                />
            )}
            {authScreen === 'register' && (
                <RegisterScreen
                    onRegister={(email, password) => {
                        setPendingUserData({ email, password });
                        setAuthScreen('role-selection');
                    }}
                    onNavigateToLogin={() => setAuthScreen('login')}
                />
            )}
            {authScreen === 'role-selection' && (
                <RoleSelectionScreen
                    isLoading={registerSlice.isLoading}
                    error={registerSlice.error}
                    onSelectRole={async (role: 'customer' | 'admin') => {
                        if (!pendingUserData) return;

                        // Set email/password from pending data into the slice
                        registerSlice.setEmail(pendingUserData.email);
                        registerSlice.setPassword(pendingUserData.password);

                        // Map UI role string to backend enum
                        const roleEnum = role === 'admin' ? UserRole.Admin : UserRole.Customer;

                        await registerSlice.handleRegister(roleEnum, (message) => {
                            // Registration successful — go back to login
                            setPendingUserData(null);
                            setAuthScreen('login');
                            // The user now needs to verify their email before logging in
                        });
                    }}
                />
            )}
        </>
    );
}
