import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/Text';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { RisingItem } from '@/components/native/RisingItem';

// Mock ratings
const mockRatings = [
    { id: '1', user: 'Alice L.', rating: 5, comment: 'Amazing service! My therapist was so professional. Highly recommend this place.', date: '2 days ago' },
    { id: '2', user: 'Bob S.', rating: 4, comment: 'Great experience overall, but had to wait 10 mins past my appointment time.', date: '1 week ago' },
    { id: '3', user: 'Charlie M.', rating: 5, comment: 'The ambiance is perfect. Will definitely come back.', date: '2 weeks ago' },
];

interface MassageSpaRatingsScreenProps {
    onBack: () => void;
}

export default function MassageSpaRatingsScreen({ onBack }: MassageSpaRatingsScreenProps) {
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
                    Massage Spa Ratings
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
                <View className="items-center mb-6">
                    <Text className="text-[40px] font-black" style={{ color: colors.text }}>4.8</Text>
                    <View className="flex-row items-center mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Ionicons key={star} name="star" size={24} color="#F59E0B" />
                        ))}
                    </View>
                    <Text className="text-sm" style={{ color: colors.icon }}>Based on 128 reviews</Text>
                </View>

                {mockRatings.map((rating, index) => (
                    <RisingItem key={rating.id} delay={index * 100}>
                        <View className="p-4 mb-4 rounded-2xl bg-white dark:bg-[#1F1F1F] shadow-sm" style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 }}>
                            <View className="flex-row justify-between items-center mb-2">
                                <Text className="font-bold text-base" style={{ color: colors.text }}>{rating.user}</Text>
                                <Text className="text-xs" style={{ color: colors.icon }}>{rating.date}</Text>
                            </View>
                            <View className="flex-row mb-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Ionicons key={star} name={star <= rating.rating ? "star" : "star-outline"} size={14} color="#F59E0B" />
                                ))}
                            </View>
                            <Text className="text-sm leading-5" style={{ color: colors.text }}>
                                {rating.comment}
                            </Text>
                        </View>
                    </RisingItem>
                ))}
            </ScrollView>
        </View>
    );
}
