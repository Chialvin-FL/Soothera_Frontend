import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/Text';

interface LoginFooterProps {
    onNavigateToRegister: () => void;
    primaryColor: string;
}

export const LoginFooter = ({ onNavigateToRegister, primaryColor }: LoginFooterProps) => {
    return (
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
    );
};
