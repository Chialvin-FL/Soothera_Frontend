import React from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import { Text } from '@/components/Text';
import { Ionicons } from '@expo/vector-icons';
import { Colors, primaryColor } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { API_CONFIG } from '@/api/config';
import { RisingItem } from '@/components/native/RisingItem';
import { Booking, BOOKING_STATUS, getStatusText } from '../types/Booking';

type TabType = 'upcoming' | 'completed' | 'cancelled' | 'all';

interface AdminBookingCardProps {
    booking: Booking;
    tabType: TabType;
    onPress?: () => void;
    onAccept?: (bookingId: string) => void;
    onDecline?: (bookingId: string) => void;
    onViewBooking?: (bookingId: string) => void;
    onRateCustomer?: (bookingId: string) => void;
    onRefund?: (bookingId: string) => void;
    animateContent?: boolean;
    animationDelay?: number;
    contentVisible?: boolean;
}

const getStatusColor = (status: number, colors: any) => {
    switch (status) {
        case BOOKING_STATUS.COMPLETED:
        case BOOKING_STATUS.CONFIRMED:
        case BOOKING_STATUS.ONGOING:
            return primaryColor; // Green/teal
        case BOOKING_STATUS.CANCELLED:
            return '#EF4444'; // Red
        case BOOKING_STATUS.PENDING:
            return '#F59E0B'; // Yellow/Orange
        default:
            return colors.icon;
    }
};

const resolveImageSource = (image: any) => {
    if (!image || image === 'null') return require('../../../../assets/user.jpg');
    if (typeof image !== 'string') return image;
    const trimmed = image.trim();
    if (!trimmed) return require('../../../../assets/user.jpg');
    if (trimmed.startsWith('http') || trimmed.startsWith('file')) return { uri: trimmed };
    return { uri: `${API_CONFIG.BASE_URL}${trimmed.startsWith('/') ? '' : '/'}${trimmed}` };
};

