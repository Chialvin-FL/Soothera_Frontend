import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator, AppState } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/Text';
import { Ionicons } from '@expo/vector-icons';
import { Colors, primaryColor } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { API_CONFIG } from '@/api/config';
import { getBookings, updateBooking } from '@/api/endpoints/apiBooking';
import { getUsers } from '@/api/endpoints/apiUser';
import { Header } from '@/components/native/Header';
import { RisingItem } from '@/components/native/RisingItem';
import { loadStoredSession } from '@/screens/native/Login/loginService';
import type { BookingResponse, UserDto } from '@/api/types';
import { Booking, BOOKING_STATUS } from './types/Booking';
import { mapApiBookingToCard } from './utils/apiBookingMappers';
import TherapistBookingCard from './components/TherapistBookingCard';
import TabNavigation, { TabType } from './components/TabNavigation';
import { PopUpNotification, type PopUpNotificationRef } from '@/components/native/PopUpNotification';

const BOOKINGS_REFRESH_INTERVAL_MS = 3000;

interface BookingsTherapistScreenProps {
    onNavigateToProfile?: () => void;
    onNavigateNotifications?: () => void;
    onNavigateBookingDetails?: (bookingId: string) => void;
    isActive?: boolean;
    userProfilePic?: string | null;
}

