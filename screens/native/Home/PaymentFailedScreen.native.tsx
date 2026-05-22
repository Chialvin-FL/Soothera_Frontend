import React, { useRef, useEffect, useState } from 'react';
import { View, ScrollView, TouchableOpacity, Animated, ActivityIndicator } from 'react-native';
import { Text } from '@/components/Text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, primaryColor } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Service } from './types/Home';
import { SalonDetails, Therapist } from './types/SalonDetails';
import { updatePayment } from '@/api/endpoints/apiPayment';
import type { PaymentMutationResponse, UpdatePaymentRequest } from '@/api/types';

interface AddOn {
  id: string;
  name: string;
  price: number;
}

interface BookingData {
  bookingId?: string | null;
  service: Service | null;
  duration: string;
  addOns: AddOn[];
  therapist: Therapist | null;
  date: Date;
  time: Date;
  instructions: string;
  promoCode: string;
  salonDetails: SalonDetails;
  totalPrice: number;
  paymentId?: string | null;
  paymentMessage?: string;
  paymentRequest?: UpdatePaymentRequest;
  paymentResponse?: PaymentMutationResponse;
}

interface PaymentFailedScreenProps {
  bookingData: BookingData;
  onBack: () => void;
  onTryAgain?: () => void;
  onRetrySuccess?: (bookingData: BookingData) => void;
}

const errorColor = '#EF4444'; // Red color for error state

