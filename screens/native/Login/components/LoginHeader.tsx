import React from 'react';
import { View, Image, ColorValue } from 'react-native';
import { Text } from '@/components/Text';

interface LoginHeaderProps {
    textColor: ColorValue;
}

export const LoginHeader = ({ textColor }: LoginHeaderProps) => {
    return (
        <View className="items-center mb-10">
            <Image
                source={require('../../../../assets/soothera-logo.png')}
                className="w-64 h-64"
                resizeMode="contain"
                style={{ marginBottom: -50 }}
            />
            <Text className="text-3xl font-bold mb-2" style={{ color: textColor }}>
                Sign In
            </Text>
            <Text className="text-center text-gray-500 dark:text-gray-400">
                Hi! Welcome back, you've been missed
            </Text>
        </View>
    );
};
