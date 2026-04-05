import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { View, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/Text';
import { Ionicons } from '@expo/vector-icons';
import { Colors, primaryColor } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Header } from '@/components/native/Header';
import { RisingItem } from '@/components/native/RisingItem';
import {
    Booking,
    allBookings,
    getUpcomingBookings,
    getCompletedBookings,
    getCancelledBookings
} from './configs/mockBookingsData';
import AdminBookingCard from './components/AdminBookingCard';
import TabNavigation from './components/TabNavigation';
import BookingDetailsAdminScreen from './BookingDetailsAdminScreen.native';
import { getBookingDetails } from './configs/mockBookingDetailsData';

import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    runOnJS,
} from 'react-native-reanimated';

interface BookingsAdminScreenProps {
    onDetailsScreenChange?: (isActive: boolean) => void;
    onNavigateToProfile?: () => void;
    isActive?: boolean;
    useNavigatorOverlays?: boolean;
    onNavigateBookingDetails?: (bookingId: string) => void;
    onNavigateNotifications?: () => void;
    onNavigateWalkInBooking?: () => void;
}

export default function BookingsAdminScreen({
    onDetailsScreenChange,
    onNavigateToProfile,
    isActive,
    useNavigatorOverlays = false,
    onNavigateBookingDetails,
    onNavigateNotifications,
    onNavigateWalkInBooking,
}: BookingsAdminScreenProps = {}) {
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const isVisible = isActive ?? true;
    const [activeTab, setActiveTab] = useState<'upcoming' | 'completed' | 'cancelled' | 'all'>('all');
    const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);


    const screenWidth = Dimensions.get('window').width;

    // Shared values for horizontal slide transitions
    const bookingDetailsTranslateX = useSharedValue(screenWidth);


    // Tab order for paging (All is first)
    const tabs: Array<'all' | 'upcoming' | 'completed' | 'cancelled'> = ['all', 'upcoming', 'completed', 'cancelled'];
    const pageScrollViewRef = useRef<ScrollView>(null);
    const maxAnimatedItems = 6;
    const baseItemDelay = 140;
    const perItemDelay = 140;

    // Handle page scroll to sync active tab
    const handlePageScroll = (event: any) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        const pageIndex = Math.round(offsetX / screenWidth);
        if (pageIndex >= 0 && pageIndex < tabs.length) {
            setActiveTab(tabs[pageIndex]);
        }
    };

    // Handle tab press to scroll to corresponding page
    const handleTabPress = (tab: 'all' | 'upcoming' | 'completed' | 'cancelled') => {
        const tabIndex = tabs.indexOf(tab);
        if (tabIndex >= 0 && pageScrollViewRef.current) {
            pageScrollViewRef.current.scrollTo({
                x: tabIndex * screenWidth,
                animated: true,
            });
        }
        setActiveTab(tab);
    };

    // Helper function to sort bookings by date (most recent first)
    const sortBookingsByDate = (bookings: Booking[]): Booking[] => {
        return [...bookings].sort((a, b) => {
            const parseDate = (dateStr: string): Date => {
                const [month, day, year] = dateStr.split('/').map(Number);
                return new Date(year, month - 1, day);
            };

            const dateA = parseDate(a.date);
            const dateB = parseDate(b.date);

            return dateB.getTime() - dateA.getTime();
        });
    };

    // Handle booking card press
    const handleBookingPress = (bookingId: string) => {
        if (useNavigatorOverlays) {
            onNavigateBookingDetails?.(bookingId);
            return;
        }
        setSelectedBookingId(bookingId);
    };

    // Handle back from details screen
    const closeBookingDetails = () => {
        if (useNavigatorOverlays) return;
        bookingDetailsTranslateX.value = withTiming(
            screenWidth,
            { duration: 300 },
            () => {
                runOnJS(setSelectedBookingId)(null);
            }
        );
    };



    // If booking details not found, reset selection
    useEffect(() => {
        if (selectedBookingId) {
            const bookingDetails = getBookingDetails(selectedBookingId);
            if (!bookingDetails) {
                setSelectedBookingId(null);
            }
        }
    }, [selectedBookingId]);

    // Notify parent when details screen is shown/hidden
    useEffect(() => {
        if (useNavigatorOverlays) return;
        onDetailsScreenChange?.(selectedBookingId !== null);
    }, [selectedBookingId, onDetailsScreenChange, useNavigatorOverlays]);

    // Animate overlays when state changes (enter)
    useEffect(() => {
        if (selectedBookingId) {
            bookingDetailsTranslateX.value = withTiming(0, { duration: 300 });
        } else {
            bookingDetailsTranslateX.value = screenWidth;
        }
    }, [selectedBookingId, bookingDetailsTranslateX, screenWidth]);



    // Animated styles
    const bookingDetailsAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: bookingDetailsTranslateX.value }],
    }));



    // Handle ScrollView layout to set initial position immediately
    const handleScrollViewLayout = () => {
        if (pageScrollViewRef.current) {
            const tabIndex = tabs.indexOf(activeTab);
            if (tabIndex >= 0) {
                pageScrollViewRef.current.scrollTo({
                    x: tabIndex * screenWidth,
                    animated: false,
                });
            }
        }
    };

    // Restore scroll position when returning from details screen
    useLayoutEffect(() => {
        if (selectedBookingId === null && pageScrollViewRef.current) {
            const tabIndex = tabs.indexOf(activeTab);
            if (tabIndex >= 0) {
                pageScrollViewRef.current.scrollTo({
                    x: tabIndex * screenWidth,
                    animated: false,
                });
            }
        }
    }, [selectedBookingId, activeTab, screenWidth]);

    return (
        <View className="flex-1 bg-white">
            {/* Header Section */}
            <RisingItem delay={0}>
                <Header
                    onProfilePress={onNavigateToProfile}
                    onNotificationPress={onNavigateNotifications}
                />
            </RisingItem>

            {/* Tab Navigation */}
            <RisingItem delay={80}>
                <TabNavigation activeTab={activeTab} onTabPress={handleTabPress} />
            </RisingItem>

            {/* Bookings List - Horizontal Pager */}
            <ScrollView
                ref={pageScrollViewRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={handlePageScroll}
                onLayout={handleScrollViewLayout}
                className="flex-1"
                decelerationRate="fast"
            >
                {tabs.map((tab) => {
                    const filteredBookings =
                        tab === 'upcoming' ? getUpcomingBookings(allBookings) :
                            tab === 'completed' ? getCompletedBookings(allBookings) :
                                tab === 'cancelled' ? getCancelledBookings(allBookings) :
                                    allBookings;

                    const tabBookings = sortBookingsByDate(filteredBookings);

                    return (
                        <ScrollView
                            key={tab}
                            className="flex-1 px-5"
                            style={{ width: screenWidth }}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{ paddingBottom: insets.bottom + 70, paddingTop: 12 }}
                        >
                            {tabBookings.length > 0 ? (
                                tabBookings.map((booking, index) => {
                                    const shouldAnimate = tab === activeTab && index < maxAnimatedItems;
                                    const delay = baseItemDelay + Math.min(index, maxAnimatedItems) * perItemDelay;
                                    return (
                                        <AdminBookingCard
                                            key={booking.id}
                                            booking={booking}
                                            tabType={tab}
                                            onPress={() => handleBookingPress(booking.id)}
                                            onAccept={(id) => console.log('Accept booking:', id)}
                                            onDecline={(id) => console.log('Decline booking:', id)}
                                            onViewBooking={(id) => handleBookingPress(id)}
                                            onRateCustomer={(id) => console.log('Rate customer:', id)}
                                            onRefund={(id) => console.log('Refund booking:', id)}
                                            animateContent={shouldAnimate}
                                            animationDelay={shouldAnimate ? delay : 0}
                                            contentVisible={isVisible && tab === activeTab}
                                        />
                                    );
                                })
                            ) : (
                                tab === activeTab ? (
                                    <RisingItem delay={baseItemDelay} visible={isVisible}>
                                        <View className="items-center justify-center py-20">
                                            <Ionicons name="calendar-outline" size={64} color={colors.icon} />
                                            <Text className="text-lg font-semibold mt-4" style={{ color: colors.text }}>
                                                {tab === 'all' ? 'No bookings' : `No ${tab} bookings`}
                                            </Text>
                                            <Text className="text-sm mt-2" style={{ color: colors.icon }}>
                                                {tab === 'all' ? 'Your bookings will appear here' : `Your ${tab} bookings will appear here`}
                                            </Text>
                                        </View>
                                    </RisingItem>
                                ) : (
                                    <View className="items-center justify-center py-20">
                                        <Ionicons name="calendar-outline" size={64} color={colors.icon} />
                                        <Text className="text-lg font-semibold mt-4" style={{ color: colors.text }}>
                                            {tab === 'all' ? 'No bookings' : `No ${tab} bookings`}
                                        </Text>
                                        <Text className="text-sm mt-2" style={{ color: colors.icon }}>
                                            {tab === 'all' ? 'Your bookings will appear here' : `Your ${tab} bookings will appear here`}
                                        </Text>
                                    </View>
                                )
                            )}
                        </ScrollView>
                    );
                })}
            </ScrollView>

            {/* Floating Action Button for Walk-in */}
            <TouchableOpacity
                className="absolute w-14 h-14 rounded-full items-center justify-center elevation-5"
                style={{
                    backgroundColor: colors.primary,
                    right: 20,
                    bottom: insets.bottom + 80, // Position above the bottom tab bar
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                    elevation: 5,
                }}
                onPress={() => {
                    if (useNavigatorOverlays) {
                        onNavigateWalkInBooking?.();
                    } else {
                        console.log('Navigate to Walk-in Booking Screen fallback');
                    }
                }}
            >
                <Ionicons name="add" size={30} color="white" />
            </TouchableOpacity>

            {/* Booking Details Screen Overlay */}
            {!useNavigatorOverlays && selectedBookingId && (
                <Animated.View
                    className="absolute top-0 left-0 right-0 bottom-0 bg-white"
                    style={[
                        {
                            zIndex: 5,
                        },
                        bookingDetailsAnimatedStyle,
                    ]}
                >
                    <BookingDetailsAdminScreen
                        bookingDetails={getBookingDetails(selectedBookingId)!}
                        onBack={closeBookingDetails}
                        onAccept={() => console.log('Accept via details')}
                        onDecline={() => console.log('Decline via details')}
                        onRefund={() => console.log('Refund via details')}
                    />
                </Animated.View>
            )}


        </View>
    );
}
