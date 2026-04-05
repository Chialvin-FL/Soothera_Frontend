import React, { useState } from 'react';
import LoginScreen from '../../screens/native/Login/LoginScreen.native';
import RegisterScreen from '../../screens/native/Register/RegisterScreen.native';
import RoleSelectionScreen from '../../screens/native/Register/RoleSelectionScreen.native';
import type { SessionState } from '../hooks/useSessionLoader';
import { useRegisterSlice } from '../../screens/native/Register/registerSlice';
import { UserRole } from '@/api/types';
import { SuccessModal } from '@/components/native/SuccessModal';

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
                    initialEmail={pendingUserData?.email}
                    initialPassword={pendingUserData?.password}
                    onRegister={(email, password) => {
                        console.log('[Registration Debug] AuthStack onRegister received:', { email, password });
                        setPendingUserData({ email, password });
                        setAuthScreen('role-selection');
                        console.log('[Registration Debug] Transitioning to role-selection');
                    }}
                    onNavigateToLogin={() => setAuthScreen('login')}
                />
            )}
            {authScreen === 'role-selection' && (
                <RoleSelectionScreen
                    isLoading={registerSlice.isLoading}
                    error={registerSlice.error}
                    clearError={registerSlice.clearError}
                    onBack={() => setAuthScreen('register')}
                    onSelectRole={async (role: 'customer' | 'admin') => {
                        console.log('[Registration Debug] AuthStack onSelectRole selected:', role);
                        if (!pendingUserData) {
                            console.warn('[Registration Debug] pendingUserData is null in role-selection!');
                            return;
                        }

                        // Set email/password from pending data into the slice
                        registerSlice.setEmail(pendingUserData.email);
                        registerSlice.setPassword(pendingUserData.password);

                        // Map UI role string to backend enum
                        const roleEnum = role === 'admin' ? UserRole.Admin : UserRole.Customer;

                        console.log('[Registration Debug] calling registerSlice.handleRegister with role:', roleEnum);
                        await registerSlice.handleRegister(
                            roleEnum, 
                            (message) => {
                                console.log('[Registration Debug] Registration successful message:', message);
                                // Show success modal instead of immediately redirecting
                                setRegisterResult({ success: true, message });
                                setPendingUserData(null);
                            },
                            pendingUserData.email,
                            pendingUserData.password
                        );
                    }}
                />
            )}
            
            <SuccessModal
                visible={registerResult !== null}
                title="Registration Successful"
                message={registerResult?.message ?? ''}
                variant="success"
                onClose={() => {
                    setRegisterResult(null);
                    setAuthScreen('login');
                }}
            />
        </>
    );
}
