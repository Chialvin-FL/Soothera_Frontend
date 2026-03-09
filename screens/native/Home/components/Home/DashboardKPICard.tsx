import React from 'react';
import { View, ViewStyle } from 'react-native';
import { Text } from '@/components/Text';
import { Ionicons } from '@expo/vector-icons';
import { RisingItem } from '@/components/native/RisingItem';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface DashboardKPICardProps {
    title: string;
    value: string | number;
    icon: keyof typeof Ionicons.glyphMap;
    iconColor: string;
    iconBgColor: string;
    delay?: number;
    style?: ViewStyle;
}

export const DashboardKPICard = ({
    title,
    value,
    icon,
    iconColor,
    iconBgColor,
    delay = 200,
    style,
}: DashboardKPICardProps) => {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    return (
        <View
            className="w-[48%] bg-white dark:bg-[#1c1c1e] rounded-2xl p-4 mb-4"
            style={[{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.05,
                shadowRadius: 10,
                elevation: 2
            }, style]}
        >
            <RisingItem delay={delay} offset={10}>
                <View className="flex-row items-center mb-3">
                    <View
                        className="w-8 h-8 rounded-full items-center justify-center mr-2"
                        style={{ backgroundColor: iconBgColor }}
                    >
                        <Ionicons name={icon} size={16} color={iconColor} />
                    </View>
                    <Text className="text-xs font-medium text-gray-500 dark:text-gray-400" numberOfLines={1}>{title}</Text>
                </View>
                <Text className="text-2xl font-bold text-[#1c1c1e] dark:text-white">{value}</Text>
            </RisingItem>
        </View>
    );
};
