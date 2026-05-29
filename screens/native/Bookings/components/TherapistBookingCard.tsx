import React from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import { Text } from '@/components/Text';
import { Ionicons } from '@expo/vector-icons';
import { Colors, primaryColor } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { RisingItem } from '@/components/native/RisingItem';
import { Booking, BOOKING_STATUS, getStatusText } from '../types/Booking';

interface TherapistBookingCardProps {
    booking: Booking;
    onPress?: () => void;
    onViewDetails?: (bookingId: string) => void;
    onCancel?: (bookingId: string) => void;
    onComplete?: (bookingId: string) => void;
    onStartSession?: (bookingId: string) => void;
    onRateCustomer?: (bookingId: string) => void;
    animateContent?: boolean;
    animationDelay?: number;
    contentVisible?: boolean;
}

const getStatusColor = (status: number, colors: any) => {
    switch (status) {
        case BOOKING_STATUS.COMPLETED:
        case BOOKING_STATUS.CONFIRMED:
            return primaryColor;
        case BOOKING_STATUS.CANCELLED:
            return '#EF4444';
        case BOOKING_STATUS.PENDING:
            return '#F59E0B';
        default:
            return colors.icon;
    }
};

export default function TherapistBookingCard({
    booking,
    onPress,
    onViewDetails,
    onCancel,
    onComplete,
    onStartSession,
    onRateCustomer,
    animateContent = false,
    animationDelay = 0,
    contentVisible = true
}: TherapistBookingCardProps) {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    const content = (
        <>
            {/* Top Section: Image and Details */}
            <View className="flex-row">
                {/* Customer Image */}
                <Image
                    source={booking.customerImage || require('../../../../assets/user.jpg')}
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
                        <View
                            className="px-3 py-1 rounded-full ml-2"
                            style={{ backgroundColor: getStatusColor(booking.status, colors) + '20' }}
                        >
                            <Text className="text-xs font-semibold" style={{ color: getStatusColor(booking.status, colors) }}>
                                {getStatusText(booking.status)}
                            </Text>
                        </View>
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
                <Text className="text-l font-semibold" style={{ color: colors.primary }}>
                    ₱{booking.price.toFixed(2)}
                </Text>
            </View>

            {/* Action Buttons */}
            <View className="flex-row">
                {booking.status === BOOKING_STATUS.CONFIRMED ? (
                    <TouchableOpacity
                        className="flex-1 flex-row items-center justify-center px-4 py-2 rounded-xl"
                        style={{ backgroundColor: primaryColor }}
                        onPress={(e) => {
                            e.stopPropagation();
                            onStartSession?.(booking.id);
                        }}
                    >
                        <Ionicons name="play-circle-outline" size={16} color="white" />
                        <Text className="text-sm font-semibold ml-2" style={{ color: 'white' }}>Start Session</Text>
                    </TouchableOpacity>
                ) : booking.status === BOOKING_STATUS.ONGOING ? (
                    <>
                        <TouchableOpacity
                            className="flex-1 flex-row items-center justify-center px-4 py-2 rounded-xl mr-2 border"
                            style={{ borderColor: colors.icon, backgroundColor: 'white' }}
                            onPress={(e) => {
                                e.stopPropagation();
                                onCancel?.(booking.id);
                            }}
                        >
                            <Ionicons name="close-circle-outline" size={16} color={colors.text} />
                            <Text className="text-sm font-semibold ml-2" style={{ color: colors.text }}>No-Show</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="flex-1 flex-row items-center justify-center px-4 py-2 rounded-xl"
                            style={{ backgroundColor: primaryColor }}
                            onPress={(e) => {
                                e.stopPropagation();
                                onComplete?.(booking.id);
                            }}
                        >
                            <Ionicons name="checkmark-circle-outline" size={16} color="white" />
                            <Text className="text-sm font-semibold ml-2" style={{ color: 'white' }}>Complete</Text>
                        </TouchableOpacity>
                    </>
                ) : (booking.status === BOOKING_STATUS.COMPLETED || booking.status === BOOKING_STATUS.CANCELLED) ? (
                    <TouchableOpacity
                        className="flex-1 flex-row items-center justify-center px-4 py-2 rounded-xl"
                        style={{ backgroundColor: primaryColor }}
                        onPress={(e) => {
                            e.stopPropagation();
                            onRateCustomer?.(booking.id);
                        }}
                    >
                        <Ionicons name="star-outline" size={16} color="white" />
                        <Text className="text-sm font-semibold ml-2" style={{ color: 'white' }}>Rate Customer</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        className="flex-1 flex-row items-center justify-center px-4 py-2 rounded-xl"
                        style={{ backgroundColor: primaryColor }}
                        onPress={(e) => {
                            e.stopPropagation();
                            onViewDetails?.(booking.id) || onPress?.();
                        }}
                    >
                        <Ionicons name="eye-outline" size={16} color="white" />
                        <Text className="text-sm font-semibold ml-2" style={{ color: 'white' }}>View Booking</Text>
                    </TouchableOpacity>
                )}
            </View>
        </>
    );

    const isClickable = booking.status !== BOOKING_STATUS.COMPLETED && booking.status !== BOOKING_STATUS.CANCELLED;

    return (
        <TouchableOpacity
            activeOpacity={isClickable ? 0.7 : 1}
            onPress={isClickable ? onPress : undefined}
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