export default function PaymentFailedScreen({
  bookingData,
  onBack,
  onTryAgain,
  onRetrySuccess,
}: PaymentFailedScreenProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const isDark = colorScheme === 'dark';
  const [retrying, setRetrying] = useState(false);
  const [retryMessage, setRetryMessage] = useState(bookingData.paymentMessage);

  // Format price
  const formatPrice = (price: number) => {
    return `₱${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Format time
  const formatTime = (date: Date): string => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');
    return `${displayHours}:${displayMinutes} ${ampm}`;
  };

  // Calculate service price
  const calculateServicePrice = (): number => {
    if (!bookingData.service || !bookingData.duration) return 0;
    const basePrice = bookingData.service.price;
    const durationMinutes = parseInt(bookingData.duration.replace(' mins', ''));
    const baseDurationMinutes = 60;
    return Math.round((basePrice / baseDurationMinutes) * durationMinutes);
  };

  const servicePrice = calculateServicePrice();
  const addOnsTotal = bookingData.addOns.reduce((sum, addOn) => sum + addOn.price, 0);

  // Pulse animation for error icon background
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  useEffect(() => {
    setRetryMessage(bookingData.paymentMessage);
  }, [bookingData.paymentMessage]);

  const handleRetryPayment = async () => {
    if (!bookingData.paymentId || !bookingData.paymentRequest) {
      onTryAgain?.();
      return;
    }

    setRetrying(true);
    try {
      const response = await updatePayment(bookingData.paymentId, bookingData.paymentRequest);
      const nextBookingData: BookingData = {
        ...bookingData,
        paymentMessage: response.message,
        paymentResponse: response,
      };

      if (response.success) {
        onRetrySuccess?.(nextBookingData);
        return;
      }

      setRetryMessage(response.message);
    } catch (error: any) {
      setRetryMessage(error?.message ?? 'Payment retry failed. Please try again.');
    } finally {
      setRetrying(false);
    }
  };

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      {/* Header */}
      <View
        style={{
          paddingTop: insets.top,
        }}
      >
        <View className="flex-row items-center justify-between px-5 py-4">
          <TouchableOpacity onPress={onBack} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color={colors.icon} />
          </TouchableOpacity>
          <Text className="text-lg font-semibold" style={{ color: colors.text }}>
            Payment Failed
          </Text>
          <View style={{ width: 24 }} />
        </View>
      </View>

      {/* Content */}
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Error Icon and Title */}
        <View className="items-center justify-center py-8 px-5">
          <View className="w-24 h-24 items-center justify-center mb-4" style={{ position: 'relative' }}>
            <Animated.View
              className="absolute w-24 h-24 rounded-full"
              style={{
                backgroundColor: errorColor + '20',
                transform: [{ scale: pulseAnim }],
              }}
            />
            <View style={{ position: 'absolute' }}>
              <Ionicons name="close-circle" size={64} color={errorColor} />
            </View>
          </View>
          <Text className="text-2xl font-bold mb-2" style={{ color: colors.text }}>
            Payment Failed
          </Text>
          <Text 
            className="text-base text-center px-4" 
            style={{ color: colors.icon }}
          >
            {retryMessage ?? "We couldn't process your payment. Please check your payment details and try again."}
          </Text>
        </View>

        {/* Booking Summary */}
        <View className="px-5 mb-6">
          <Text className="text-lg font-semibold mb-4" style={{ color: colors.text }}>
            Booking Summary
          </Text>

          <View
            className="rounded-xl p-4 mb-4"
            style={{
              backgroundColor: isDark ? '#1f1f1f' : '#F9FAFB',
              borderWidth: 1,
              borderColor: isDark ? '#3a3a3a' : '#E5E7EB',
            }}
          >
            {/* Service */}
            {bookingData.service && (
              <View className="mb-3">
                <Text className="text-sm font-medium mb-1" style={{ color: colors.icon }}>
                  Service
                </Text>
                <View className="flex-row justify-between items-center">
                  <Text className="text-base font-semibold flex-1 mr-4" style={{ color: colors.text }}>
                    {bookingData.service.name}
                  </Text>
                  <Text className="text-base font-semibold" style={{ color: colors.text }}>
                    {formatPrice(servicePrice)}
                  </Text>
                </View>
                {bookingData.duration && (
                  <Text className="text-xs mt-1" style={{ color: colors.icon }}>
                    {bookingData.duration}
                  </Text>
                )}
              </View>
            )}

            {/* Add-ons */}
            {bookingData.addOns.length > 0 && (
              <>
                <View className="mb-2">
                  <Text className="text-sm font-medium" style={{ color: colors.icon }}>
                    Add-ons
                  </Text>
                </View>
                {bookingData.addOns.map((addOn) => (
                  <View key={addOn.id} className="flex-row justify-between items-start mb-3">
                    <View className="flex-1 mr-4">
                      <Text className="text-base font-semibold" style={{ color: colors.text }}>
                        {addOn.name}
                      </Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-base font-semibold" style={{ color: colors.text }}>
                        {formatPrice(addOn.price)}
                      </Text>
                    </View>
                  </View>
                ))}
              </>
            )}

            {/* Divider */}
            <View 
              className="h-px my-3" 
              style={{ backgroundColor: isDark ? '#3a3a3a' : '#E5E7EB' }} 
            />

            {/* Total */}
            <View className="flex-row justify-between items-center">
              <Text className="text-lg font-bold" style={{ color: colors.text }}>
                Total
              </Text>
              <Text className="text-xl font-bold" style={{ color: errorColor }}>
                {formatPrice(bookingData.totalPrice)}
              </Text>
            </View>
          </View>
        </View>

        {/* Additional Information - Receipt Style */}
        <View className="px-5 mb-6">
          <Text className="text-lg font-semibold mb-4" style={{ color: colors.text }}>
            Booking Details
          </Text>

          <View
            className="rounded-xl p-4"
            style={{
              backgroundColor: isDark ? '#1f1f1f' : '#F9FAFB',
              borderWidth: 1,
              borderColor: isDark ? '#3a3a3a' : '#E5E7EB',
            }}
          >
            {/* Massage Spa Name */}
            <View className="flex-row justify-between items-start mb-3">
              <Text className="text-sm font-medium" style={{ color: colors.icon }}>
                Massage Spa
              </Text>
              <View className="flex-1 ml-4 items-end">
                <Text className="text-sm font-semibold text-right" style={{ color: colors.text }}>
                  {bookingData.salonDetails.name}
                </Text>
              </View>
            </View>

            {/* Date */}
            <View className="flex-row justify-between items-start mb-3">
              <Text className="text-sm font-medium" style={{ color: colors.icon }}>
                Date
              </Text>
              <View className="flex-1 ml-4 items-end">
                <Text className="text-sm font-semibold text-right" style={{ color: colors.text }}>
                  {bookingData.date.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </Text>
              </View>
            </View>

            {/* Time */}
            <View className="flex-row justify-between items-start mb-3">
              <Text className="text-sm font-medium" style={{ color: colors.icon }}>
                Time
              </Text>
              <View className="flex-1 ml-4 items-end">
                <Text className="text-sm font-semibold text-right" style={{ color: colors.text }}>
                  {formatTime(bookingData.time)}
                </Text>
              </View>
            </View>

            {/* Therapist */}
            <View className="flex-row justify-between items-start mb-3">
              <Text className="text-sm font-medium" style={{ color: colors.icon }}>
                Therapist
              </Text>
              <View className="flex-1 ml-4 items-end">
                <Text className="text-sm font-semibold text-right" style={{ color: colors.text }}>
                  {bookingData.therapist ? bookingData.therapist.name : 'Any Therapist'}
                </Text>
              </View>
            </View>

            {/* Instructions */}
            {bookingData.instructions && (
              <View className="flex-row justify-between items-start mb-3">
                <Text className="text-sm font-medium" style={{ color: colors.icon }}>
                  Instructions
                </Text>
                <View className="flex-1 ml-4 items-end">
                  <Text className="text-sm font-semibold text-right" style={{ color: colors.text }}>
                    {bookingData.instructions}
                  </Text>
                </View>
              </View>
            )}

            {/* Promo Code */}
            {bookingData.promoCode && (
              <View className="flex-row justify-between items-start">
                <Text className="text-sm font-medium" style={{ color: colors.icon }}>
                  Promo Code
                </Text>
                <View className="flex-1 ml-4 items-end">
                  <Text className="text-sm font-semibold text-right" style={{ color: colors.text }}>
                    {bookingData.promoCode}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View
        className="px-5 py-4 border-t"
        style={{
          borderTopColor: isDark ? '#3a3a3a' : '#E5E7EB',
          paddingBottom: insets.bottom || 16,
          backgroundColor: colors.background,
        }}
      >
        {onTryAgain || (bookingData.paymentId && bookingData.paymentRequest) ? (
          <View style={{ gap: 12 }}>
            <TouchableOpacity
              className="w-full flex-row items-center justify-center px-4 py-4 rounded-xl"
              style={{
                backgroundColor: errorColor,
              }}
              onPress={handleRetryPayment}
              disabled={retrying}
              activeOpacity={0.7}
            >
              {retrying ? (
                <>
                  <ActivityIndicator size="small" color="white" style={{ marginRight: 8 }} />
                  <Text className="text-base font-semibold" style={{ color: 'white' }}>
                    Retrying...
                  </Text>
                </>
              ) : (
                <Text
                  className="text-base font-semibold"
                  style={{
                    color: 'white',
                  }}
                >
                  Try Again
                </Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              className="w-full flex-row items-center justify-center px-4 py-4 rounded-xl border"
              style={{
                borderColor: isDark ? '#3a3a3a' : '#E5E7EB',
                backgroundColor: 'transparent',
              }}
              onPress={onBack}
              activeOpacity={0.7}
            >
              <Text
                className="text-base font-semibold"
                style={{
                  color: colors.text,
                }}
              >
                Back to Booking
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            className="w-full flex-row items-center justify-center px-4 py-4 rounded-xl"
            style={{
              backgroundColor: errorColor,
            }}
            onPress={onBack}
            activeOpacity={0.7}
          >
            <Text
              className="text-base font-semibold"
              style={{
                color: 'white',
              }}
            >
              Back to Booking
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
