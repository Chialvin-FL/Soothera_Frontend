import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/Text';

interface RegisterFooterProps {
    onNavigateToLogin: () => void;
    primaryColor: string;
}

export const RegisterFooter = ({ onNavigateToLogin, primaryColor }: RegisterFooterProps) => {
    return (
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
    );
};
