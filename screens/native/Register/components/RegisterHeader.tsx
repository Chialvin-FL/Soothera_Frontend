import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/Text';
import { ColorValue } from 'react-native';

interface RegisterHeaderProps {
    textColor: ColorValue;
}

export const RegisterHeader = ({ textColor }: RegisterHeaderProps) => {
    return (
        <View className="items-center mb-10">
            <Text className="text-3xl font-bold mb-2" style={{ color: textColor }}>
                Create Account
            </Text>
            <Text className="text-center text-gray-500 dark:text-gray-400">
                Fill your information below or register with your social account
            </Text>
        </View>
    );
};
