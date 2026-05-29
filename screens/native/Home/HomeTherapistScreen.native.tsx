import React, { useState, useEffect } from 'react';
import { View, ScrollView, ActivityIndicator } from 'react-native';
import { Text } from '@/components/Text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '@/components/native/Header';
import { RisingItem } from '@/components/native/RisingItem';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { DashboardKPICard } from './components/Home/DashboardKPICard';
import { DashboardBarChart } from './components/Home/DashboardBarChart';
import { DashboardListItem, DashboardListSection } from './components/Home/DashboardListItem';
import { getTherapistAnalytics } from '@/api/endpoints/apiBooking';
import type { TherapistAnalyticsData, RecentReview } from '@/api/types';
import { API_CONFIG } from '@/api/config';

interface HomeTherapistScreenProps {
    onNavigateToProfile?: () => void;
    onNavigateNotifications?: () => void;
    useNavigatorOverlays?: boolean;
    userProfilePic?: string | null;
}

const resolveAvatar = (avatar: string | null) => {
    if (!avatar || avatar === 'null') return require('../../../assets/user.jpg');
    if (avatar.startsWith('http') || avatar.startsWith('file')) return { uri: avatar };
    return { uri: `${API_CONFIG.BASE_URL}${avatar.startsWith('/') ? '' : '/'}${avatar}` };
};

export default function HomeTherapistScreen({
    onNavigateToProfile,
    onNavigateNotifications,
    userProfilePic,
}: HomeTherapistScreenProps) {
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const isDark = colorScheme === 'dark';

    const [activeTab, setActiveTab] = useState<'Weekly' | 'Monthly'>('Weekly');
    const [loading, setLoading] = useState(true);
    const [analytics, setAnalytics] = useState<TherapistAnalyticsData | null>(null);

    useEffect(() => {
        const fetchAnalytics = async () => {
            setLoading(true);
            try {
                const res = await getTherapistAnalytics(activeTab.toLowerCase());
                if (res.success && res.data) {
                    setAnalytics(res.data);
                }
            } catch (error) {
                console.error('Failed to fetch therapist analytics:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, [activeTab]);

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

                {loading && !analytics ? (
                    <View className="flex-1 justify-center items-center mt-20">
                        <ActivityIndicator size="large" color={colors.primary} />
                    </View>
                ) : analytics ? (
                    <>
                        {/* KPI Cards Grid */}
                        <View className="px-5 mt-4 mb-4 flex-row flex-wrap justify-between">
                            <DashboardKPICard
                                title="Total Sessions"
                                value={analytics.totalSessions}
                                icon="calendar-outline"
                                iconColor={colors.primary}
                                iconBgColor={isDark ? 'rgba(var(--primary-rgb), 0.3)' : '#F3E8FF'}
                                delay={200}
                            />
                            <DashboardKPICard
                                title="Average Rating"
                                value={analytics.averageRating.toFixed(1)}
                                icon="star"
                                iconColor="#EAB308"
                                iconBgColor={isDark ? 'rgba(234, 179, 8, 0.2)' : '#FEF9C3'}
                                delay={250}
                            />
                            <DashboardKPICard
                                title="Completion"
                                value={`${analytics.completionRate}%`}
                                icon="checkmark-done-outline"
                                iconColor="#22C55E"
                                iconBgColor={isDark ? 'rgba(34, 197, 94, 0.2)' : '#DCFCE7'}
                                delay={300}
                            />
                            <DashboardKPICard
                                title="Total Earnings"
                                value={`₱${analytics.totalEarnings.toLocaleString()}`}
                                icon="cash-outline"
                                iconColor="#3B82F6"
                                iconBgColor={isDark ? 'rgba(59, 130, 246, 0.2)' : '#DBEAFE'}
                                delay={350}
                            />
                        </View>

                        {/* Session Activity Chart */}
                        <DashboardBarChart
                            title="Session Activity"
                            data={analytics.sessionChart.map((s: any) => ({ label: s.label, value: s.count, isHighlighted: s.isHighlighted }))}
                            activeTabLabel={activeTab}
                            onTabPress={() => setActiveTab(activeTab === 'Weekly' ? 'Monthly' : 'Weekly')}
                            delay={400}
                            yAxisSuffix="s"
                        />

                        {/* Recent Reviews List */}
                        {analytics.recentReviews && analytics.recentReviews.length > 0 && (
                            <DashboardListSection
                                title="Recent Reviews"
                                delay={500}
                            >
                                {analytics.recentReviews.map((review: RecentReview, index: number) => (
                                    <DashboardListItem
                                        key={review.customerId}
                                        title={review.customerName}
                                        subtitle={new Date(review.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        avatar={resolveAvatar(review.customerProfilePicture)}
                                        isLast={index === analytics.recentReviews.length - 1}
                                        rightElement={
                                            <View className="flex-row items-center bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded-full">
                                                <Ionicons name="star" size={12} color="#EAB308" />
                                                <Text className="text-xs font-bold text-yellow-700 dark:text-yellow-500 ml-1">{review.rating}</Text>
                                            </View>
                                        }
                                    >
                                        <Text className="text-sm text-gray-600 dark:text-gray-400 leading-5 mt-1">
                                            "{review.comment || review.serviceName}"
                                        </Text>
                                    </DashboardListItem>
                                ))}
                            </DashboardListSection>
                        )}
                    </>
                ) : null}
            </ScrollView>
        </View>
    );
}
