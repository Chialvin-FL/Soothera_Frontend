import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/Text';
import { Colors, primaryColor } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createPayment } from '@/api/endpoints/apiPayment';
import { PaymentType } from '@/api/types';
import type { PaymentMutationResponse, UpdatePaymentRequest } from '@/api/types';
import type { Service } from './types/Home';
import type { SalonDetails, Therapist } from './types/SalonDetails';

interface BookingData {
  bookingId?: string | null;
  service: Service | null;
  duration: string;
  addOns: Array<{ id: string; name: string; price: number }>;
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

interface PaymentDetailsScreenProps {
  bookingData: BookingData;
  onBack: () => void;
  onPaymentSuccess: (bookingData: BookingData) => void;
  onPaymentFailed: (bookingData: BookingData) => void;
}

function onlyDigits(value: string): string {
  return value.replace(/\D/g, '');
}

function formatCardNumber(value: string): string {
  return onlyDigits(value)
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, '$1 ');
}

function formatExpiry(value: string): string {
  const digits = onlyDigits(value).slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

function formatPrice(price: number): string {
  return `PHP ${price.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function PaymentDetailsScreen({
  bookingData,
  onBack,
  onPaymentSuccess,
  onPaymentFailed,
}: PaymentDetailsScreenProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();

  const [paymentType, setPaymentType] = useState<PaymentType>(PaymentType.Full);
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [billingName, setBillingName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const cardDigits = onlyDigits(cardNumber);
  const cvvDigits = onlyDigits(cvv).slice(0, 3);
  const canSubmit =
    !!bookingData.bookingId &&
    cardDigits.length === 16 &&
    cvvDigits.length === 3 &&
    /^(0[1-9]|1[0-2])\/\d{2}$/.test(expiryDate) &&
    billingName.trim().length > 1 &&
    !submitting;

  const cardBrand = useMemo(() => {
    if (cardDigits.startsWith('4')) return 'VISA';
    if (/^5[1-5]/.test(cardDigits)) return 'MC';
    return 'CARD';
  }, [cardDigits]);

  const displayedAmount =
    paymentType === PaymentType.Partial ? bookingData.totalPrice * 0.5 : bookingData.totalPrice;
  const maskedPreview = cardNumber || '0000 0000 0000 0000';

  const submitPayment = async () => {
    if (!bookingData.bookingId) {
      Alert.alert('Payment unavailable', 'Booking reference is missing. Please try booking again.');
      return;
    }

    if (!canSubmit) {
      Alert.alert(
        'Check payment details',
        'Please enter a valid card number, expiry date, CVV, and billing name.'
      );
      return;
    }

    const retryPayload: UpdatePaymentRequest = {
      cardNumber: cardDigits,
      cvv: cvvDigits,
      expiryDate,
      billingName: billingName.trim(),
    };

    setSubmitting(true);
    try {
      const response = await createPayment({
        bookingId: bookingData.bookingId,
        paymentType,
        cardNumber: cardDigits,
        cvv: cvvDigits,
        expiryDate,
        billingName: billingName.trim(),
      });

      const nextBookingData: BookingData = {
        ...bookingData,
        paymentId: response.id ?? null,
        paymentMessage: response.message,
        paymentRequest: retryPayload,
        paymentResponse: response,
      };

      if (response.success) {
        onPaymentSuccess(nextBookingData);
      } else {
        onPaymentFailed(nextBookingData);
      }
    } catch (error: any) {
      onPaymentFailed({
        ...bookingData,
        paymentMessage: error?.message ?? 'We could not reach the payment processor.',
        paymentRequest: retryPayload,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ backgroundColor: colors.background }}>
      <View style={{ paddingTop: insets.top }}>
        <View className="flex-row items-center justify-between px-5 py-4">
          <TouchableOpacity onPress={onBack} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color={colors.icon} />
          </TouchableOpacity>
          <Text className="text-lg font-semibold" style={{ color: colors.text }}>
            Payment Details
          </Text>
          <View style={{ width: 24 }} />
        </View>
      </View>

      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}>
        <View className="px-5 pt-2">
          <View
            className="mb-5 rounded-xl p-5"
            style={{
              backgroundColor: primaryColor,
              minHeight: 188,
            }}>
            <View className="flex-row items-start justify-between">
              <View>
                <Text className="text-xs font-semibold text-white/80">Amount due</Text>
                <Text className="mt-1 text-2xl font-bold text-white">
                  {formatPrice(displayedAmount)}
                </Text>
              </View>
              <View className="rounded-full bg-white/20 px-3 py-1">
                <Text className="text-xs font-bold text-white">{cardBrand}</Text>
              </View>
            </View>

            <View className="mt-9">
              <Text className="text-xl font-semibold tracking-wide text-white">
                {maskedPreview.padEnd(19, '0')}
              </Text>
              <View className="mt-5 flex-row justify-between">
                <View>
                  <Text className="text-xs text-white/70">Cardholder</Text>
                  <Text className="mt-1 text-sm font-semibold text-white" numberOfLines={1}>
                    {billingName.trim() || 'Billing name'}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-xs text-white/70">Expires</Text>
                  <Text className="mt-1 text-sm font-semibold text-white">
                    {expiryDate || 'MM/YY'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View
            className="mb-5 flex-row rounded-xl p-1"
            style={{ backgroundColor: isDark ? '#1f1f1f' : '#F3F4F6' }}>
            {[
              { label: 'Full', value: PaymentType.Full },
              { label: 'Partial', value: PaymentType.Partial },
            ].map((option) => {
              const active = paymentType === option.value;
              return (
                <TouchableOpacity
                  key={option.value}
                  className="flex-1 items-center rounded-lg py-3"
                  style={{ backgroundColor: active ? primaryColor : 'transparent' }}
                  onPress={() => setPaymentType(option.value)}
                  activeOpacity={0.8}>
                  <Text
                    className="text-sm font-semibold"
                    style={{ color: active ? 'white' : colors.text }}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={{ gap: 14 }}>
            <View>
              <Text className="mb-2 text-sm font-semibold" style={{ color: colors.text }}>
                Card number
              </Text>
              <TextInput
                className="rounded-xl border px-4 py-4 text-base"
                style={{
                  borderColor: isDark ? '#3a3a3a' : '#E5E7EB',
                  backgroundColor: isDark ? '#1f1f1f' : '#F9FAFB',
                  color: colors.text,
                }}
                keyboardType="number-pad"
                placeholder="1234 5678 9012 3456"
                placeholderTextColor={colors.icon}
                value={cardNumber}
                onChangeText={(value) => setCardNumber(formatCardNumber(value))}
                maxLength={19}
              />
            </View>

            <View className="flex-row" style={{ gap: 12 }}>
              <View className="flex-1">
                <Text className="mb-2 text-sm font-semibold" style={{ color: colors.text }}>
                  Expiry
                </Text>
                <TextInput
                  className="rounded-xl border px-4 py-4 text-base"
                  style={{
                    borderColor: isDark ? '#3a3a3a' : '#E5E7EB',
                    backgroundColor: isDark ? '#1f1f1f' : '#F9FAFB',
                    color: colors.text,
                  }}
                  keyboardType="number-pad"
                  placeholder="MM/YY"
                  placeholderTextColor={colors.icon}
                  value={expiryDate}
                  onChangeText={(value) => setExpiryDate(formatExpiry(value))}
                  maxLength={5}
                />
              </View>
              <View className="flex-1">
                <Text className="mb-2 text-sm font-semibold" style={{ color: colors.text }}>
                  CVV
                </Text>
                <TextInput
                  className="rounded-xl border px-4 py-4 text-base"
                  style={{
                    borderColor: isDark ? '#3a3a3a' : '#E5E7EB',
                    backgroundColor: isDark ? '#1f1f1f' : '#F9FAFB',
                    color: colors.text,
                  }}
                  keyboardType="number-pad"
                  placeholder="123"
                  placeholderTextColor={colors.icon}
                  secureTextEntry
                  value={cvvDigits}
                  onChangeText={(value) => setCvv(onlyDigits(value).slice(0, 3))}
                  maxLength={3}
                />
              </View>
            </View>

            <View>
              <Text className="mb-2 text-sm font-semibold" style={{ color: colors.text }}>
                Billing name
              </Text>
              <TextInput
                className="rounded-xl border px-4 py-4 text-base"
                style={{
                  borderColor: isDark ? '#3a3a3a' : '#E5E7EB',
                  backgroundColor: isDark ? '#1f1f1f' : '#F9FAFB',
                  color: colors.text,
                }}
                placeholder="Name on card"
                placeholderTextColor={colors.icon}
                autoCapitalize="words"
                value={billingName}
                onChangeText={setBillingName}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      <View
        className="border-t px-5 py-4"
        style={{
          borderTopColor: isDark ? '#3a3a3a' : '#E5E7EB',
          backgroundColor: colors.background,
          paddingBottom: insets.bottom || 16,
        }}>
        <TouchableOpacity
          className="w-full flex-row items-center justify-center rounded-xl px-4 py-4"
          style={{
            backgroundColor: canSubmit ? primaryColor : isDark ? '#3a3a3a' : '#E5E7EB',
          }}
          disabled={!canSubmit}
          onPress={submitPayment}
          activeOpacity={0.75}>
          {submitting ? (
            <>
              <ActivityIndicator size="small" color="white" style={{ marginRight: 8 }} />
              <Text className="text-base font-semibold" style={{ color: 'white' }}>
                Processing...
              </Text>
            </>
          ) : (
            <Text
              className="text-base font-semibold"
              style={{ color: canSubmit ? 'white' : isDark ? '#666' : '#999' }}>
              Pay {formatPrice(displayedAmount)}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
