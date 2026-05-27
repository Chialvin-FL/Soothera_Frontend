import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/Text';
import { Ionicons } from '@expo/vector-icons';
import { RisingItem } from '@/components/native/RisingItem';
import { useColorScheme } from '@/hooks/use-color-scheme';

export interface BarChartData {
    label: string;
    value: number;
    isHighlighted?: boolean;
}

interface DashboardBarChartProps {
    title: string;
    subtitle?: string;
    mainValue?: string | number;
    mainValueLabel?: string;
    data: BarChartData[];
    activeTabLabel?: string;
    onTabPress?: () => void;
    delay?: number;
    maxChartValue?: number;
    yAxisPrefix?: string;
    yAxisSuffix?: string;
}

export const DashboardBarChart = ({
    title,
    subtitle,
    mainValue,
    mainValueLabel,
    data,
    activeTabLabel,
    onTabPress,
    delay = 450,
    maxChartValue: customMaxValue,
    yAxisPrefix = '',
    yAxisSuffix = '',
}: DashboardBarChartProps) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const maxValue = customMaxValue || Math.max(...data.map(d => d.value), 1);

    return (
        <RisingItem delay={delay} fadeIn={false}>
            <View className="px-5 mb-8">
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
                        <View className="flex-row justify-between items-center mb-6">
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

                        {mainValue && (
                            <View className="mb-8">
                                <Text className="text-3xl font-extrabold text-[#1c1c1e] dark:text-white mb-1">{mainValue}</Text>
                                <Text className="text-sm font-medium text-gray-400">{mainValueLabel || 'Total'}</Text>
                            </View>
                        )}

                        <View className="mt-4">
                            <View className="h-40 flex-row items-end relative">
                                {/* Horizontal grid lines */}
                                <View className="absolute w-full top-0 left-8 right-0 border-t border-dashed border-gray-200 dark:border-gray-800" />
                                <View className="absolute w-full top-1/2 left-8 right-0 border-t border-dashed border-gray-200 dark:border-gray-800" />
                                <View className="absolute w-full bottom-0 left-8 right-0 border-t border-solid border-gray-200 dark:border-gray-800" />

                                {/* Y-axis labels */}
                                <View className="absolute -left-2 h-full justify-between py-0 z-10">
                                    <Text className="text-[10px] text-gray-400 leading-[10px]">{yAxisPrefix}{maxValue}{yAxisSuffix}</Text>
                                    <Text className="text-[10px] text-gray-400 leading-[10px]">{yAxisPrefix}{Math.round(maxValue / 2)}{yAxisSuffix}</Text>
                                    <Text className="text-[10px] text-gray-400 leading-[10px]">{yAxisPrefix}0{yAxisSuffix}</Text>
                                </View>

                                {/* Bars Container */}
                                <View className="flex-row items-end justify-between flex-1 pl-8 h-full">
                                    {data.map((item, index) => {
                                        const heightPercentage = Math.max((item.value / maxValue) * 100, 2); // Min 2% for visibility
                                        return (
                                            <View key={index} className="items-center flex-1 h-full justify-end">
                                                <View
                                                    className={`w-6 rounded-t-md ${item.isHighlighted ? 'bg-primary' : 'bg-primary-100 dark:bg-primary-900/40'}`}
                                                    style={{ height: `${heightPercentage}%` }}
                                                />
                                            </View>
                                        );
                                    })}
                                </View>
                            </View>

                            {/* X-axis labels below the baseline */}
                            <View className="flex-row items-start justify-between pl-8 mt-3">
                                {data.map((item, index) => (
                                    <View key={index} className="items-center flex-1">
                                        <Text className={`text-[10px] font-medium ${item.isHighlighted ? 'text-[#1c1c1e] dark:text-white font-bold' : 'text-gray-400'}`}>
                                            {item.label}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    </RisingItem>
                </View>
            </View>
        </RisingItem>
    );
};
