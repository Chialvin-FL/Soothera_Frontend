import React, { useState, useMemo, useRef, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/Text';
import { Ionicons } from '@expo/vector-icons';
import { Colors, primaryColor } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Header } from '@/components/native/Header';
import { RisingItem } from '@/components/native/RisingItem';
import { therapistBookings } from './configs/mockTherapistBookingsData';
import { Booking, BOOKING_STATUS } from './types/Booking';
import TherapistBookingCard from './components/TherapistBookingCard';
import TabNavigation, { TabType } from './components/TabNavigation';

interface BookingsTherapistScreenProps {
    onNavigateToProfile?: () => void;
    onNavigateNotifications?: () => void;
    onNavigateBookingDetails?: (bookingId: string) => void;
    isActive?: boolean;
}

export default function BookingsTherapistScreen({
    onNavigateToProfile,
    onNavigateNotifications,
    onNavigateBookingDetails,
    isActive = true
}: BookingsTherapistScreenProps) {
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const isDark = colorScheme === 'dark';

    const [selectedDate, setSelectedDate] = useState(new Date());
    const [viewDate, setViewDate] = useState(new Date());
    const [activeTab, setActiveTab] = useState<TabType>('upcoming');

    const screenWidth = Dimensions.get('window').width;
    const pageScrollViewRef = useRef<ScrollView>(null);
    const tabs: TabType[] = ['upcoming', 'completed', 'cancelled'];

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
        therapistBookings.forEach((booking: Booking) => {
            // date format in mock is MM/DD/YYYY
            const dateKey = booking.date;
            counts[dateKey] = (counts[dateKey] || 0) + 1;
        });
        return counts;
    }, [therapistBookings]);

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
            return therapistBookings.filter((b: Booking) => b.date === dateKey);
        } else if (tab === 'completed') {
            return therapistBookings.filter((b: Booking) => b.status === BOOKING_STATUS.COMPLETED);
        } else if (tab === 'cancelled') {
            return therapistBookings.filter((b: Booking) => b.status === BOOKING_STATUS.CANCELLED);
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

    return (
        <View className="flex-1 bg-white">
            <Header
                onProfilePress={onNavigateToProfile}
                onNotificationPress={onNavigateNotifications}
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

                                {bookings.length > 0 ? (
                                    bookings.map((booking: Booking, index: number) => (
                                        <TherapistBookingCard
                                            key={booking.id}
                                            booking={booking}
                                            onPress={() => onNavigateBookingDetails?.(booking.id)}
                                            onViewDetails={onNavigateBookingDetails}
                                            onCancel={(id) => console.log('Cancel', id)}
                                            onComplete={(id) => console.log('Complete', id)}
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
        </View>
    );
}
