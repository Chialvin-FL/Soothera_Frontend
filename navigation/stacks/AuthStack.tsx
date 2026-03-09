import React from 'react';
import LoginScreen from '../../screens/native/Login/LoginScreen.native';
import RegisterScreen from '../../screens/native/Register/RegisterScreen.native';
import RoleSelectionScreen from '../../screens/native/Register/RoleSelectionScreen.native';
import type { SessionState } from '../hooks/useSessionLoader';

interface AuthStackProps {
    session: SessionState;
}

export function AuthStack({ session }: AuthStackProps) {
    const { authScreen, pendingUserData, setAuthScreen, setPendingUserData, login } = session;

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
                    onRegister={(email) => {
                        setPendingUserData({ email });
                        setAuthScreen('role-selection');
                    }}
                    onNavigateToLogin={() => setAuthScreen('login')}
                />
            )}
            {authScreen === 'role-selection' && (
                <RoleSelectionScreen
                    onSelectRole={async (role) => {
                        if (!pendingUserData) return;
                        await login(role, '', pendingUserData.email);
                        setPendingUserData(null);
                        setAuthScreen('login'); // Reset for next time
                    }}
                />
            )}
        </>
    );
}
