import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/Text';
import { Ionicons } from '@expo/vector-icons';

interface SocialRegisterProps {
    isDark: boolean;
}

export const SocialRegister = ({ isDark }: SocialRegisterProps) => {
    return (
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
    );
};
