import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    ScrollView,
    RefreshControl,
    ActivityIndicator,
    TouchableOpacity,
    Platform,
    Linking,
    Modal,
} from 'react-native';
import { Text } from '@/components/Text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '@/components/native/Header';
import { RisingItem } from '@/components/native/RisingItem';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, primaryColor } from '@/constants/theme';
import { DashboardKPICard } from './components/Home/DashboardKPICard';
import { DashboardBarChart } from './components/Home/DashboardBarChart';
import { DashboardListItem, DashboardListSection } from './components/Home/DashboardListItem';
import { getOwnerAnalytics } from '@/api/endpoints/apiSalonEstablishment';
import type { OwnerAnalytics } from '@/api/types';
import { Ionicons } from '@expo/vector-icons';
/* eslint-disable import/namespace */
import * as FileSystem from 'expo-file-system/legacy';
import * as IntentLauncher from 'expo-intent-launcher';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/env';
import { getStoredToken } from '@/api/axiosClient';
import { API_CONFIG } from '@/api/config';
import { SuccessModal } from '@/components/native/SuccessModal';

type FilterType = 'monthly' | 'weekly';
type ExportType = 'summary' | 'transactions';

interface HomeScreenAdminProps {
    onNavigateToProfile?: () => void;
    onNavigateNotifications?: () => void;
    useNavigatorOverlays?: boolean;
    userProfilePic?: string | null;
    establishmentId?: string | null;
}

