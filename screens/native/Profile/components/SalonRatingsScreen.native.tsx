import React, { useEffect, useState } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/Text';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { RisingItem } from '@/components/native/RisingItem';
import { getEstablishmentRatings } from '@/api/endpoints/apiRating';
import type { TargetRatingsResponse, RatingResponse } from '@/api/types';
import { getUsers } from '@/api/endpoints/apiUser';
import { fetchMyEstablishment } from '../businessSettingsService';

interface MassageSpaRatingsScreenProps {
    establishmentId?: string | null;
    onBack: () => void;
}

export default function MassageSpaRatingsScreen({ establishmentId, onBack }: MassageSpaRatingsScreenProps) {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const insets = useSafeAreaInsets();
    const isDark = colorScheme === 'dark';

    const [loading, setLoading] = useState(true);
    const [ratingData, setRatingData] = useState<TargetRatingsResponse | null>(null);
    const [reviewers, setReviewers] = useState<Record<string, string>>({});

    useEffect(() => {
        const fetchRatings = async () => {
            try {
                let activeId = establishmentId;
                if (!activeId) {
                    const result = await fetchMyEstablishment();
                    if (result.success && result.data) {
                        activeId = result.data.id;
                    }
                }
                if (!activeId) {
                    setLoading(false);
                    return;
                }
                const response = await getEstablishmentRatings(activeId);
                setRatingData(response);

                // Fetch reviewer names
                if (response?.ratings?.length > 0) {
                    const reviewerIds = Array.from(new Set(response.ratings.map(r => r.reviewerId)));
                    const reviewersMap: Record<string, string> = {};
                    
                    await Promise.all(reviewerIds.map(async (uid) => {
                        try {
                            const userRes = await getUsers({ uid, page: 1, pageSize: 1 });
                            const user = Array.isArray(userRes.data?.items) ? userRes.data.items[0] : null;
                            if (user) reviewersMap[uid] = user.fullName;
                        } catch (e) {
                            console.warn('Failed to fetch user', uid);
                        }
                    }));
                    
                    setReviewers(reviewersMap);
                }
            } catch (error) {
                console.error('Failed to fetch ratings:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRatings();
    }, [establishmentId]);

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
                {loading ? (
                    <View className="flex-1 justify-center items-center mt-20">
                        <ActivityIndicator size="large" color={colors.primary} />
                    </View>
                ) : (
                    <>
                        <View className="items-center mb-6">
                            <Text className="text-[40px] font-black" style={{ color: colors.text }}>
                                {ratingData?.averageScore ? ratingData.averageScore.toFixed(1) : '0.0'}
                            </Text>
                            <View className="flex-row items-center mb-2">
                                {[1, 2, 3, 4, 5].map((star) => {
                                    const avg = ratingData?.averageScore || 0;
                                    const isHalf = avg >= star - 0.5 && avg < star;
                                    const isFull = avg >= star;
                                    return (
                                        <Ionicons 
                                            key={star} 
                                            name={isFull ? "star" : (isHalf ? "star-half" : "star-outline")} 
                                            size={24} 
                                            color="#F59E0B" 
                                        />
                                    );
                                })}
                            </View>
                            <Text className="text-sm" style={{ color: colors.icon }}>
                                Based on {ratingData?.totalRatings || 0} reviews
                            </Text>
                        </View>

                        {ratingData?.ratings && ratingData.ratings.length > 0 ? (
                            ratingData.ratings.map((rating: RatingResponse, index: number) => {
                                const reviewerName = reviewers[rating.reviewerId] || 'User';
                                const dateStr = new Date(rating.createdAt).toLocaleDateString();
                                return (
                                    <RisingItem key={rating.ratingId} delay={index * 100}>
                                        <View className="p-4 mb-4 rounded-2xl bg-white dark:bg-[#1F1F1F] shadow-sm" style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 }}>
                                            <View className="flex-row justify-between items-center mb-2">
                                                <Text className="font-bold text-base" style={{ color: colors.text }}>{reviewerName}</Text>
                                                <Text className="text-xs" style={{ color: colors.icon }}>{dateStr}</Text>
                                            </View>
                                            <View className="flex-row mb-2">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <Ionicons key={star} name={star <= rating.score ? "star" : "star-outline"} size={14} color="#F59E0B" />
                                                ))}
                                            </View>
                                            <Text className="text-sm leading-5" style={{ color: colors.text }}>
                                                {rating.comment}
                                            </Text>
                                        </View>
                                    </RisingItem>
                                );
                            })
                        ) : (
                            <View className="items-center mt-10">
                                <Text className="text-base" style={{ color: colors.icon }}>No ratings yet.</Text>
                            </View>
                        )}
                    </>
                )}
            </ScrollView>
        </View>
    );
}
