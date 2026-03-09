import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/Text';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface PrivacyPolicyScreenProps {
  onBack: () => void;
}

const PRIVACY_CONTENT = `
1. Introduction

Soothera ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and related services.

2. Information We Collect

We collect information you provide directly to us:
• Account information (name, email, phone number, password)
• Booking and appointment details
• Payment information (processed securely by our payment providers)
• Profile preferences and communication preferences

We also automatically collect certain information when you use our app:
• Device information (type, operating system, unique identifiers)
• Usage data (features used, time spent, interaction patterns)
• Location data (if you grant permission, to find nearby salons)

3. How We Use Your Information

We use the information we collect to:
• Provide, maintain, and improve our services
• Process bookings and send confirmations and reminders
• Communicate with you about your account and bookings
• Send promotional offers (with your consent)
• Analyze usage to improve user experience
• Comply with legal obligations and enforce our terms

4. Information Sharing

We may share your information with:
• Service providers (spas, salons) to fulfill your bookings
• Payment processors to complete transactions
• Analytics providers to help us improve our app
• Legal authorities when required by law

We do not sell your personal information to third parties.

5. Data Security

We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. Payment data is encrypted and handled by certified payment processors.

6. Your Rights

Depending on your location, you may have the right to:
• Access and receive a copy of your data
• Correct or update inaccurate data
• Request deletion of your data
• Opt out of marketing communications
• Withdraw consent where processing is based on consent

To exercise these rights, contact us at privacy@soothera.com.

7. Data Retention

We retain your information for as long as your account is active or as needed to provide services. We may retain certain information as required by law or for legitimate business purposes.

8. Children's Privacy

Our Service is not intended for users under 16 years of age. We do not knowingly collect personal information from children under 16.

9. Changes to This Policy

We may update this Privacy Policy from time to time. We will notify you of material changes by posting the updated policy in the app or via email.

10. Contact Us

For questions about this Privacy Policy, contact us at privacy@soothera.com or visit soothera.com.
`;

export default function PrivacyPolicyScreen({ onBack }: PrivacyPolicyScreenProps) {
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
          Privacy Policy
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
          {PRIVACY_CONTENT.trim()}
        </Text>
      </ScrollView>
    </View>
  );
}
