import React, { useState } from 'react';
import { View, TextInput, Pressable, ActivityIndicator, Image } from 'react-native';
import { Text } from '@/components/Text';
import { Ionicons } from '@expo/vector-icons';
import { useLoginSlice } from '../native/Login/loginSlice';
import { performLogout } from '../native/Login/loginService';
import SuccessModalWeb from '../../components/web/SuccessModal.web';

interface LoginScreenWebProps {
    onLoginSuccess: () => void;
    onBack: () => void;
    session: any;
}

export default function LoginScreenWeb({ onLoginSuccess, onBack, session }: LoginScreenWebProps) {
    const {
        email,
        password,
        isLoading,
        error: sliceError,
        setEmail,
        setPassword,
        handleLogin,
        clearError
    } = useLoginSlice();

    const [localError, setLocalError] = useState<string | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);

    const onAdminLoginPress = async () => {
        setLocalError(null);
        clearError();

        await handleLogin(async (user) => {
            // Role enforcement: Only superadmin (0) allowed
            if (user.role !== 0) {
                setLocalError('Unauthorized: Only Super Administrators can access the web dashboard.');
                await performLogout();
                return;
            }

            // Update global session
            await session.login(user.role, user.name, user.email);
            
            // Show success feedback
            setShowSuccess(true);
        });
    };

    const handleSuccessClose = () => {
        setShowSuccess(false);
        onLoginSuccess();
    };

    const displayError = localError || sliceError;

    return (
        <View className="flex-1 bg-slate-50 items-center justify-center p-6">
            <View className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-slate-200 border border-slate-100 overflow-hidden">
                {/* Header branding */}
                <View className="bg-primary pt-12 pb-8 items-center">
                    <Image
                        source={require("../../assets/soothera-logo.png")}
                        style={{ width: 280, height: 100, tintColor: 'white' }}
                        resizeMode="contain"
                    />
                </View>

                <View className="p-10">
                    <Text className="text-2xl font-bold text-slate-900 mb-2">Welcome Back</Text>
                    <Text className="text-slate-500 mb-8">Please enter your superadmin credentials to continue.</Text>

                    {displayError && (
                        <View className="bg-red-50 border border-red-100 p-4 rounded-2xl mb-6 flex-row items-center">
                            <Ionicons name="alert-circle" size={20} color="#ef4444" />
                            <Text className="text-red-600 text-sm ml-3 flex-1">{displayError}</Text>
                        </View>
                    )}

                    <View className="space-y-5">
                        <View>
                            <Text className="text-sm font-semibold text-slate-700 mb-2 ml-1">Email Address</Text>
                            <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 focus-within:border-primary focus-within:bg-white transition-all">
                                <Ionicons name="mail-outline" size={20} color="#94a3b8" />
                                <TextInput
                                    className="flex-1 h-14 ml-3 text-slate-900"
                                    placeholder="admin@soothera.com"
                                    value={email}
                                    onChangeText={setEmail}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                />
                            </View>
                        </View>

                        <View>
                            <Text className="text-sm font-semibold text-slate-700 mb-2 ml-1">Password</Text>
                            <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 focus-within:border-primary focus-within:bg-white transition-all">
                                <Ionicons name="lock-closed-outline" size={20} color="#94a3b8" />
                                <TextInput
                                    className="flex-1 h-14 ml-3 text-slate-900"
                                    placeholder="••••••••"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry
                                />
                            </View>
                        </View>

                        <Pressable
                            onPress={onAdminLoginPress}
                            disabled={isLoading}
                            className={`h-14 rounded-2xl items-center justify-center shadow-lg shadow-primary/20 mt-4 ${isLoading ? 'bg-primary/70' : 'bg-primary active:scale-[0.98]'
                                } transition-transform`}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="text-white text-lg">Sign In</Text>
                            )}
                        </Pressable>
                    </View>

                    <View className="mt-8 items-center">
                        <Pressable
                            onPress={onBack}
                            className="flex-row items-center"
                        >
                            <Ionicons name="arrow-back" size={18} color="#64748b" />
                            <Text className="text-slate-500 font-medium ml-2">Back to main site</Text>
                        </Pressable>
                    </View>
                </View>

                <View className="bg-slate-50 py-4 items-center border-t border-slate-100">
                    <Text className="text-slate-400 text-xs">Secure Admin Environment • © 2026 Soothera</Text>
                </View>
            </View>

            <SuccessModalWeb
                visible={showSuccess}
                title="Login Successful"
                message="Welcome back to the Soothera Admin Portal."
                onClose={handleSuccessClose}
            />
        </View>
    );
}
