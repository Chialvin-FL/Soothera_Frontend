import React, { ReactNode } from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
import { Text } from '@/components/Text';
import { Ionicons } from '@expo/vector-icons';
import { RisingItem } from '@/components/native/RisingItem';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface DashboardListItemProps {
    title: string;
    subtitle: string;
    value?: string | number;
    avatar?: string;
    icon?: keyof typeof Ionicons.glyphMap;
    isLast?: boolean;
    rightElement?: ReactNode;
    children?: ReactNode;
}

export const DashboardListItem = ({
    title,
    subtitle,
    value,
    avatar,
    icon,
    isLast,
    rightElement,
    children,
}: DashboardListItemProps) => {
    return (
        <View className={`py-3 ${!isLast ? 'border-b border-gray-100 dark:border-gray-800' : ''}`}>
            <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                    {avatar ? (
                        <Image source={{ uri: avatar }} className="w-12 h-12 rounded-full mr-4" />
                    ) : (
                        <View className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 mr-4 items-center justify-center">
                            <Ionicons name={icon || 'person'} size={20} color="#888" />
                        </View>
                    )}
                    <View className="flex-1 mr-2">
                        <Text className="text-base font-bold text-[#1c1c1e] dark:text-white mb-0.5" numberOfLines={1}>{title}</Text>
                        <Text className="text-xs text-gray-400">{subtitle}</Text>
                    </View>
                </View>

                <View className="items-end justify-center">
                    {rightElement ? rightElement : (
                        <Text className="text-sm font-bold text-[#1c1c1e] dark:text-white">{value}</Text>
                    )}
                </View>
            </View>
            {children && (
                <View className="mt-1">
                    {children}
                </View>
            )}
        </View>
    );
};

interface DashboardListSectionProps {
    title: string;
    activeTabLabel?: string;
    onTabPress?: () => void;
    children: ReactNode;
    delay?: number;
}

export const DashboardListSection = ({
    title,
    activeTabLabel,
    onTabPress,
    children,
    delay = 550,
}: DashboardListSectionProps) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    return (
        <RisingItem delay={delay} fadeIn={false}>
            <View className="px-5 mb-8">
                <View className="flex-row justify-between items-center mb-5">
                    <Text className="text-xl font-bold text-[#1c1c1e] dark:text-white">{title}</Text>

                    {activeTabLabel && (
                        <TouchableOpacity
                            className="flex-row items-center bg-[#f8f9fa] dark:bg-gray-800 px-3 py-1.5 rounded-full border border-gray-100 dark:border-gray-700"
                            onPress={onTabPress}
                        >
                            <Text className="text-xs font-medium text-gray-700 dark:text-gray-300 mr-1">{activeTabLabel}</Text>
                            <Ionicons name="chevron-down" size={12} color={isDark ? '#9ca3af' : '#4b5563'} />
                        </TouchableOpacity>
                    )}
                </View>

                <View
                    className="bg-white dark:bg-[#1c1c1e] rounded-3xl p-5"
                    style={{
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 8 },
                        shadowOpacity: 0.06,
                        shadowRadius: 20,
                        elevation: 4
                    }}
                >
                    <RisingItem delay={delay + 50} offset={12}>
                        {children}
                    </RisingItem>
                </View>
            </View>
        </RisingItem>
    );
};
