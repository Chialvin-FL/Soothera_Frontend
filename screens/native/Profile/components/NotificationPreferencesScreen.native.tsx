import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/Text';
import { Ionicons } from '@expo/vector-icons';
import { Colors, primaryColor } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface NotificationPreferencesScreenProps {
  onBack: () => void;
}

function PreferenceRow({
  label,
  description,
  value,
  onValueChange,
  colors,
  isDark,
  isLast,
}: {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  colors: typeof Colors.light;
  isDark: boolean;
  isLast?: boolean;
}) {
  return (
    <View
      className="flex-row items-center justify-between py-4"
      style={!isLast ? { borderBottomWidth: 1, borderBottomColor: isDark ? '#2a2a2a' : '#E5E7EB' } : undefined}
    >
      <View className="flex-1 mr-4">
        <Text className="text-base font-medium" style={{ color: colors.text }}>
          {label}
        </Text>
        {description ? (
          <Text className="text-sm mt-0.5" style={{ color: colors.icon }}>
            {description}
          </Text>
        ) : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: isDark ? '#3a3a3a' : '#E5E7EB', true: primaryColor + '99' }}
        thumbColor={value ? primaryColor : (isDark ? '#9BA1A6' : '#f4f3f4')}
      />
    </View>
  );
}

export default function NotificationPreferencesScreen({ onBack }: NotificationPreferencesScreenProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const isDark = colorScheme === 'dark';

  const [pushEnabled, setPushEnabled] = useState(true);
  const [bookingReminders, setBookingReminders] = useState(true);
  const [promotions, setPromotions] = useState(false);
  const [marketing, setMarketing] = useState(false);

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
        <Text className="text-lg font-semibold" style={{ color: colors.text }}>
          Notifications
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 56,
          paddingBottom: insets.bottom + 24,
          paddingHorizontal: 20,
        }}
      >
        <PreferenceRow
          label="Push Notifications"
          description="Receive push notifications on this device"
          value={pushEnabled}
          onValueChange={setPushEnabled}
          colors={colors}
          isDark={isDark}
        />
        <PreferenceRow
          label="Booking Reminders"
          description="Reminders before your appointments"
          value={bookingReminders}
          onValueChange={setBookingReminders}
          colors={colors}
          isDark={isDark}
        />
        <PreferenceRow
          label="Promotions & Offers"
          description="Special offers and discounts"
          value={promotions}
          onValueChange={setPromotions}
          colors={colors}
          isDark={isDark}
        />
        <PreferenceRow
          label="Marketing & News"
          description="Updates and tips from Soothera"
          value={marketing}
          onValueChange={setMarketing}
          colors={colors}
          isDark={isDark}
          isLast
        />
      </ScrollView>
    </View>
  );
}
