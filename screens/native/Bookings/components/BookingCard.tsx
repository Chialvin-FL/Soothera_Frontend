import React from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import { Text } from '@/components/Text';
import { Ionicons } from '@expo/vector-icons';
import { Colors, primaryColor } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { RisingItem } from '@/components/native/RisingItem';
import { Booking, BOOKING_STATUS, getStatusText } from '../types/Booking';

type TabType = 'upcoming' | 'completed' | 'cancelled' | 'all';

interface BookingCardProps {
  booking: Booking;
  tabType: TabType;
  onPress?: () => void;
  onReview?: (bookingId: string) => void;
  onRebook?: (booking: Booking) => void;
  animateContent?: boolean;
  animationDelay?: number;
  contentVisible?: boolean;
}

const getStatusColor = (status: number, colors: any) => {
  switch (status) {
    case BOOKING_STATUS.COMPLETED:
    case BOOKING_STATUS.CONFIRMED:
      return primaryColor; // Green/teal
    case BOOKING_STATUS.CANCELLED:
      return '#EF4444'; // Red
    case BOOKING_STATUS.PENDING:
      return '#F59E0B'; // Yellow/Orange
    default:
      return colors.icon;
  }
};

export default function BookingCard({ booking, tabType, onPress, onReview, onRebook, animateContent = false, animationDelay = 0, contentVisible = true }: BookingCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  // Determine which buttons to show based on booking status when in 'all' tab
  const showUpcomingButtons = tabType === 'upcoming' || (tabType === 'all' && (booking.status === BOOKING_STATUS.CONFIRMED || booking.status === BOOKING_STATUS.PENDING));
  const showManageBookingButton = showUpcomingButtons && booking.status !== BOOKING_STATUS.CONFIRMED;
  const showCompletedButtons = tabType === 'completed' || (tabType === 'all' && booking.status === BOOKING_STATUS.COMPLETED);
  const showCancelledButtons = tabType === 'cancelled' || (tabType === 'all' && booking.status === BOOKING_STATUS.CANCELLED);
  const showStatusTag = tabType === 'upcoming' || (tabType === 'all' && (booking.status === BOOKING_STATUS.CONFIRMED || booking.status === BOOKING_STATUS.PENDING || booking.status === BOOKING_STATUS.COMPLETED || booking.status === BOOKING_STATUS.CANCELLED));

  const content = (
    <>
      {/* Top Section: Image and Details */}
      <View className="flex-row">
        {/* Image */}
        <Image
          source={require('../../../../assets/salon.jpg')}
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

          {/* Date and Spa Name */}
          <View className="flex-row items-center mb-1">
            <Ionicons name="calendar-outline" size={14} color={colors.icon} />
            <Text className="text-xs ml-1 mr-2" style={{ color: colors.icon }}>
              {booking.date || 'N/A'}
            </Text>
            <Text className="text-xs mr-2" style={{ color: colors.icon }}>•</Text>
            <Ionicons name="business-outline" size={14} color={colors.icon} />
            <Text className="text-xs ml-1" style={{ color: colors.icon }}>
              {booking.spaName || 'N/A'}
            </Text>
          </View>

          {/* Time */}
          <View className="flex-row items-center mb-1">
            <Ionicons name="time-outline" size={14} color={colors.icon} />
            <Text className="text-xs ml-1" style={{ color: colors.icon }}>
              {booking.time || 'N/A'}
            </Text>
          </View>

        </View>
      </View>

      {/* Price Row */}
      <View className="mb-3 flex-row justify-end">
        <Text className="text-l" style={{ color: colors.primary }}>
          {booking.priceDisplay ?? `₱${booking.price.toFixed(2)}`}
        </Text>
      </View>

      {/* Action Buttons */}
      <View className="flex-row">
        {showUpcomingButtons && (
          <>
            <TouchableOpacity
              className="flex-1 flex-row items-center justify-center px-4 py-2 rounded-xl mr-2"
              style={{ backgroundColor: primaryColor }}
            >
              <Ionicons name="location-outline" size={16} color="white" />
              <Text className="text-sm font-semibold ml-2" style={{ color: 'white' }}>
                Directions
              </Text>
            </TouchableOpacity>
            {showManageBookingButton && (
              <TouchableOpacity
                className="flex-1 flex-row items-center justify-center px-4 py-2 rounded-xl border"
                style={{ borderColor: colors.icon, backgroundColor: 'white' }}
                onPress={(e) => {
                  e.stopPropagation();
                  onPress?.();
                }}
              >
                <Ionicons name="checkmark-circle-outline" size={16} color={colors.text} />
                <Text className="text-sm font-semibold ml-2" style={{ color: colors.text }}>Manage Booking</Text>
              </TouchableOpacity>
            )}
          </>
        )}

        {showCompletedButtons && (
          <>
            <TouchableOpacity
              className="flex-1 flex-row items-center justify-center px-4 py-2 rounded-xl mr-2"
              style={{ backgroundColor: primaryColor }}
              onPress={(e) => {
                e.stopPropagation();
                onRebook?.(booking);
              }}
            >
              <Ionicons name="refresh" size={16} color="white" />
              <Text className="text-sm text-white font-semibold ml-2">Re-book</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 flex-row items-center justify-center px-4 py-2 rounded-xl border"
              style={{ borderColor: colors.icon, backgroundColor: 'white' }}
              onPress={(e) => {
                e.stopPropagation();
                onReview?.(booking.id);
              }}
            >
              <Ionicons name="star-outline" size={16} color={colors.text} />
              <Text className="text-sm font-semibold ml-2" style={{ color: colors.text }}>
                Review
              </Text>
            </TouchableOpacity>
          </>
        )}

        {showCancelledButtons && (
          <TouchableOpacity
            className="flex-1 flex-row items-center justify-center px-4 py-2 rounded-xl"
            style={{ backgroundColor: primaryColor }}
            onPress={(e) => {
              e.stopPropagation();
              onRebook?.(booking);
            }}
          >
            <Ionicons name="refresh" size={16} color="white" />
            <Text className="text-sm text-white font-semibold ml-2">Re-book</Text>
          </TouchableOpacity>
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
