import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { Text } from '@/components/Text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '@/components/native/Header';
import { RisingItem } from '@/components/native/RisingItem';
import { adminDashboardMockData } from './configs/adminDummyData';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { DashboardKPICard } from './components/Home/DashboardKPICard';
import { DashboardBarChart } from './components/Home/DashboardBarChart';
import { DashboardListItem, DashboardListSection } from './components/Home/DashboardListItem';

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
    const data = adminDashboardMockData;
    const isDark = colorScheme === 'dark';

    const [activeRevenueTab, setActiveRevenueTab] = useState<'Monthly' | 'Weekly'>('Monthly');
    const [activeListTab, setActiveListTab] = useState<'Monthly' | 'Weekly' | 'Today'>('Monthly');

    // KPIS
    const totalBookings = data.analytics.online + data.analytics.walkIn;
    const totalClients = 263; // Static to match feel
    const staffCount = data.staff.length;
    const totalRevenue = data.financial.monthlySales;

    // Mock bar chart data
    const chartData = [
        { label: 'Jan', value: 30 },
        { label: 'Feb', value: 50 },
        { label: 'Mar', value: 80, isHighlighted: true },
        { label: 'Apr', value: 40 },
        { label: 'May', value: 20 },
        { label: 'Jun', value: 60 },
        { label: 'Jul', value: 55 },
    ];

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
                        profilePic={userProfilePic}
                        onProfilePress={onNavigateToProfile}
                        onNotificationPress={onNavigateNotifications}
                    />
                </RisingItem>

                {/* KPI Cards Grid */}
                <View className="px-5 mt-4 mb-4 flex-row flex-wrap justify-between">
                    <DashboardKPICard
                        title="Total Bookings"
                        value={totalBookings}
                        icon="calendar-outline"
                        iconColor={colors.primary}
                        iconBgColor={isDark ? 'rgba(76, 122, 108, 0.2)' : '#E6F0ED'}
                        delay={200}
                    />
                    <DashboardKPICard
                        title="Total Clients"
                        value={totalClients}
                        icon="people-outline"
                        iconColor="#3B82F6"
                        iconBgColor={isDark ? 'rgba(59, 130, 246, 0.2)' : '#DBEAFE'}
                        delay={250}
                    />
                    <DashboardKPICard
                        title="Total Staff"
                        value={staffCount}
                        icon="briefcase-outline"
                        iconColor="#F59E0B"
                        iconBgColor={isDark ? 'rgba(245, 158, 11, 0.2)' : '#FEF3C7'}
                        delay={300}
                    />
                    <DashboardKPICard
                        title="Total Revenue"
                        value={`₱${totalRevenue.toLocaleString()}`}
                        icon="cash-outline"
                        iconColor="#10B981"
                        iconBgColor={isDark ? 'rgba(16, 185, 129, 0.2)' : '#D1FAE5'}
                        delay={350}
                    />
                </View>

                {/* Revenue Chart Section */}
                <DashboardBarChart
                    title="Revenue"
                    mainValue={`₱${data.financial.monthlySales.toLocaleString()}`}
                    mainValueLabel="Total Revenue"
                    data={chartData}
                    activeTabLabel={activeRevenueTab}
                    onTabPress={() => setActiveRevenueTab(activeRevenueTab === 'Monthly' ? 'Weekly' : 'Monthly')}
                    delay={400}
                    yAxisSuffix="k"
                />

                {/* Recent Top Spenders List */}
                <DashboardListSection
                    title="Recent Top Spenders"
                    activeTabLabel={activeListTab}
                    onTabPress={() => setActiveListTab(activeListTab === 'Monthly' ? 'Weekly' : 'Monthly')}
                    delay={500}
                >
                    {data.financial.topSpenders.map((user, index) => (
                        <DashboardListItem
                            key={user.id}
                            title={user.name}
                            subtitle="Mar 24th, 2024"
                            value={`+ ₱${user.amountSpent.toLocaleString()}`}
                            avatar={user.avatar}
                            isLast={index === data.financial.topSpenders.length - 1}
                        />
                    ))}
                </DashboardListSection>

            </ScrollView>
        </View>
    );
}
