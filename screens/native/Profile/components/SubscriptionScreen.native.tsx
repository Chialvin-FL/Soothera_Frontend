import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/Text';
import { Ionicons } from '@expo/vector-icons';
import { Colors, primaryColor } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { RisingItem } from '@/components/native/RisingItem';

interface SubscriptionScreenProps {
    onBack: () => void;
}

const plans = [
    { label: 'Basic Plan', price: '$29/mo', features: ['Up to 5 Staff Members', 'Basic Booking System', 'Email Support'], active: false },
    { label: 'Pro Plan', price: '$79/mo', features: ['Unlimited Staff Members', 'Advanced Analytics', 'Priority 24/7 Support', 'Custom Integration'], active: true },
];

export default function SubscriptionScreen({ onBack }: SubscriptionScreenProps) {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const insets = useSafeAreaInsets();
    const isDark = colorScheme === 'dark';

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
                    Subscription
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
                <Text className="text-base mb-6" style={{ color: colors.icon }}>
                    Choose the best plan for your salon business.
                </Text>

                {plans.map((plan, index) => (
                    <RisingItem key={plan.label} delay={index * 150}>
                        <TouchableOpacity
                            activeOpacity={0.8}
                            className={`p-5 mb-5 rounded-2xl border-2 ${plan.active ? '' : 'border-gray-200 dark:border-[#2a2a2a]'}`}
                            style={{
                                backgroundColor: isDark ? '#1F1F1F' : '#fff',
                                borderColor: plan.active ? primaryColor : (isDark ? '#2a2a2a' : '#E5E7EB'),
                                shadowColor: plan.active ? primaryColor : '#000',
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: plan.active ? 0.2 : 0.05,
                                shadowRadius: 8,
                                elevation: plan.active ? 5 : 1,
                            }}
                        >
                            {plan.active && (
                                <View className="absolute top-0 right-0 rounded-bl-2xl rounded-tr-xl px-3 py-1" style={{ backgroundColor: primaryColor }}>
                                    <Text className="text-xs font-bold text-white">CURRENT</Text>
                                </View>
                            )}
                            <Text className="text-xl font-bold mb-1" style={{ color: colors.text }}>{plan.label}</Text>
                            <Text className="text-2xl font-black mb-4" style={{ color: primaryColor }}>{plan.price}</Text>

                            <View className="border-t border-gray-100 dark:border-[#2a2a2a] pt-4">
                                {plan.features.map((feature, idx) => (
                                    <View key={idx} className="flex-row items-center mb-2">
                                        <Ionicons name="checkmark-circle" size={20} color={colors.primary} className="mr-2" />
                                        <Text className="text-sm" style={{ color: colors.text }}>{feature}</Text>
                                    </View>
                                ))}
                            </View>

                            {!plan.active && (
                                <TouchableOpacity
                                    className="mt-4 py-3 rounded-full items-center justify-center border"
                                    style={{ borderColor: primaryColor }}
                                >
                                    <Text className="text-base font-bold" style={{ color: primaryColor }}>Upgrade Plan</Text>
                                </TouchableOpacity>
                            )}
                        </TouchableOpacity>
                    </RisingItem>
                ))}
            </ScrollView>
        </View>
    );
}
