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
                    className="w-16 h-16 rounded-xl mr-3"
                    resizeMode="cover"
                />

                {/* Details */}
                <View className="flex-1">
                    {/* Service Name and Status */}
                    <View className="flex-row items-start justify-between mb-1">
                        <Text
                            className="text-base font-bold flex-1"
                            style={{ color: colors.text }}
                            numberOfLines={1}
                        >
                            {booking.serviceName}
                        </Text>
                        <View
                            className="px-2 py-0.5 rounded-full ml-2"
                            style={{ backgroundColor: getStatusColor(booking.status, colors) + '20' }}
                        >
                            <Text className="text-[10px] font-semibold" style={{ color: getStatusColor(booking.status, colors) }}>
                                {getStatusText(booking.status)}
                            </Text>
                        </View>
                    </View>

                    {/* Customer Name */}
                    <View className="flex-row items-center mb-1">
                        <Ionicons name="person-outline" size={12} color={colors.icon} />
                        <Text className="text-xs ml-1" style={{ color: colors.icon }} numberOfLines={1}>
                            {booking.customerName || 'Customer'}
                        </Text>
                    </View>

                    {/* Time */}
                    <View className="flex-row items-center">
                        <Ionicons name="time-outline" size={12} color={colors.icon} />
                        <Text className="text-xs ml-1" style={{ color: colors.icon }}>
                            {booking.time}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Price Label and View Button */}
            <View className="mt-3 pt-3 border-t border-gray-100 flex-row items-center justify-between">
                <Text className="text-sm font-semibold" style={{ color: colors.primary }}>
                    ₱{booking.price.toFixed(2)}
                </Text>

                <TouchableOpacity
                    className="flex-row items-center"
                    onPress={(e) => {
                        e.stopPropagation();
                        onViewDetails?.(booking.id);
                    }}
                >
                    <Text className="text-xs font-medium mr-1" style={{ color: colors.primary }}>View Details</Text>
                    <Ionicons name="chevron-forward" size={14} color={colors.primary} />
                </TouchableOpacity>
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