export default function HomeScreenAdmin({
    onNavigateToProfile,
    onNavigateNotifications,
    userProfilePic,
    establishmentId,
}: HomeScreenAdminProps) {
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const isDark = colorScheme === 'dark';

    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [revenueAnalytics, setRevenueAnalytics] = useState<OwnerAnalytics | null>(null);
    const [topSpendersAnalytics, setTopSpendersAnalytics] = useState<OwnerAnalytics | null>(null);
    const [revenueFilter, setRevenueFilter] = useState<FilterType>('monthly');
    const [topSpendersFilter, setTopSpendersFilter] = useState<FilterType>('monthly');
    const [hasNoSalon, setHasNoSalon] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Export modal state
    const [exportModalVisible, setExportModalVisible] = useState(false);
    const [exportFilter, setExportFilter] = useState<FilterType>('monthly');
    const [exportType, setExportType] = useState<ExportType>('summary');
    const [isExporting, setIsExporting] = useState(false);

    // Folder URI for Android SAF
    const [sootheraFolderUri, setSootheraFolderUri] = useState<string | null>(null);

    // Success/error feedback modal
    const [successModal, setSuccessModal] = useState<{
        visible: boolean;
        title: string;
        message: string;
        variant: 'success' | 'error';
    }>({ visible: false, title: '', message: '', variant: 'success' });

    // ─── Helpers ──────────────────────────────────────────────────────────────

    const showSuccessModal = (title: string, message: string, variant: 'success' | 'error' = 'success') => {
        setSuccessModal({ visible: true, title, message, variant });
    };

    const hideSuccessModal = () => setSuccessModal((prev) => ({ ...prev, visible: false }));

    // ─── Initialisation ───────────────────────────────────────────────────────

    useEffect(() => {
        const initFolder = async () => {
            if (Platform.OS === 'android') {
                const savedUri = await AsyncStorage.getItem(STORAGE_KEYS.SOOTHERA_FOLDER_URI);
                if (savedUri) setSootheraFolderUri(savedUri);
            }
        };
        initFolder();
    }, []);

    // Initial load of both datasets
    useEffect(() => {
        const loadInitialData = async () => {
            setIsLoading(true);
            setErrorMessage(null);
            setHasNoSalon(false);
            try {
                const [revRes, spendRes] = await Promise.all([
                    getOwnerAnalytics(establishmentId ?? undefined, revenueFilter),
                    getOwnerAnalytics(establishmentId ?? undefined, topSpendersFilter),
                ]);
                if (revRes.success && revRes.data) setRevenueAnalytics(revRes.data);
                if (spendRes.success && spendRes.data) setTopSpendersAnalytics(spendRes.data);
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
    }, [establishmentId]);

    // Independent update for revenue chart
    useEffect(() => {
        if (isLoading) return;
        const updateRevenue = async () => {
            try {
                const response = await getOwnerAnalytics(establishmentId ?? undefined, revenueFilter);
                if (response.success && response.data) setRevenueAnalytics(response.data);
            } catch (err: any) {
                console.error('[HomeScreenAdmin] Revenue filter update error:', err);
            }
        };
        updateRevenue();
    }, [revenueFilter, isLoading, establishmentId]);

    // Independent update for top spenders list
    useEffect(() => {
        if (isLoading) return;
        const updateTopSpenders = async () => {
            try {
                const response = await getOwnerAnalytics(establishmentId ?? undefined, topSpendersFilter);
                if (response.success && response.data) setTopSpendersAnalytics(response.data);
            } catch (err: any) {
                console.error('[HomeScreenAdmin] Top spenders filter update error:', err);
            }
        };
        updateTopSpenders();
    }, [topSpendersFilter, isLoading, establishmentId]);

    // Pull-to-refresh
    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        setErrorMessage(null);
        try {
            const [revRes, spendRes] = await Promise.all([
                getOwnerAnalytics(establishmentId ?? undefined, revenueFilter),
                getOwnerAnalytics(establishmentId ?? undefined, topSpendersFilter),
            ]);
            if (revRes.success && revRes.data) setRevenueAnalytics(revRes.data);
            if (spendRes.success && spendRes.data) setTopSpendersAnalytics(spendRes.data);
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
    }, [revenueFilter, topSpendersFilter, establishmentId]);

    // ─── CSV Export ───────────────────────────────────────────────────────────

    const setupSootheraFolder = async (): Promise<string | null> => {
        if (Platform.OS !== 'android') return null;
        try {
            // @ts-ignore – StorageAccessFramework exists at runtime
            const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
            if (!permissions.granted) {
                showSuccessModal('Permission Required', 'Please select a folder (e.g. Downloads) to save reports.', 'error');
                return null;
            }
            // @ts-ignore
            const folder = await FileSystem.StorageAccessFramework.makeDirectoryAsync(
                permissions.directoryUri, 'Soothera'
            );
            await AsyncStorage.setItem(STORAGE_KEYS.SOOTHERA_FOLDER_URI, folder);
            setSootheraFolderUri(folder);
            return folder;
        } catch (error) {
            console.error('Error creating Soothera folder:', error);
            showSuccessModal('Error', 'Failed to configure destination folder.', 'error');
            return null;
        }
    };

    const exportToCSV = async (type: ExportType, filter: FilterType) => {
        setExportModalVisible(false);
        setIsExporting(true);
        try {
            const token = await getStoredToken();
            const url = `${API_CONFIG.API_URL}/Establishment/owner-analytics/export?filter=${filter}&type=${type}`;
            const fileName = `Owner_Analytics_${type === 'summary' ? 'Summary' : 'Transactions'}_${filter}_${new Date().toISOString().slice(0, 10)}.csv`;

            console.log('[HomeScreenAdmin] Downloading CSV:', url);

            // @ts-ignore
            const tempUri = `${FileSystem.cacheDirectory}${fileName}`;
            // @ts-ignore
            const downloadResult = await FileSystem.downloadAsync(url, tempUri, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (downloadResult.status !== 200) {
                throw new Error(`Server returned status ${downloadResult.status}`);
            }

            let savedUri = downloadResult.uri;

            if (Platform.OS === 'android') {
                let folderUri = sootheraFolderUri;
                if (!folderUri) {
                    folderUri = await setupSootheraFolder();
                    if (!folderUri) { setIsExporting(false); return; }
                }
                try {
                    // @ts-ignore
                    savedUri = await FileSystem.StorageAccessFramework.createFileAsync(folderUri, fileName, 'text/csv');
                    // @ts-ignore
                    const content = await FileSystem.readAsStringAsync(downloadResult.uri, {
                        // @ts-ignore
                        encoding: FileSystem.EncodingType.UTF8,
                    });
                    // @ts-ignore
                    await FileSystem.writeAsStringAsync(savedUri, content, {
                        // @ts-ignore
                        encoding: FileSystem.EncodingType.UTF8,
                    });
                } catch (saveErr) {
                    console.error('SAF save error:', saveErr);
                    showSuccessModal('Error', 'Failed to save the CSV file.', 'error');
                    setIsExporting(false);
                    return;
                }
            } else {
                // @ts-ignore
                const documentsDir = FileSystem.documentDirectory;
                if (!documentsDir) throw new Error('Document directory unavailable');
                const folderPath = `${documentsDir}Soothera/`;
                // @ts-ignore
                const folderInfo = await FileSystem.getInfoAsync(folderPath);
                if (!folderInfo.exists) {
                    // @ts-ignore
                    await FileSystem.makeDirectoryAsync(folderPath, { intermediates: true });
                }
                savedUri = `${folderPath}${fileName}`;
                // @ts-ignore
                await FileSystem.copyAsync({ from: downloadResult.uri, to: savedUri });
            }

            try {
                if (Platform.OS === 'android') {
                    await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
                        data: savedUri,
                        flags: 1,
                        type: 'text/csv',
                    });
                } else {
                    await Linking.openURL(savedUri);
                }
                showSuccessModal('Report Exported', `Saved and opened:\n\nSoothera/${fileName}`);
            } catch {
                showSuccessModal('Report Exported', `Saved to:\n\nSoothera/${fileName}\n\nYou can open it from your file manager.`);
            }
        } catch (error: any) {
            console.error('[HomeScreenAdmin] Export error:', error);
            showSuccessModal('Export Failed', error?.message || 'Failed to export the report.', 'error');
        } finally {
            setIsExporting(false);
        }
    };

    // ─── Loading / Error / Empty states ──────────────────────────────────────

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
                    <View
                        className="bg-gray-50 dark:bg-[#1c1c1e] rounded-3xl p-8 items-center border border-gray-100 dark:border-gray-800 w-full max-w-sm"
                        style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.06, shadowRadius: 20, elevation: 4 }}
                    >
                        <View className="w-16 h-16 rounded-full bg-[#E6F0ED] dark:bg-primary-900/20 items-center justify-center mb-6">
                            <Ionicons name="storefront-outline" size={32} color={colors.primary} />
                        </View>
                        <Text className="text-xl font-bold text-[#1c1c1e] dark:text-white mb-2 text-center">Set Up Your Salon</Text>
                        <Text className="text-sm text-gray-500 dark:text-gray-400 text-center mb-8 leading-5">
                            {"You haven't set up a salon establishment yet. Create your salon profile to start viewing analytics."}
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
                    <View
                        className="bg-red-50 dark:bg-red-950/20 rounded-3xl p-8 items-center border border-red-100 dark:border-red-900/30 w-full max-w-sm"
                        style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.06, shadowRadius: 20, elevation: 4 }}
                    >
                        <View className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/40 items-center justify-center mb-6">
                            <Ionicons name="alert-circle-outline" size={32} color="#EF4444" />
                        </View>
                        <Text className="text-xl font-bold text-red-800 dark:text-red-400 mb-2 text-center">Failed to Load Analytics</Text>
                        <Text className="text-sm text-red-600 dark:text-red-500 text-center mb-8 leading-5">{errorMessage}</Text>
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

    // ─── Chart data ───────────────────────────────────────────────────────────

    const chartData = revenueAnalytics?.revenueChart.map((item, index, arr) => ({
        label: item.label,
        value: item.revenue,
        isHighlighted: index === arr.length - 1,
    })) ?? [];

    // ─── Render ───────────────────────────────────────────────────────────────

    return (
        <View className="flex-1 bg-white dark:bg-[#121212]">
            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
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
                        onExportPress={() => setExportModalVisible(true)}
                    />
                </RisingItem>

                {/* KPI Cards */}
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

                {/* Revenue Chart */}
                <DashboardBarChart
                    title="Revenue"
                    mainValue={`₱${(revenueAnalytics?.totalRevenue ?? 0).toLocaleString()}`}
                    mainValueLabel="Total Revenue"
                    data={chartData}
                    activeTabLabel={revenueFilter === 'monthly' ? 'Monthly' : 'Weekly'}
                    onTabPress={() => setRevenueFilter(revenueFilter === 'monthly' ? 'weekly' : 'monthly')}
                    delay={400}
                />

                {/* Top Spenders */}
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

            {/* ── Export CSV Modal ─────────────────────────────────────────── */}
            <Modal
                visible={exportModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setExportModalVisible(false)}
            >
                <TouchableOpacity
                    className="flex-1 bg-black/40"
                    activeOpacity={1}
                    onPress={() => setExportModalVisible(false)}
                />
                <View
                    className="bg-white dark:bg-[#1c1c1e] rounded-t-3xl px-6 pt-5"
                    style={{ paddingBottom: insets.bottom + 24 }}
                >
                    {/* Handle bar */}
                    <View className="w-10 h-1 rounded-full bg-gray-200 dark:bg-gray-700 self-center mb-5" />

                    {/* Title */}
                    <View className="flex-row items-center mb-6">
                        <View
                            className="w-9 h-9 rounded-full items-center justify-center mr-3"
                            style={{ backgroundColor: primaryColor + '18' }}
                        >
                            <Ionicons name="download-outline" size={18} color={primaryColor} />
                        </View>
                        <Text className="text-lg font-bold text-[#1c1c1e] dark:text-white">Export Report</Text>
                    </View>

                    {/* Filter picker — Period */}
                    <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Period</Text>
                    <View className="flex-row mb-6" style={{ gap: 10 }}>
                        {(['monthly', 'weekly'] as FilterType[]).map((f) => (
                            <TouchableOpacity
                                key={f}
                                className="flex-1 py-3 rounded-xl items-center border"
                                style={{
                                    backgroundColor: exportFilter === f ? primaryColor : (isDark ? '#2a2a2a' : '#f8f9fa'),
                                    borderColor: exportFilter === f ? primaryColor : (isDark ? '#3a3a3a' : '#e5e7eb'),
                                }}
                                onPress={() => setExportFilter(f)}
                            >
                                <Text
                                    className="text-sm font-semibold capitalize"
                                    style={{ color: exportFilter === f ? 'white' : (isDark ? '#9ca3af' : '#4b5563') }}
                                >
                                    {f}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Type picker */}
                    <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Report Type</Text>
                    <View className="flex-row mb-8" style={{ gap: 10 }}>
                        {([
                            { value: 'summary', label: 'Summary', icon: 'bar-chart-outline' },
                            { value: 'transactions', label: 'Transactions', icon: 'receipt-outline' },
                        ] as { value: ExportType; label: string; icon: any }[]).map((t) => (
                            <TouchableOpacity
                                key={t.value}
                                className="flex-1 py-3 rounded-xl items-center border flex-row justify-center"
                                style={{
                                    backgroundColor: exportType === t.value ? primaryColor : (isDark ? '#2a2a2a' : '#f8f9fa'),
                                    borderColor: exportType === t.value ? primaryColor : (isDark ? '#3a3a3a' : '#e5e7eb'),
                                    gap: 6,
                                }}
                                onPress={() => setExportType(t.value)}
                            >
                                <Ionicons
                                    name={t.icon}
                                    size={15}
                                    color={exportType === t.value ? 'white' : (isDark ? '#9ca3af' : '#4b5563')}
                                />
                                <Text
                                    className="text-sm font-semibold"
                                    style={{ color: exportType === t.value ? 'white' : (isDark ? '#9ca3af' : '#4b5563') }}
                                >
                                    {t.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Download button */}
                    <TouchableOpacity
                        className="w-full py-4 rounded-2xl flex-row items-center justify-center"
                        style={{ backgroundColor: primaryColor, gap: 8 }}
                        onPress={() => exportToCSV(exportType, exportFilter)}
                    >
                        <Ionicons name="download-outline" size={18} color="white" />
                        <Text className="text-white font-bold text-base">Download CSV</Text>
                    </TouchableOpacity>
                </View>
            </Modal>

            {/* Exporting loading overlay */}
            {isExporting && (
                <View className="absolute inset-0 bg-black/30 dark:bg-black/50 items-center justify-center z-50">
                    <View
                        className="bg-white dark:bg-[#1c1c1e] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 items-center"
                        style={{ gap: 12 }}
                    >
                        <ActivityIndicator size="large" color={colors.primary} />
                        <Text className="text-sm font-semibold text-[#1c1c1e] dark:text-white">Exporting CSV...</Text>
                    </View>
                </View>
            )}

            <SuccessModal
                visible={successModal.visible}
                title={successModal.title}
                message={successModal.message}
                variant={successModal.variant}
                onClose={hideSuccessModal}
            />
        </View>
    );
}
