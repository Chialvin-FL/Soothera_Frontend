import React from 'react';
import { View, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/Text';
import { Ionicons } from '@expo/vector-icons';
import { Colors, primaryColor } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { RisingItem } from '@/components/native/RisingItem';

interface BusinessSettingsScreenProps {
    onBack: () => void;
}

export default function BusinessSettingsScreen({ onBack }: BusinessSettingsScreenProps) {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const insets = useSafeAreaInsets();
    const isDark = colorScheme === 'dark';

    const InputField = ({ label, placeholder, multiline = false }: { label: string, placeholder: string, multiline?: boolean }) => (
        <View className="mb-4">
            <Text className="text-sm font-semibold mb-2" style={{ color: colors.text }}>{label}</Text>
            <TextInput
                placeholder={placeholder}
                placeholderTextColor={colors.icon}
                multiline={multiline}
                className={`bg-gray-100 dark:bg-[#1F1F1F] rounded-xl px-4 py-3 text-base ${multiline ? 'h-24 pt-3' : ''}`}
                style={{ color: colors.text, textAlignVertical: multiline ? 'top' : 'center' }}
            />
        </View>
    );

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
                    Business Settings
                </Text>
            </View>

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingTop: insets.top + 56 + 20,
                    paddingBottom: insets.bottom + 100,
                    paddingHorizontal: 20,
                }}
            >
                <RisingItem delay={100}>
                    <InputField label="Salon Name" placeholder="Enter salon name" />
                    <InputField label="Description" placeholder="Enter description about your business" multiline={true} />
                    <InputField label="Location" placeholder="Enter full address" />
                    <InputField label="Contact Number" placeholder="e.g. +1 234 567 890" />
                    <InputField label="Business Hours" placeholder="e.g. Mon-Fri 9AM-8PM" />

                    <View className="mt-4 flex-row items-center justify-between py-3 border-b border-gray-100 dark:border-[#2a2a2a]">
                        <Text className="text-base font-semibold" style={{ color: colors.text }}>Services & Prices</Text>
                        <Ionicons name="chevron-forward" size={20} color={colors.icon} />
                    </View>
                    <View className="flex-row items-center justify-between py-3 border-b border-gray-100 dark:border-[#2a2a2a]">
                        <Text className="text-base font-semibold" style={{ color: colors.text }}>Vouchers & Promos</Text>
                        <Ionicons name="chevron-forward" size={20} color={colors.icon} />
                    </View>
                    <View className="flex-row items-center justify-between py-3 border-b border-gray-100 dark:border-[#2a2a2a]">
                        <Text className="text-base font-semibold" style={{ color: colors.text }}>Refund Rules</Text>
                        <Ionicons name="chevron-forward" size={20} color={colors.icon} />
                    </View>
                </RisingItem>
            </ScrollView>

            {/* Save Button */}
            <View
                className="absolute left-0 right-0 px-5 pt-4 border-t border-gray-100 dark:border-[#2a2a2a] bg-white dark:bg-[#151718]"
                style={{ paddingBottom: insets.bottom + 20, bottom: 0 }}
            >
                <TouchableOpacity
                    className="w-full py-4 rounded-full items-center justify-center"
                    style={{ backgroundColor: primaryColor }}
                >
                    <Text className="text-white text-base font-bold">Save Changes</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
