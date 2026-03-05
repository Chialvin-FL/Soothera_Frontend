import React, { useState } from 'react';
import {
    View,
    TouchableOpacity,
    TextInput,
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

interface RegisterScreenProps {
    onRegister: (name: string, email: string) => void;
    onNavigateToLogin: () => void;
}

export default function RegisterScreen({
    onRegister,
    onNavigateToLogin,
}: RegisterScreenProps) {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const insets = useSafeAreaInsets();
    const isDark = colorScheme === 'dark';

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [errorModal, setErrorModal] = useState({ visible: false, title: '', message: '' });

    const handleRegister = () => {
        if (!name || !email || !password) {
            setErrorModal({
                visible: true,
                title: 'Missing Information',
                message: 'Please fill in all fields to create your account.',
            });
            return;
        }

        if (!agreeTerms) {
            setErrorModal({
                visible: true,
                title: 'Terms & Conditions',
                message: 'Please agree to the Terms & Conditions to proceed.',
            });
            return;
        }

        onRegister(name, email);
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
                    paddingTop: insets.top + 60,
                    paddingBottom: insets.bottom + 40,
                }}
                showsVerticalScrollIndicator={false}
            >
                {/* Header Section */}
                <View className="items-center mb-10">
                    <Text className="text-3xl font-bold mb-2" style={{ color: colors.text }}>
                        Create Account
                    </Text>
                    <Text className="text-center text-gray-500 dark:text-gray-400">
                        Fill your information below or register with your social account
                    </Text>
                </View>

                {/* Form Section */}
                <View className="mb-6">
                    <Text className="text-sm font-semibold mb-2" style={{ color: colors.text }}>
                        Name
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
                            placeholder="Esther Howard"
                            placeholderTextColor={isDark ? '#555' : '#9CA3AF'}
                            value={name}
                            onChangeText={setName}
                            autoCapitalize="words"
                        />
                    </View>

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
                        className="flex-row items-center border rounded-2xl px-4 py-1 mb-4"
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

                    {/* Terms & Conditions */}
                    <TouchableOpacity
                        className="flex-row items-center mb-6"
                        onPress={() => setAgreeTerms(!agreeTerms)}
                        activeOpacity={0.7}
                    >
                        <View
                            className="w-5 h-5 rounded border mr-3 items-center justify-center"
                            style={{
                                borderColor: agreeTerms ? primaryColor : (isDark ? '#3a3a3a' : '#D1D5DB'),
                                backgroundColor: agreeTerms ? primaryColor : 'transparent',
                            }}
                        >
                            {agreeTerms && (
                                <Ionicons name="checkmark" size={14} color="white" />
                            )}
                        </View>
                        <Text className="text-sm" style={{ color: colors.text }}>
                            Agree with{' '}
                            <Text style={{ color: primaryColor, textDecorationLine: 'underline' }}>
                                Terms & Condition
                            </Text>
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Sign Up Button */}
                <TouchableOpacity
                    onPress={handleRegister}
                    className="w-full py-4 rounded-3xl items-center justify-center mb-8"
                    style={{ backgroundColor: primaryColor }}
                    activeOpacity={0.8}
                >
                    <Text className="text-white text-base font-bold">Sign Up</Text>
                </TouchableOpacity>

                {/* Social Sign Up */}
                <View className="items-center mb-8">
                    <View className="flex-row items-center mb-6">
                        <View className="flex-1 h-[1px] bg-gray-200 dark:bg-gray-800" />
                        <Text className="mx-4 text-gray-400 text-xs">Or sign up with</Text>
                        <View className="flex-1 h-[1px] bg-gray-200 dark:bg-gray-800" />
                    </View>

                    <TouchableOpacity
                        className="w-14 h-14 rounded-full border items-center justify-center"
                        style={{ borderColor: isDark ? '#3a3a3a' : '#E5E7EB' }}
                    >
                        <Ionicons name="logo-google" size={24} color={isDark ? '#fff' : '#444'} />
                    </TouchableOpacity>
                </View>

                {/* Redirect to Login */}
                <View className="flex-row justify-center items-center mt-auto">
                    <Text className="text-gray-500 dark:text-gray-400 text-sm">
                        Already have an account?{' '}
                    </Text>
                    <TouchableOpacity onPress={onNavigateToLogin}>
                        <Text
                            className="text-sm font-bold"
                            style={{ color: primaryColor, textDecorationLine: 'underline' }}
                        >
                            Sign In
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