export default function AdminBookingCard({
    booking,
    tabType,
    onPress,
    onAccept,
    onDecline,
    onViewBooking,
    onRateCustomer,
    onRefund,
    animateContent = false,
    animationDelay = 0,
    contentVisible = true
}: AdminBookingCardProps) {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    // Status booleans
    const isPending = booking.status === BOOKING_STATUS.PENDING;
    const isConfirmed = booking.status === BOOKING_STATUS.CONFIRMED;
    const isOngoing = booking.status === BOOKING_STATUS.ONGOING;
    const isCompleted = booking.status === BOOKING_STATUS.COMPLETED;
    const isCancelled = booking.status === BOOKING_STATUS.CANCELLED;
    const isUpcomingStatus = isPending || isConfirmed || isOngoing;

    const showStatusTag =
        tabType === 'upcoming' ||
        (tabType === 'all' && (isUpcomingStatus || isCompleted || isCancelled));

    const content = (
        <>
            {/* Top Section: Image and Details */}
            <View className="flex-row">
                {/* Image */}
                <Image
                    source={resolveImageSource(booking.customerImage)}
                    className="w-20 h-20 rounded-xl mr-3"
                    resizeMode="cover"
                />

                {/* Details */}
                <View className="flex-1">
                    {/* Service Name and Status */}
                    <View className="flex-row items-start justify-between mb-1">
                        <Text
                            className="text-lg font-bold flex-1"
                            style={{ color: colors.text }}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                        >
                            {booking.serviceName}
                        </Text>
                        {showStatusTag && (
                            <View
                                className="px-3 py-1 rounded-full ml-2"
                                style={{ backgroundColor: getStatusColor(booking.status, colors) + '20' }}
                            >
                                <Text className="text-xs font-semibold" style={{ color: getStatusColor(booking.status, colors) }}>
                                    {getStatusText(booking.status)}
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Date and Customer Name */}
                    <View className="flex-row items-center mb-1">
                        <Ionicons name="calendar-outline" size={14} color={colors.icon} />
                        <Text className="text-xs ml-1 mr-2" style={{ color: colors.icon }}>
                            {booking.date}
                        </Text>
                        <Text className="text-xs mr-2" style={{ color: colors.icon }}>•</Text>
                        <Ionicons name="person-outline" size={14} color={colors.icon} />
                        <Text className="text-xs ml-1" style={{ color: colors.icon }} numberOfLines={1}>
                            {booking.customerName || 'Customer'}
                        </Text>
                    </View>

                    {/* Time */}
                    <View className="flex-row items-center mb-1">
                        <Ionicons name="time-outline" size={14} color={colors.icon} />
                        <Text className="text-xs ml-1" style={{ color: colors.icon }}>
                            {booking.time}
                        </Text>
                    </View>

                </View>
            </View>

            {/* Price Row */}
            <View className="mb-3 flex-row justify-end">
                <Text className="text-l" style={{ color: colors.primary }}>
                    ₱{booking.price.toFixed(2)}
                </Text>
            </View>

            {/* Action Buttons */}
            <View className="flex-row">
                {isPending && (
                    <>
                        <TouchableOpacity
                            className="flex-1 flex-row items-center justify-center px-4 py-2 rounded-xl mr-2 border"
                            style={{ borderColor: colors.icon, backgroundColor: 'white' }}
                            onPress={(e) => {
                                e.stopPropagation();
                                onDecline?.(booking.id);
                            }}
                        >
                            <Ionicons name="close" size={16} color={colors.text} />
                            <Text className="text-sm font-semibold ml-2" style={{ color: colors.text }}>Decline</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="flex-1 flex-row items-center justify-center px-4 py-2 rounded-xl"
                            style={{ backgroundColor: primaryColor }}
                            onPress={(e) => {
                                e.stopPropagation();
                                onAccept?.(booking.id);
                            }}
                        >
                            <Ionicons name="checkmark" size={16} color="white" />
                            <Text className="text-sm font-semibold ml-2" style={{ color: 'white' }}>Accept</Text>
                        </TouchableOpacity>
                    </>
                )}

                {(isConfirmed || isOngoing) && (
                    <TouchableOpacity
                        className="flex-1 flex-row items-center justify-center px-4 py-2 rounded-xl"
                        style={{ backgroundColor: primaryColor }}
                        onPress={(e) => {
                            e.stopPropagation();
                            onViewBooking?.(booking.id) || onPress?.();
                        }}
                    >
                        <Ionicons name="eye-outline" size={16} color="white" />
                        <Text className="text-sm font-semibold ml-2" style={{ color: 'white' }}>View Booking</Text>
                    </TouchableOpacity>
                )}

                {isCompleted && (
                    <>
                        <TouchableOpacity
                            className="flex-1 flex-row items-center justify-center px-4 py-2 rounded-xl mr-2 border"
                            style={{ borderColor: colors.icon, backgroundColor: 'white' }}
                            onPress={(e) => {
                                e.stopPropagation();
                                onRateCustomer?.(booking.id);
                            }}
                        >
                            <Ionicons name="star-outline" size={16} color={colors.text} />
                            <Text className="text-sm font-semibold ml-2" style={{ color: colors.text }}>Rate Customer</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="flex-1 flex-row items-center justify-center px-4 py-2 rounded-xl"
                            style={{ backgroundColor: primaryColor }}
                            onPress={(e) => {
                                e.stopPropagation();
                                onViewBooking?.(booking.id) || onPress?.();
                            }}
                        >
                            <Ionicons name="eye-outline" size={16} color="white" />
                            <Text className="text-sm font-semibold ml-2" style={{ color: 'white' }}>View Booking</Text>
                        </TouchableOpacity>
                    </>
                )}

                {isCancelled && (
                    <>
                        <TouchableOpacity
                            className="flex-1 flex-row items-center justify-center px-4 py-2 rounded-xl mr-2 border"
                            style={{ borderColor: colors.icon, backgroundColor: 'white' }}
                            onPress={(e) => {
                                e.stopPropagation();
                                onRateCustomer?.(booking.id);
                            }}
                        >
                            <Ionicons name="star-outline" size={16} color={colors.text} />
                            <Text className="text-sm font-semibold ml-2" style={{ color: colors.text }}>Rate Customer</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="flex-1 flex-row items-center justify-center px-4 py-2 rounded-xl"
                            style={{ backgroundColor: primaryColor }}
                            onPress={(e) => {
                                e.stopPropagation();
                                onRefund?.(booking.id);
                            }}
                        >
                            <Ionicons name="cash-outline" size={16} color="white" />
                            <Text className="text-sm font-semibold ml-2" style={{ color: 'white' }}>Refund</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </>
    );

    return (
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={onPress}
            className="bg-white rounded-2xl p-4 mb-4"
            style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 3,
                elevation: 2,
            }}
        >
            {animateContent ? (
                <RisingItem delay={animationDelay} offset={12} visible={contentVisible}>
                    <View>{content}</View>
                </RisingItem>
            ) : (
                content
            )}
        </TouchableOpacity>
    );
}
