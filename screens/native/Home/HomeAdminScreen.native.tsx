import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Text } from '@/components/Text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '@/components/native/Header';
import { RisingItem } from '@/components/native/RisingItem';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { DashboardKPICard } from './components/Home/DashboardKPICard';
import { DashboardBarChart } from './components/Home/DashboardBarChart';
import { DashboardListItem, DashboardListSection } from './components/Home/DashboardListItem';
import { getOwnerAnalytics } from '@/api/endpoints/apiSalonEstablishment';
import type { OwnerAnalytics } from '@/api/types';
import { Ionicons } from '@expo/vector-icons';

interface HomeScreenAdminProps {
    onNavigateToProfile?: () => void;
    onNavigateNotifications?: () => void;
    useNavigatorOverlays?: boolean;
    userProfilePic?: string | null;
}

export default function HomeScreenAdmin({
    onNavigateToProfile,
    onNavigateNotifications,
    userProfilePic,
}: HomeScreenAdminProps) {
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const isDark = colorScheme === 'dark';

    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [revenueAnalytics, setRevenueAnalytics] = useState<OwnerAnalytics | null>(null);
    const [topSpendersAnalytics, setTopSpendersAnalytics] = useState<OwnerAnalytics | null>(null);
    const [revenueFilter, setRevenueFilter] = useState<'monthly' | 'weekly'>('monthly');
    const [topSpendersFilter, setTopSpendersFilter] = useState<'monthly' | 'weekly'>('monthly');
    const [hasNoSalon, setHasNoSalon] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Initial load of both datasets
    useEffect(() => {
        const loadInitialData = async () => {
            setIsLoading(true);
            setErrorMessage(null);
            setHasNoSalon(false);
            try {
                const [revRes, spendRes] = await Promise.all([
                    getOwnerAnalytics(undefined, revenueFilter),
                    getOwnerAnalytics(undefined, topSpendersFilter)
                ]);
                if (revRes.success && revRes.data) {
                    setRevenueAnalytics(revRes.data);
                }
                if (spendRes.success && spendRes.data) {
                    setTopSpendersAnalytics(spendRes.data);
                }
            } catch (err: any) {
                console.error('[HomeScreenAdmin] Initial load error:', err);
                if (err?.statusCode === 404) {
                    setHasNoSalon(true);
                } else {
                    setErrorMessage(err?.message || 'An error occurred while loading analytics.');
                }
            } finally {
                setIsLoading(false);
            }
        };

        loadInitialData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Independent update for revenue stats
    useEffect(() => {
        if (isLoading) return;

        const updateRevenue = async () => {
            try {
                const response = await getOwnerAnalytics(undefined, revenueFilter);
                if (response.success && response.data) {
                    setRevenueAnalytics(response.data);
                }
            } catch (err: any) {
                console.error('[HomeScreenAdmin] Error updating revenue filter:', err);
            }
        };

        updateRevenue();
    }, [revenueFilter, isLoading]);

    // Independent update for top spenders
    useEffect(() => {
        if (isLoading) return;

        const updateTopSpenders = async () => {
            try {
                const response = await getOwnerAnalytics(undefined, topSpendersFilter);
                if (response.success && response.data) {
                    setTopSpendersAnalytics(response.data);
                }
            } catch (err: any) {
                console.error('[HomeScreenAdmin] Error updating top spenders filter:', err);
            }
        };

        updateTopSpenders();
    }, [topSpendersFilter, isLoading]);

    // Manual refresh handles both datasets
    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        setErrorMessage(null);
        try {
            const [revRes, spendRes] = await Promise.all([
                getOwnerAnalytics(undefined, revenueFilter),
                getOwnerAnalytics(undefined, topSpendersFilter)
            ]);
            if (revRes.success && revRes.data) {
                setRevenueAnalytics(revRes.data);
            }
            if (spendRes.success && spendRes.data) {
                setTopSpendersAnalytics(spendRes.data);
            }
        } catch (err: any) {
            console.error('[HomeScreenAdmin] Refresh error:', err);
            if (err?.statusCode === 404) {
                setHasNoSalon(true);
            } else {
                setErrorMessage(err?.message || 'An error occurred while loading analytics.');
            }
        } finally {
            setIsRefreshing(false);
        }
    }, [revenueFilter, topSpendersFilter]);

    if (isLoading && !isRefreshing) {
        return (
            <View className="flex-1 bg-white dark:bg-[#121212] justify-center items-center">
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (hasNoSalon) {
        return (
            <View className="flex-1 bg-white dark:bg-[#121212]">
                <RisingItem delay={0}>
                    <Header
                        profilePic={userProfilePic}
                        onProfilePress={onNavigateToProfile}
                        onNotificationPress={onNavigateNotifications}
                    />
                </RisingItem>
                <View className="flex-1 items-center justify-center px-8">
                    <View className="bg-gray-50 dark:bg-[#1c1c1e] rounded-3xl p-8 items-center border border-gray-100 dark:border-gray-800 w-full max-w-sm"
                        style={{
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 8 },
                            shadowOpacity: 0.06,
                            shadowRadius: 20,
                            elevation: 4
                        }}
                    >
                        <View className="w-16 h-16 rounded-full bg-[#E6F0ED] dark:bg-primary-900/20 items-center justify-center mb-6">
                            <Ionicons name="storefront-outline" size={32} color={colors.primary} />
                        </View>
                        <Text className="text-xl font-bold text-[#1c1c1e] dark:text-white mb-2 text-center">
                            Set Up Your Salon
                        </Text>
                        <Text className="text-sm text-gray-500 dark:text-gray-400 text-center mb-8 leading-5">
                            {"You haven't set up a salon establishment yet. Create your salon profile to start viewing booking and revenue analytics."}
                        </Text>
                        <TouchableOpacity
                            className="bg-primary px-6 py-3 rounded-full flex-row items-center justify-center w-full active:opacity-90"
                            onPress={onNavigateToProfile}
                        >
                            <Text className="text-white font-semibold mr-2">Configure Business</Text>
                            <Ionicons name="arrow-forward" size={16} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    }

    if (errorMessage) {
        return (
            <View className="flex-1 bg-white dark:bg-[#121212]">
                <RisingItem delay={0}>
                    <Header
                        profilePic={userProfilePic}
                        onProfilePress={onNavigateToProfile}
                        onNotificationPress={onNavigateNotifications}
                    />
                </RisingItem>
                <View className="flex-1 items-center justify-center px-8">
                    <View className="bg-red-50 dark:bg-red-950/20 rounded-3xl p-8 items-center border border-red-100 dark:border-red-900/30 w-full max-w-sm"
                        style={{
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 8 },
                            shadowOpacity: 0.06,
                            shadowRadius: 20,
                            elevation: 4
                        }}
                    >
                        <View className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/40 items-center justify-center mb-6">
                            <Ionicons name="alert-circle-outline" size={32} color="#EF4444" />
                        </View>
                        <Text className="text-xl font-bold text-red-800 dark:text-red-400 mb-2 text-center">
                            Failed to Load Analytics
                        </Text>
                        <Text className="text-sm text-red-600 dark:text-red-500 text-center mb-8 leading-5">
                            {errorMessage}
                        </Text>
                        <TouchableOpacity
                            className="bg-red-600 px-6 py-3 rounded-full flex-row items-center justify-center w-full active:opacity-90"
                            onPress={handleRefresh}
                        >
                            <Text className="text-white font-semibold mr-2">Retry</Text>
                            <Ionicons name="refresh" size={16} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    }

    const chartData = revenueAnalytics?.revenueChart.map((item, index, arr) => ({
        label: item.label,
        value: item.revenue,
        isHighlighted: index === arr.length - 1,
    })) ?? [];

    return (
        <View className="flex-1 bg-white dark:bg-[#121212]">
            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingBottom: insets.bottom + 100,
                }}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={handleRefresh}
                        colors={[colors.primary]}
                        tintColor={colors.primary}
                    />
                }
            >
                <RisingItem delay={0}>
                    <Header
                        profilePic={userProfilePic}
                        onProfilePress={onNavigateToProfile}
                        onNotificationPress={onNavigateNotifications}
                    />
                </RisingItem>

                {/* KPI Cards Grid */}
                <View className="px-5 mt-4 mb-4 flex-row flex-wrap justify-between">
                    <DashboardKPICard
                        title="Total Bookings"
                        value={revenueAnalytics?.totalBookings ?? 0}
                        icon="calendar-outline"
                        iconColor={colors.primary}
                        iconBgColor={isDark ? 'rgba(76, 122, 108, 0.2)' : '#E6F0ED'}
                        delay={200}
                    />
                    <DashboardKPICard
                        title="Total Clients"
                        value={revenueAnalytics?.totalClients ?? 0}
                        icon="people-outline"
                        iconColor="#3B82F6"
                        iconBgColor={isDark ? 'rgba(59, 130, 246, 0.2)' : '#DBEAFE'}
                        delay={250}
                    />
                    <DashboardKPICard
                        title="Total Staff"
                        value={revenueAnalytics?.totalStaff ?? 0}
                        icon="briefcase-outline"
                        iconColor="#F59E0B"
                        iconBgColor={isDark ? 'rgba(245, 158, 11, 0.2)' : '#FEF3C7'}
                        delay={300}
                    />
                    <DashboardKPICard
                        title="Total Revenue"
                        value={`₱${(revenueAnalytics?.totalRevenue ?? 0).toLocaleString()}`}
                        icon="cash-outline"
                        iconColor="#10B981"
                        iconBgColor={isDark ? 'rgba(16, 185, 129, 0.2)' : '#D1FAE5'}
                        delay={350}
                    />
                </View>

                {/* Revenue Chart Section */}
                <DashboardBarChart
                    title="Revenue"
                    mainValue={`₱${(revenueAnalytics?.totalRevenue ?? 0).toLocaleString()}`}
                    mainValueLabel="Total Revenue"
                    data={chartData}
                    activeTabLabel={revenueFilter === 'monthly' ? 'Monthly' : 'Weekly'}
                    onTabPress={() => setRevenueFilter(revenueFilter === 'monthly' ? 'weekly' : 'monthly')}
                    delay={400}
                />

                {/* Recent Top Spenders List */}
                <DashboardListSection
                    title="Recent Top Spenders"
                    activeTabLabel={topSpendersFilter === 'monthly' ? 'Monthly' : 'Weekly'}
                    onTabPress={() => setTopSpendersFilter(topSpendersFilter === 'monthly' ? 'weekly' : 'monthly')}
                    delay={500}
                >
                    {topSpendersAnalytics?.recentTopSpenders && topSpendersAnalytics.recentTopSpenders.length > 0 ? (
                        topSpendersAnalytics.recentTopSpenders.map((user, index, arr) => (
                            <DashboardListItem
                                key={user.customerId}
                                title={user.name}
                                subtitle={user.date}
                                value={`+ ₱${user.amount.toLocaleString()}`}
                                avatar={user.profilePicture || undefined}
                                isLast={index === arr.length - 1}
                            />
                        ))
                    ) : (
                        <View className="py-6 items-center justify-center">
                            <Text className="text-sm text-gray-400">No top spenders found for this period</Text>
                        </View>
                    )}
                </DashboardListSection>

            </ScrollView>
        </View>
    );
}
