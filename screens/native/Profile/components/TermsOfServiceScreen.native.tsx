import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/Text';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface TermsOfServiceScreenProps {
  onBack: () => void;
}

const TERMS_CONTENT = `
1. Acceptance of Terms

By accessing and using the Soothera mobile application and services ("Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.

2. Description of Service

Soothera is a platform that connects users with spa and wellness service providers. We facilitate booking appointments, managing reservations, and related services. Soothera does not provide the spa or wellness services directly; we act as an intermediary between you and third-party providers.

3. Account Registration

To use certain features of the Service, you must create an account. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate. You are responsible for maintaining the confidentiality of your account credentials.

4. Booking and Payments

When you book a service through Soothera, you enter into a direct agreement with the service provider. Payment processing is handled through our secure payment system. Prices, availability, and service offerings are set by the providers. Soothera is not responsible for the quality, safety, or legality of services provided by third parties.

5. Cancellation and Refunds

Cancellation and refund policies may vary by provider. Generally, cancellations made more than 24 hours before your appointment may qualify for a full refund. Cancellations within 24 hours may incur fees. Please review the specific policy for each booking before confirming.

6. User Conduct

You agree not to use the Service for any unlawful purpose or in any way that could damage, disable, or impair the Service. You will not attempt to gain unauthorized access to any systems or networks connected to Soothera.

7. Intellectual Property

All content, features, and functionality of the Service are owned by Soothera and are protected by intellectual property laws. You may not copy, modify, distribute, or create derivative works without our express written permission.

8. Limitation of Liability

To the fullest extent permitted by law, Soothera shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service or any services obtained through the platform.

9. Changes to Terms

We reserve the right to modify these terms at any time. We will notify you of material changes by posting the updated terms in the app or via email. Your continued use of the Service after such changes constitutes acceptance of the new terms.

10. Contact

For questions about these Terms of Service, please contact us at support@soothera.com or visit our website at soothera.com.
`;

export default function TermsOfServiceScreen({ onBack }: TermsOfServiceScreenProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const isDark = colorScheme === 'dark';

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
          Terms of Service
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
        <Text
          className="text-base leading-7"
          style={{ color: colors.text }}
        >
          {TERMS_CONTENT.trim()}
        </Text>
      </ScrollView>
    </View>
  );
}
