import React from 'react';
import {
    View,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { Text } from '@/components/Text';
import { Ionicons } from '@expo/vector-icons';
import { Colors, primaryColor } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SuccessModal } from '@/components/native/SuccessModal';
import { LoginHeader } from './components/LoginHeader';
import { SocialLogin } from './components/SocialLogin';
import { LoginFooter } from './components/LoginFooter';
import { useLoginSlice } from './loginSlice';
import { useState } from 'react';

interface LoginScreenProps {
    onLogin: (role: number, name: string, email: string) => void;
    onNavigateToRegister: () => void;
    onForgotPassword?: () => void;
}

export default function LoginScreen({
    onLogin,
    onNavigateToRegister,
    onForgotPassword,
}: LoginScreenProps) {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const insets = useSafeAreaInsets();
    const isDark = colorScheme === 'dark';

    const loginSlice = useLoginSlice();
    const [showPassword, setShowPassword] = useState(false);
    const [modal, setModal] = useState<{
        visible: boolean;
        title: string;
        message: string;
        variant: 'success' | 'error';
    }>({ visible: false, title: '', message: '', variant: 'error' });

    const handleLogin = async () => {
        await loginSlice.handleLogin(async (user) => {
            await onLogin(user.role, user.name, user.email);
        });
    };

    // Show error from slice as modal
    React.useEffect(() => {
        if (loginSlice.error) {
            setModal({
                visible: true,
                title: 'Login Failed',
                message: loginSlice.error,
                variant: 'error',
            });
            loginSlice.clearError();
        }
    }, [loginSlice.error]);

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-white dark:bg-[#151718]"
        >
            <ScrollView
                contentContainerStyle={{
                    flexGrow: 1,
                    paddingHorizontal: 24,
                    paddingTop: insets.top + 5,
                    paddingBottom: insets.bottom + 40,
                }}
                showsVerticalScrollIndicator={false}
            >
                {/* Header Section */}
                <LoginHeader textColor={colors.text} />

                {/* Form Section */}
                <View className="mb-6">
                    <Text className="text-sm font-semibold mb-2" style={{ color: colors.text }}>
                        Email
                    </Text>
                    <View
                        className="flex-row items-center border rounded-2xl px-4 py-1 mb-4"
                        style={{
                            borderColor: isDark ? '#3a3a3a' : '#E5E7EB',
                            backgroundColor: isDark ? '#1f1f1f' : '#F9FAFB',
                        }}
                    >
                        <TextInput
                            className="flex-1 h-12 text-base"
                            style={{ color: colors.text }}
                            placeholder="example@gmail.com"
                            placeholderTextColor={isDark ? '#555' : '#9CA3AF'}
                            value={loginSlice.email}
                            onChangeText={loginSlice.setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            editable={!loginSlice.isLoading}
                        />
                    </View>

                    <Text className="text-sm font-semibold mb-2" style={{ color: colors.text }}>
                        Password
                    </Text>
                    <View
                        className="flex-row items-center border rounded-2xl px-4 py-1 mb-2"
                        style={{
                            borderColor: isDark ? '#3a3a3a' : '#E5E7EB',
                            backgroundColor: isDark ? '#1f1f1f' : '#F9FAFB',
                        }}
                    >
                        <TextInput
                            className="flex-1 h-12 text-base"
                            style={{ color: colors.text }}
                            placeholder="••••••••••••"
                            placeholderTextColor={isDark ? '#555' : '#9CA3AF'}
                            value={loginSlice.password}
                            onChangeText={loginSlice.setPassword}
                            secureTextEntry={!showPassword}
                            autoCapitalize="none"
                            editable={!loginSlice.isLoading}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                            <Ionicons
                                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                size={22}
                                color={isDark ? '#9CA3AF' : '#6B7280'}
                            />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity onPress={onForgotPassword} className="items-end">
                        <Text
                            className="text-sm font-medium"
                            style={{ color: primaryColor, textDecorationLine: 'underline' }}
                        >
                            Forgot Password?
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Sign In Button */}
                <TouchableOpacity
                    onPress={handleLogin}
                    disabled={loginSlice.isLoading}
                    className="w-full py-4 rounded-3xl items-center justify-center mb-8"
                    style={{
                        backgroundColor: primaryColor,
                        opacity: loginSlice.isLoading ? 0.7 : 1,
                    }}
                    activeOpacity={0.8}
                >
                    {loginSlice.isLoading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white text-base font-bold">Sign In</Text>
                    )}
                </TouchableOpacity>

                {/* Social Sign In */}
                <SocialLogin isDark={isDark} />

                {/* Redirect to Register */}
                <LoginFooter
                    onNavigateToRegister={onNavigateToRegister}
                    primaryColor={primaryColor}
                />
            </ScrollView>

            <SuccessModal
                visible={modal.visible}
                title={modal.title}
                message={modal.message}
                variant={modal.variant}
                onClose={() => setModal({ ...modal, visible: false })}
            />
        </KeyboardAvoidingView>
    );
}
