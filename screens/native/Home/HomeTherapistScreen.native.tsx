import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { Text } from '@/components/Text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '@/components/native/Header';
import { RisingItem } from '@/components/native/RisingItem';
import { therapistPerformanceMockData } from './configs/therapistDummyData';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { DashboardKPICard } from './components/Home/DashboardKPICard';
import { DashboardBarChart } from './components/Home/DashboardBarChart';
import { DashboardListItem, DashboardListSection } from './components/Home/DashboardListItem';

interface HomeTherapistScreenProps {
    onNavigateToProfile?: () => void;
    onNavigateNotifications?: () => void;
    useNavigatorOverlays?: boolean;
}

export default function HomeTherapistScreen({
    onNavigateToProfile,
    onNavigateNotifications,
}: HomeTherapistScreenProps) {
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const data = therapistPerformanceMockData;
    const isDark = colorScheme === 'dark';

    const [activeTab, setActiveTab] = useState<'Weekly' | 'Monthly'>('Weekly');

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

                {/* Performance Title */}
                <RisingItem delay={100}>
                    <View className="px-5 mt-2 mb-6">
                        <Text className="text-3xl font-extrabold text-[#1c1c1e] dark:text-white">Performance Reports</Text>
                        <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">Track your progress and reviews</Text>
                    </View>
                </RisingItem>

                {/* KPI Cards Grid */}
                <View className="px-5 mb-4 flex-row flex-wrap justify-between">
                    <DashboardKPICard
                        title="Total Sessions"
                        value={data.totalSessions}
                        icon="calendar-outline"
                        iconColor={colors.primary}
                        iconBgColor={isDark ? 'rgba(var(--primary-rgb), 0.3)' : '#F3E8FF'}
                        delay={200}
                    />
                    <DashboardKPICard
                        title="Average Rating"
                        value={data.averageRating}
                        icon="star"
                        iconColor="#EAB308"
                        iconBgColor={isDark ? 'rgba(234, 179, 8, 0.2)' : '#FEF9C3'}
                        delay={250}
                    />
                    <DashboardKPICard
                        title="Completion"
                        value={`${data.completionRate}%`}
                        icon="checkmark-done-outline"
                        iconColor="#22C55E"
                        iconBgColor={isDark ? 'rgba(34, 197, 94, 0.2)' : '#DCFCE7'}
                        delay={300}
                    />
                    <DashboardKPICard
                        title="Total Earnings"
                        value={`₱${data.totalEarnings.toLocaleString()}`}
                        icon="cash-outline"
                        iconColor="#3B82F6"
                        iconBgColor={isDark ? 'rgba(59, 130, 246, 0.2)' : '#DBEAFE'}
                        delay={350}
                    />
                </View>

                {/* Session Activity Chart */}
                <DashboardBarChart
                    title="Session Activity"
                    data={data.sessionStats.map(s => ({ label: s.label, value: s.count, isHighlighted: s.isHighlighted }))}
                    activeTabLabel={activeTab}
                    onTabPress={() => setActiveTab(activeTab === 'Weekly' ? 'Monthly' : 'Weekly')}
                    delay={400}
                    yAxisSuffix="s"
                />

                {/* Recent Reviews List */}
                <DashboardListSection
                    title="Recent Reviews"
                    delay={500}
                >
                    {data.recentReviews.map((review, index) => (
                        <DashboardListItem
                            key={review.id}
                            title={review.clientName}
                            subtitle={new Date(review.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            avatar={review.avatar}
                            isLast={index === data.recentReviews.length - 1}
                            rightElement={
                                <View className="flex-row items-center bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded-full">
                                    <Ionicons name="star" size={12} color="#EAB308" />
                                    <Text className="text-xs font-bold text-yellow-700 dark:text-yellow-500 ml-1">{review.rating}</Text>
                                </View>
                            }
                        >
                            <Text className="text-sm text-gray-600 dark:text-gray-400 leading-5 mt-1">
                                "{review.comment}"
                            </Text>
                        </DashboardListItem>
                    ))}
                </DashboardListSection>
            </ScrollView>
        </View>
    );
}
