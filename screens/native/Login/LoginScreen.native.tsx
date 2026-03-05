import React, { useState } from 'react';
import {
    View,
    TouchableOpacity,
    TextInput,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
} from 'react-native';
import { Text } from '@/components/Text';
import { Ionicons } from '@expo/vector-icons';
import { Colors, primaryColor } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DUMMY_ACCOUNTS, UserRole } from '@/env';
import { SuccessModal } from '@/components/native/SuccessModal';

interface LoginScreenProps {
    onLogin: (role: UserRole, name: string) => void;
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

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errorModal, setErrorModal] = useState({ visible: false, title: '', message: '' });

    const handleLogin = () => {
        if (!email || !password) {
            setErrorModal({
                visible: true,
                title: 'Missing Information',
                message: 'Please enter both email and password.',
            });
            return;
        }

        const user = DUMMY_ACCOUNTS.find(
            (acc) => acc.email.toLowerCase() === email.toLowerCase() && acc.password === password
        );

        if (user) {
            onLogin(user.role, user.name);
        } else {
            setErrorModal({
                visible: true,
                title: 'Login Failed',
                message: 'The email or password you entered is incorrect.',
            });
        }
    };

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
                <View className="items-center mb-10">
                    <Image
                        source={require('../../../assets/soothera-logo.png')}
                        className="w-64 h-64"
                        resizeMode="contain" style={{ marginBottom: -50 }}
                    />
                    <Text className="text-3xl font-bold mb-2" style={{ color: colors.text }}>
                        Sign In
                    </Text>
                    <Text className="text-center text-gray-500 dark:text-gray-400">
                        Hi! Welcome back, you've been missed
                    </Text>
                </View>

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
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
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
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                            autoCapitalize="none"
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
                    className="w-full py-4 rounded-3xl items-center justify-center mb-8"
                    style={{ backgroundColor: primaryColor }}
                    activeOpacity={0.8}
                >
                    <Text className="text-white text-base font-bold">Sign In</Text>
                </TouchableOpacity>

                {/* Social Sign In */}
                <View className="items-center mb-8">
                    <View className="flex-row items-center mb-6">
                        <View className="flex-1 h-[1px] bg-gray-200 dark:bg-gray-800" />
                        <Text className="mx-4 text-gray-400 text-xs">Or sign in with</Text>
                        <View className="flex-1 h-[1px] bg-gray-200 dark:bg-gray-800" />
                    </View>

                    <TouchableOpacity
                        className="w-14 h-14 rounded-full border items-center justify-center"
                        style={{ borderColor: isDark ? '#3a3a3a' : '#E5E7EB' }}
                    >
                        <Ionicons name="logo-google" size={24} color={isDark ? '#fff' : '#444'} />
                    </TouchableOpacity>
                </View>

                {/* Redirect to Register */}
                <View className="flex-row justify-center items-center mt-auto">
                    <Text className="text-gray-500 dark:text-gray-400 text-sm">
                        Don't have an account?{' '}
                    </Text>
                    <TouchableOpacity onPress={onNavigateToRegister}>
                        <Text
                            className="text-sm font-bold"
                            style={{ color: primaryColor, textDecorationLine: 'underline' }}
                        >
                            Sign Up
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <SuccessModal
                visible={errorModal.visible}
                title={errorModal.title}
                message={errorModal.message}
                variant="error"
                onClose={() => setErrorModal({ ...errorModal, visible: false })}
            />
        </KeyboardAvoidingView>
    );
}
