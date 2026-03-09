import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/Text';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { RisingItem } from '@/components/native/RisingItem';

// Mock logs
const mockLogs = [
    { id: '1', user: 'Jane Doe', action: 'Confirmed Booking #BK-9182', time: '10:45 AM, Today', type: 'booking' },
    { id: '2', user: 'John Smith', action: 'Logged in', time: '09:00 AM, Today', type: 'auth' },
    { id: '3', user: 'Emily Clark', action: 'Updated Service Pricing', time: '04:30 PM, Yesterday', type: 'settings' },
    { id: '4', user: 'Jane Doe', action: 'Completed Booking #BK-9180', time: '02:15 PM, Yesterday', type: 'booking' },
];

interface AccessLogsScreenProps {
    onBack: () => void;
}

export default function AccessLogsScreen({ onBack }: AccessLogsScreenProps) {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const insets = useSafeAreaInsets();
    const isDark = colorScheme === 'dark';

    const getIconForType = (type: string) => {
        switch (type) {
            case 'booking': return 'calendar-outline';
            case 'auth': return 'log-in-outline';
            case 'settings': return 'settings-outline';
            default: return 'document-text-outline';
        }
    };

    return (
        <View className="flex-1 bg-white dark:bg-[#151718]">
            <View
                className="absolute left-0 right-0 flex-row items-center px-5 py-4 z-10"
                style={{
                    backgroundColor: colors.background,
                    top: 0,
                    paddingTop: insets.top,
                    borderBottomWidth: 1,
                    borderBottomColor: isDark ? '#2a2a2a' : '#E5E7EB',
                }}
            >
                <TouchableOpacity
                    onPress={onBack}
                    className="w-10 h-10 items-center justify-center rounded-full mr-3"
                    style={{ backgroundColor: isDark ? '#2a2a2a' : '#F3F4F6' }}
                >
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text className="text-lg font-semibold flex-1" style={{ color: colors.text }} numberOfLines={1}>
                    Access Logs
                </Text>
            </View>

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingTop: insets.top + 56 + 20,
                    paddingBottom: insets.bottom + 24,
                    paddingHorizontal: 20,
                }}
            >
                <Text className="text-base mb-4" style={{ color: colors.icon }}>
                    Recent staff activity logs.
                </Text>

                {mockLogs.map((log, index) => (
                    <RisingItem key={log.id} delay={index * 100}>
                        <View className="p-4 mb-3 rounded-2xl bg-white dark:bg-[#1F1F1F] flex-row items-center shadow-sm" style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 }}>
                            <View className="w-10 h-10 rounded-full items-center justify-center mr-3 bg-gray-100 dark:bg-[#2a2a2a]">
                                <Ionicons name={getIconForType(log.type)} size={20} color={colors.icon} />
                            </View>
                            <View className="flex-1">
                                <Text className="text-sm font-semibold mb-1" style={{ color: colors.text }}>
                                    {log.user} <Text style={{ color: colors.icon, fontWeight: 'normal' }}>• {log.action}</Text>
                                </Text>
                                <Text className="text-xs" style={{ color: colors.icon }}>
                                    {log.time}
                                </Text>
                            </View>
                        </View>
                    </RisingItem>
                ))}
            </ScrollView>
        </View>
    );
}