export default function BookingsTherapistScreen({
    onNavigateToProfile,
    onNavigateNotifications,
    onNavigateBookingDetails,
    isActive = true,
    userProfilePic
}: BookingsTherapistScreenProps) {
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const isVisible = isActive ?? true;

    const [selectedDate, setSelectedDate] = useState(new Date());
    const [viewDate, setViewDate] = useState(new Date());
    const [activeTab, setActiveTab] = useState<TabType>('upcoming');
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoadingBookings, setIsLoadingBookings] = useState(true);
    const [bookingsError, setBookingsError] = useState<string | null>(null);
    const [updatingBookingId, setUpdatingBookingId] = useState<string | null>(null);
    const isFetchingBookingsRef = useRef(false);
    const notificationRef = useRef<PopUpNotificationRef>(null);
    const prevBookingsStatusesRef = useRef<Record<string, number>>({});

    useEffect(() => {
        if (Object.keys(prevBookingsStatusesRef.current).length === 0) {
            if (bookings.length > 0) {
                const initial: Record<string, number> = {};
                bookings.forEach((b) => {
                    initial[b.id] = b.status;
                });
                prevBookingsStatusesRef.current = initial;
            }
            return;
        }

        bookings.forEach((b) => {
            const prevStatus = prevBookingsStatusesRef.current[b.id];
            if (prevStatus !== undefined && prevStatus !== b.status) {
                if (b.status === BOOKING_STATUS.CONFIRMED) {
                    notificationRef.current?.show({
                        title: 'New Booking Assigned!',
                        message: `You have a new confirmed booking with ${b.customerName || 'Customer'} on ${b.date} at ${b.time}.`,
                        type: 'confirmed',
                    });
                } else if (b.status === BOOKING_STATUS.ONGOING) {
                    notificationRef.current?.show({
                        title: 'Session Started!',
                        message: `Notification sent to Customer & Admin. Enjoy your session with ${b.customerName || 'Customer'}!`,
                        type: 'ongoing',
                    });
                } else if (b.status === BOOKING_STATUS.COMPLETED) {
                    notificationRef.current?.show({
                        title: 'Session Completed!',
                        message: `Notification sent to Customer & Admin. Booking with ${b.customerName || 'Customer'} completed.`,
                        type: 'completed',
                    });
                } else if (b.status === BOOKING_STATUS.CANCELLED) {
                    notificationRef.current?.show({
                        title: 'Session Cancelled!',
                        message: `Notification sent to Customer & Admin. Booking with ${b.customerName || 'Customer'} cancelled.`,
                        type: 'cancelled',
                    });
                }
            }
            prevBookingsStatusesRef.current[b.id] = b.status;
        });
    }, [bookings]);

    const screenWidth = Dimensions.get('window').width;
    const pageScrollViewRef = useRef<ScrollView>(null);
    const tabs: TabType[] = ['upcoming', 'completed', 'cancelled'];

    const getCustomerImageSource = useCallback((profilePicture?: string | null) => {
        if (!profilePicture || profilePicture === 'null') return undefined;
        const trimmed = profilePicture.trim();
        if (!trimmed) return undefined;
        if (trimmed.startsWith('http') || trimmed.startsWith('file')) {
            return { uri: trimmed };
        }
        return { uri: `${API_CONFIG.BASE_URL}${trimmed.startsWith('/') ? '' : '/'}${trimmed}` };
    }, []);

    const extractUserFromResponse = useCallback((data: unknown): UserDto | undefined => {
        const value = data as any;
        if (Array.isArray(value?.items)) return value.items[0];
        if (Array.isArray(value)) return value[0];
        if (value?.uid || value?.fullName || value?.profilePicture) return value as UserDto;
        return undefined;
    }, []);

    const loadCustomersById = useCallback(
        async (customerIds: string[]): Promise<Record<string, UserDto>> => {
            const uniqueCustomerIds = Array.from(new Set(customerIds.filter(Boolean)));
            const customers = await Promise.all(
                uniqueCustomerIds.map(async (uid) => {
                    try {
                        const response = await getUsers({ uid, page: 1, pageSize: 1 });
                        const user = extractUserFromResponse(response.data);
                        return user ? ([uid, user] as const) : null;
                    } catch (error) {
                        console.warn('[BookingsTherapistScreen] Failed to load customer data:', uid, error);
                        return null;
                    }
                })
            );

            return customers.reduce<Record<string, UserDto>>((acc, entry) => {
                if (entry) acc[entry[0]] = entry[1];
                return acc;
            }, {});
        },
        [extractUserFromResponse]
    );

    const fetchTherapistBookings = useCallback(
        async (options?: { showLoading?: boolean }) => {
            if (isFetchingBookingsRef.current) return;

            const shouldShowLoading = options?.showLoading ?? false;
            isFetchingBookingsRef.current = true;
            if (shouldShowLoading) {
                setIsLoadingBookings(true);
            }
            setBookingsError(null);

            try {
                const session = await loadStoredSession();
                if (!session?.uid) {
                    setBookings([]);
                    setBookingsError('Not authenticated.');
                    return;
                }

                const response = await getBookings({
                    staffId: session.uid,
                    page: 1,
                    pageSize: 100,
                });

                const items = response.data?.items ?? [];
                const customersById = await loadCustomersById(items.map((item) => item.customerId));
                setBookings(
                    items.map((item: BookingResponse) => {
                        const customer = customersById[item.customerId];
                        return {
                            ...mapApiBookingToCard(item),
                            customerName: customer?.fullName,
                            customerImage: getCustomerImageSource(customer?.profilePicture),
                        };
                    })
                );
            } catch (error: any) {
                console.warn('[BookingsTherapistScreen] Failed to load therapist bookings:', error);
                if (shouldShowLoading || bookings.length === 0) {
                    setBookings([]);
                }
                setBookingsError(error?.message ?? 'Failed to load bookings.');
            } finally {
                setIsLoadingBookings(false);
                isFetchingBookingsRef.current = false;
            }
        },
        [bookings.length, getCustomerImageSource, loadCustomersById]
    );

    useEffect(() => {
        if (!isVisible) return;

        fetchTherapistBookings({ showLoading: bookings.length === 0 });
        const refreshInterval = setInterval(() => {
            fetchTherapistBookings();
        }, BOOKINGS_REFRESH_INTERVAL_MS);
        const appStateSubscription = AppState.addEventListener('change', (state) => {
            if (state === 'active') {
                fetchTherapistBookings();
            }
        });

        return () => {
            clearInterval(refreshInterval);
            appStateSubscription.remove();
        };
    }, [bookings.length, fetchTherapistBookings, isVisible]);

    // Handle page scroll to sync active tab
    const handlePageScroll = (event: any) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        const pageIndex = Math.round(offsetX / screenWidth);
        if (pageIndex >= 0 && pageIndex < tabs.length) {
            setActiveTab(tabs[pageIndex]);
        }
    };

    // Handle tab press to scroll to corresponding page
    const handleTabPress = (tab: TabType) => {
        const tabIndex = tabs.indexOf(tab);
        if (tabIndex >= 0 && pageScrollViewRef.current) {
            pageScrollViewRef.current.scrollTo({
                x: tabIndex * screenWidth,
                animated: true,
            });
        }
        setActiveTab(tab);
    };

    // Calendar logic
    const daysInMonth = useMemo(() => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const days = new Date(year, month + 1, 0).getDate();

        const calendarDays = [];
        // Fill padding for previous month
        for (let i = 0; i < firstDay; i++) {
            calendarDays.push(null);
        }
        // Fill current month days
        for (let i = 1; i <= days; i++) {
            calendarDays.push(new Date(year, month, i));
        }
        return calendarDays;
    }, [viewDate]);

    // Booking counts per day
    const bookingCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        bookings.forEach((booking: Booking) => {
            const dateKey = booking.date;
            counts[dateKey] = (counts[dateKey] || 0) + 1;
        });
        return counts;
    }, [bookings]);

    const formatDateKey = (date: Date) => {
        const m = (date.getMonth() + 1).toString().padStart(2, '0');
        const d = date.getDate().toString().padStart(2, '0');
        const y = date.getFullYear();
        return `${m}/${d}/${y}`;
    };

    const isSameDay = (d1: Date, d2: Date) => {
        return d1.getDate() === d2.getDate() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getFullYear() === d2.getFullYear();
    };

    // Simplified filtering logic as it's now handled per-page in the loop
    const getBookingsForTab = (tab: TabType, date?: Date) => {
        if (tab === 'upcoming') {
            const dateKey = formatDateKey(date || selectedDate);
            return bookings.filter((b: Booking) => 
                b.date === dateKey && 
                (b.status === BOOKING_STATUS.PENDING || 
                 b.status === BOOKING_STATUS.CONFIRMED || 
                 b.status === BOOKING_STATUS.ONGOING)
            );
        } else if (tab === 'completed') {
            return bookings.filter((b: Booking) => b.status === BOOKING_STATUS.COMPLETED);
        } else if (tab === 'cancelled') {
            return bookings.filter((b: Booking) => b.status === BOOKING_STATUS.CANCELLED);
        }
        return [];
    };

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const changeMonth = (offset: number) => {
        const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1);
        setViewDate(newDate);
    };

    const handleBookingStatusUpdate = async (bookingId: string, status: number) => {
        if (updatingBookingId) return;

        setUpdatingBookingId(bookingId);
        setBookingsError(null);

        try {
            const response = await updateBooking(bookingId, { status });
            if (!response.success) {
                throw new Error(response.message || 'Failed to update booking.');
            }

            setBookings((currentBookings) =>
                currentBookings.map((booking) =>
                    booking.id === bookingId ? { ...booking, status } : booking
                )
            );
        } catch (error: any) {
            console.warn('[BookingsTherapistScreen] Failed to update booking status:', error);
            setBookingsError(error?.message ?? 'Failed to update booking.');
        } finally {
            setUpdatingBookingId(null);
        }
    };

    return (
        <View className="flex-1 bg-white">
            <Header
                onProfilePress={onNavigateToProfile}
                onNotificationPress={onNavigateNotifications}
                profilePic={userProfilePic}
            />

            <TabNavigation
                activeTab={activeTab}
                onTabPress={handleTabPress}
                tabs={tabs}
            />

            <ScrollView
                ref={pageScrollViewRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={handlePageScroll}
                className="flex-1"
                decelerationRate="fast"
            >
                {tabs.map((tab) => {
                    const bookings = getBookingsForTab(tab);
                    const isUpcoming = tab === 'upcoming';

                    return (
                        <ScrollView
                            key={tab}
                            className="flex-1"
                            style={{ width: screenWidth }}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
                        >
                            {/* Calendar Card - Only show for Upcoming */}
                            {isUpcoming && (
                                <RisingItem delay={200} fadeIn={false}>
                                    <View
                                        className="mx-5 mt-2 p-4 rounded-3xl bg-white"
                                        style={{
                                            shadowColor: '#000',
                                            shadowOffset: { width: 0, height: 2 },
                                            shadowOpacity: 0.1,
                                            shadowRadius: 10,
                                            elevation: 5,
                                        }}
                                    >
                                        <RisingItem delay={250} offset={0}>
                                            {/* Calendar Header */}
                                            <View className="flex-row items-center justify-between mb-6 px-2">
                                                <Text className="text-lg font-bold" style={{ color: colors.text }}>
                                                    {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
                                                </Text>
                                                <View className="flex-row">
                                                    <TouchableOpacity
                                                        className="p-2 rounded-full mr-2"
                                                        style={{ backgroundColor: colors.background }}
                                                        onPress={() => changeMonth(-1)}
                                                    >
                                                        <Ionicons name="chevron-back" size={20} color={colors.text} />
                                                    </TouchableOpacity>
                                                    <TouchableOpacity
                                                        className="p-2 rounded-full"
                                                        style={{ backgroundColor: colors.background }}
                                                        onPress={() => changeMonth(1)}
                                                    >
                                                        <Ionicons name="chevron-forward" size={20} color={colors.text} />
                                                    </TouchableOpacity>
                                                </View>
                                            </View>

                                            {/* Week Days */}
                                            <View className="flex-row mb-2">
                                                {weekDays.map(day => (
                                                    <View key={day} className="flex-1 items-center">
                                                        <Text className="text-xs font-semibold" style={{ color: colors.icon }}>{day}</Text>
                                                    </View>
                                                ))}
                                            </View>

                                            {/* Calendar Grid */}
                                            <View className="flex-row flex-wrap">
                                                {daysInMonth.map((date, index) => {
                                                    if (!date) return <View key={`empty-${index}`} className="w-[14.28%] h-12" />;

                                                    const isSelected = isSameDay(date, selectedDate);
                                                    const dateKey = formatDateKey(date);
                                                    const count = bookingCounts[dateKey] || 0;
                                                    const isToday = isSameDay(date, new Date());

                                                    return (
                                                        <TouchableOpacity
                                                            key={dateKey}
                                                            className="w-[14.28%] h-14 items-center justify-center"
                                                            onPress={() => setSelectedDate(new Date(date))}
                                                        >
                                                            <View
                                                                className={`w-10 h-10 rounded-xl items-center justify-center relative ${isSelected ? 'bg-primary' : ''}`}
                                                                style={{ backgroundColor: isSelected ? primaryColor : 'transparent' }}
                                                            >
                                                                <Text
                                                                    className={`text-sm font-semibold ${isSelected ? 'text-white' : ''}`}
                                                                    style={{ color: isSelected ? 'white' : (isToday ? primaryColor : colors.text) }}
                                                                >
                                                                    {date.getDate()}
                                                                </Text>
                                                                {count > 0 && (
                                                                    <View
                                                                        className="absolute -top-1 -right-1 w-5 h-5 rounded-full items-center justify-center border-2 border-white"
                                                                        style={{ backgroundColor: isSelected ? '#FF9F0A' : primaryColor }}
                                                                    >
                                                                        <Text className="text-[10px] font-bold text-white leading-tight">
                                                                            {count}
                                                                        </Text>
                                                                    </View>
                                                                )}
                                                            </View>
                                                        </TouchableOpacity>
                                                    );
                                                })}
                                            </View>
                                        </RisingItem>
                                    </View>
                                </RisingItem>
                            )}

                            {/* Selected Day/Tab List */}
                            <View className="px-5">
                                {isUpcoming && (
                                    <RisingItem delay={300}>
                                        <View className="flex-row items-center justify-between mb-4 mt-8">
                                            <Text className="text-lg font-bold" style={{ color: colors.text }}>
                                                {isSameDay(selectedDate, new Date()) ? "Today's Schedule" : "Selected Day"}
                                            </Text>
                                            <Text className="text-sm font-medium" style={{ color: colors.icon }}>
                                                {bookings.length} {bookings.length === 1 ? 'Booking' : 'Bookings'}
                                            </Text>
                                        </View>
                                    </RisingItem>
                                )}

                                {isLoadingBookings && tab === activeTab ? (
                                    <RisingItem delay={400}>
                                        <View className="items-center justify-center py-10 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                                            <ActivityIndicator size="small" color={primaryColor} />
                                            <Text className="text-sm mt-3" style={{ color: colors.icon }}>Loading bookings...</Text>
                                        </View>
                                    </RisingItem>
                                ) : bookingsError && tab === activeTab ? (
                                    <RisingItem delay={400}>
                                        <View className="items-center justify-center py-10 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                                            <Ionicons name="warning-outline" size={48} color={colors.icon} />
                                            <Text className="text-sm font-semibold mt-3" style={{ color: colors.text }}>Unable to load bookings</Text>
                                            <Text className="text-xs mt-1 text-center px-6" style={{ color: colors.icon }}>
                                                {bookingsError}
                                            </Text>
                                        </View>
                                    </RisingItem>
                                ) : bookings.length > 0 ? (
                                    bookings.map((booking: Booking, index: number) => (
                                        <TherapistBookingCard
                                            key={booking.id}
                                            booking={booking}
                                            onPress={() => onNavigateBookingDetails?.(booking.id)}
                                            onViewDetails={onNavigateBookingDetails}
                                            onStartSession={(id) => handleBookingStatusUpdate(id, BOOKING_STATUS.ONGOING)}
                                            onCancel={(id) => handleBookingStatusUpdate(id, BOOKING_STATUS.CANCELLED)}
                                            onComplete={(id) => handleBookingStatusUpdate(id, BOOKING_STATUS.COMPLETED)}
                                            animateContent={activeTab === tab}
                                            animationDelay={350 + (index * 100)}
                                        />
                                    ))
                                ) : (
                                    <RisingItem delay={400}>
                                        <View className="items-center justify-center py-10 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                                            <Ionicons name="calendar-outline" size={48} color={colors.icon} />
                                            <Text className="text-sm mt-3" style={{ color: colors.icon }}>No bookings found</Text>
                                        </View>
                                    </RisingItem>
                                )}
                            </View>
                        </ScrollView>
                    );
                })}
            </ScrollView>
            <PopUpNotification ref={notificationRef} />
        </View>
    );
}
