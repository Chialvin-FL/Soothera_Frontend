import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/Text';
import { Ionicons } from '@expo/vector-icons';
import { Colors, primaryColor } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { FaqItem } from '../configs/faqData';

interface FAQsScreenProps {
  faq: FaqItem;
  onBack: () => void;
}

export default function FAQsScreen({ faq, onBack }: FAQsScreenProps) {
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
          FAQ
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
        <View className="flex-row items-center mb-4">
          <View
            className="w-10 h-10 rounded-full items-center justify-center mr-3 shrink-0"
            style={{ borderWidth: 1.5, borderColor: primaryColor, backgroundColor: 'transparent' }}
          >
            <Text className="text-sm font-bold" style={{ color: primaryColor }}>
              ?
            </Text>
          </View>
          <Text className="flex-1 text-xl font-bold" style={{ color: colors.text }}>
            {faq.question}
          </Text>
        </View>
        <Text
          className="text-base leading-7"
          style={{ color: colors.text }}
        >
          {faq.answer}
        </Text>
      </ScrollView>
    </View>
  );
}
