import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Image, Platform } from 'react-native';
import { Text } from '@/components/Text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '@/components/native/Header';
import { RisingItem } from '@/components/native/RisingItem';
import { adminDashboardMockData } from './configs/adminDummyData';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

interface HomeScreenAdminProps {
    onNavigateToProfile?: () => void;
    onNavigateNotifications?: () => void;
    useNavigatorOverlays?: boolean;
}

export default function HomeScreenAdmin({
    onNavigateToProfile,
    onNavigateNotifications,
}: HomeScreenAdminProps) {
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const data = adminDashboardMockData;
    const isDark = colorScheme === 'dark';

    const [activeRevenueTab, setActiveRevenueTab] = useState<'Monthly' | 'Weekly'>('Monthly');
    const [activeListTab, setActiveListTab] = useState<'Monthly' | 'Weekly' | 'Today'>('Monthly');

    // KPIS
    const totalBookings = data.analytics.online + data.analytics.walkIn;
    const totalClients = 263; // Static to match feel, or could compute from unique users
    const staffCount = data.staff.length;
    const totalRevenue = data.financial.monthlySales;

    // Mock bar chart data (e.g. months)
    const chartData = [
        { label: 'Jan', value: 30 },
        { label: 'Feb', value: 50 },
        { label: 'Mar', value: 80, isHighlighted: true },
        { label: 'Apr', value: 40 },
        { label: 'May', value: 20 },
        { label: 'Jun', value: 60 },
        { label: 'Jul', value: 55 },
    ];
    const maxChartValue = Math.max(...chartData.map(d => d.value));

    return (
        <View className="flex-1 bg-white dark:bg-[#121212]">
            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingBottom: insets.bottom + 100,
                }}
            >
                <RisingItem delay={0}>
                    <Header
                        onProfilePress={onNavigateToProfile}
                        onNotificationPress={onNavigateNotifications}
                    />
                </RisingItem>

                {/* Home Title */}
                <RisingItem delay={100}>
                    <View className="px-5 mt-2 mb-6">
                        <Text className="text-3xl font-extrabold text-[#1c1c1e] dark:text-white">Home</Text>
                    </View>
                </RisingItem>

                {/* KPI Cards Grid */}
                <RisingItem delay={200}>
                    <View className="px-5 mb-8 flex-row flex-wrap justify-between">
                        {/* Card 1: Total Bookings */}
                        <View className="w-[48%] bg-white dark:bg-[#1c1c1e] rounded-2xl p-4 mb-4"
                            style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 }}>
                            <View className="flex-row items-center mb-3">
                                <View className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 items-center justify-center mr-2">
                                    <Ionicons name="calendar-outline" size={16} color={colors.primary} />
                                </View>
                                <Text className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Bookings</Text>
                            </View>
                            <Text className="text-2xl font-bold text-[#1c1c1e] dark:text-white">{totalBookings}</Text>
                        </View>

                        {/* Card 2: Total Clients */}
                        <View className="w-[48%] bg-white dark:bg-[#1c1c1e] rounded-2xl p-4 mb-4"
                            style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 }}>
                            <View className="flex-row items-center mb-3">
                                <View className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 items-center justify-center mr-2">
                                    <Ionicons name="people-outline" size={16} color={colors.primary} />
                                </View>
                                <Text className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Clients</Text>
                            </View>
                            <Text className="text-2xl font-bold text-[#1c1c1e] dark:text-white">{totalClients}</Text>
                        </View>

                        {/* Card 3: Staff Count */}
                        <View className="w-[48%] bg-white dark:bg-[#1c1c1e] rounded-2xl p-4"
                            style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 }}>
                            <View className="flex-row items-center mb-3">
                                <View className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 items-center justify-center mr-2">
                                    <Ionicons name="briefcase-outline" size={16} color={colors.primary} />
                                </View>
                                <Text className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Staff</Text>
                            </View>
                            <Text className="text-2xl font-bold text-[#1c1c1e] dark:text-white">{staffCount}</Text>
                        </View>

                        {/* Card 4: Total Revenue */}
                        <View className="w-[48%] bg-white dark:bg-[#1c1c1e] rounded-2xl p-4"
                            style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 }}>
                            <View className="flex-row items-center mb-3">
                                <View className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 items-center justify-center mr-2">
                                    <Ionicons name="cash-outline" size={16} color={colors.primary} />
                                </View>
                                <Text className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Revenue</Text>
                            </View>
                            <Text className="text-xl font-bold text-[#1c1c1e] dark:text-white">₱{totalRevenue.toLocaleString()}</Text>
                        </View>
                    </View>
                </RisingItem>

                {/* Orders (Revenue Chart) Section */}
                <RisingItem delay={300}>
                    <View className="px-5 mb-8">
                        <View className="bg-white dark:bg-[#1c1c1e] rounded-3xl p-5"
                            style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.06, shadowRadius: 20, elevation: 4 }}>

                            <View className="flex-row justify-between items-center mb-6">
                                <Text className="text-xl font-bold text-[#1c1c1e] dark:text-white">Revenue</Text>

                                {/* Simulated dropdown */}
                                <TouchableOpacity
                                    className="flex-row items-center bg-[#f8f9fa] dark:bg-gray-800 px-3 py-1.5 rounded-full border border-gray-100 dark:border-gray-700"
                                    onPress={() => setActiveRevenueTab(activeRevenueTab === 'Monthly' ? 'Weekly' : 'Monthly')}
                                >
                                    <Text className="text-xs font-medium text-gray-700 dark:text-gray-300 mr-1">{activeRevenueTab}</Text>
                                    <Ionicons name="chevron-down" size={12} color={isDark ? '#9ca3af' : '#4b5563'} />
                                </TouchableOpacity>
                            </View>

                            <View className="mb-8">
                                <Text className="text-3xl font-extrabold text-[#1c1c1e] dark:text-white mb-1">₱{data.financial.monthlySales.toLocaleString()}</Text>
                                <Text className="text-sm font-medium text-gray-400">Total Revenue</Text>
                            </View>

                            {/* Custom Bar Chart */}
                            <View className="h-40 flex-row items-end justify-between relative mt-4">
                                {/* Horizontal grid line */}
                                <View className="absolute w-full top-0 border-t border-dashed border-gray-200 dark:border-gray-800" />
                                <View className="absolute w-full top-1/2 border-t border-dashed border-gray-200 dark:border-gray-800" />
                                <View className="absolute w-full bottom-0 border-t border-solid border-gray-200 dark:border-gray-800" />

                                {/* Y-axis labels (optional, simplifying to match design closely) */}
                                <View className="absolute -left-2 h-full justify-between py-1">
                                    <Text className="text-[10px] text-gray-400">100k</Text>
                                    <Text className="text-[10px] text-gray-400">50k</Text>
                                    <Text className="text-[10px] text-gray-400">0k</Text>
                                </View>

                                {/* Bars */}
                                <View className="flex-row items-end justify-between flex-1 pl-8 pb-1">
                                    {chartData.map((item, index) => {
                                        const heightPercentage = (item.value / maxChartValue) * 100;
                                        return (
                                            <View key={index} className="items-center w-8">
                                                <View
                                                    className={`w-6 rounded-t-md ${item.isHighlighted ? 'bg-primary' : 'bg-primary-100 dark:bg-primary-900/40'}`}
                                                    style={{ height: `${heightPercentage}%` }}
                                                />
                                            </View>
                                        );
                                    })}
                                </View>
                            </View>

                            {/* X-axis labels */}
                            <View className="flex-row justify-between pl-8 mt-3">
                                {chartData.map((item, index) => (
                                    <Text key={index} className={`text-[10px] font-medium w-8 text-center ${item.isHighlighted ? 'text-[#1c1c1e] dark:text-white font-bold' : 'text-gray-400'}`}>
                                        {item.label}
                                    </Text>
                                ))}
                            </View>
                        </View>
                    </View>
                </RisingItem>

                {/* Orders / Recent Bookings List */}
                <RisingItem delay={400}>
                    <View className="px-5 mb-8">
                        <View className="flex-row justify-between items-center mb-5">
                            <Text className="text-xl font-bold text-[#1c1c1e] dark:text-white">Recent Top Spenders</Text>

                            <TouchableOpacity
                                className="flex-row items-center bg-[#f8f9fa] dark:bg-gray-800 px-3 py-1.5 rounded-full border border-gray-100 dark:border-gray-700"
                                onPress={() => setActiveListTab(activeListTab === 'Monthly' ? 'Weekly' : 'Monthly')}
                            >
                                <Text className="text-xs font-medium text-gray-700 dark:text-gray-300 mr-1">{activeListTab}</Text>
                                <Ionicons name="chevron-down" size={12} color={isDark ? '#9ca3af' : '#4b5563'} />
                            </TouchableOpacity>
                        </View>

                        <View className="bg-white dark:bg-[#1c1c1e] rounded-3xl p-5"
                            style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.06, shadowRadius: 20, elevation: 4 }}>
                            {data.financial.topSpenders.map((user, index) => (
                                <View key={user.id} className={`flex-row items-center justify-between py-3 ${index !== data.financial.topSpenders.length - 1 ? 'border-b border-gray-100 dark:border-gray-800' : ''}`}>
                                    <View className="flex-row items-center flex-1">
                                        {user.avatar ? (
                                            <Image source={{ uri: user.avatar }} className="w-12 h-12 rounded-full mr-4" />
                                        ) : (
                                            <View className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 mr-4 items-center justify-center">
                                                <Ionicons name="person" size={20} color="#888" />
                                            </View>
                                        )}
                                        <View>
                                            <Text className="text-base font-bold text-[#1c1c1e] dark:text-white mb-0.5">{user.name}</Text>
                                            <Text className="text-xs text-gray-400">Mar 24th, 2024</Text>
                                        </View>
                                    </View>

                                    <View className="items-end justify-center">
                                        <Text className="text-sm font-bold text-[#1c1c1e] dark:text-white mb-2">+ ₱{user.amountSpent.toLocaleString()}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                </RisingItem>

            </ScrollView>
        </View>
    );
}
