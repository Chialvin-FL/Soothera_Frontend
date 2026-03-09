import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/Text';
import { Ionicons } from '@expo/vector-icons';
import { Colors, primaryColor } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ChatbotFAB } from '@/components/native/ChatbotFAB';
import { FAQ_ITEMS } from '../configs/faqData';
import type { FaqItem } from '../configs/faqData';

interface HelpScreenProps {
  onBack: () => void;
  onOpenChatbot?: () => void;
  onFaqPress?: (faq: FaqItem) => void;
  onTermsPress?: () => void;
  onPrivacyPress?: () => void;
}

// Pressable FAQ row: question mark icon + text + chevron (same format as HelpLinkRow)
function FAQRow({
  faq,
  onPress,
  colors,
  isDark,
  isLast,
}: {
  faq: FaqItem;
  onPress: () => void;
  colors: typeof Colors.light;
  isDark: boolean;
  isLast?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center py-4"
      style={!isLast ? { borderBottomWidth: 1, borderBottomColor: isDark ? '#2a2a2a' : '#E5E7EB' } : undefined}
      activeOpacity={0.7}
    >
      <View
        className="w-8 h-8 rounded-full items-center justify-center mr-3"
        style={{ borderWidth: 1.5, borderColor: primaryColor, backgroundColor: 'transparent' }}
      >
        <Text className="text-sm font-bold" style={{ color: primaryColor }}>
          ?
        </Text>
      </View>
      <Text className="flex-1 text-base font-medium" style={{ color: colors.text }}>
        {faq.question}
      </Text>
      <Ionicons name="chevron-forward" size={20} color={colors.icon} />
    </TouchableOpacity>
  );
}

// Pressable row for links (same format as NotificationPreferencesScreen rows + chevron)
function HelpLinkRow({
  icon,
  label,
  onPress,
  colors,
  isDark,
  isLast,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  colors: typeof Colors.light;
  isDark: boolean;
  isLast?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center py-4"
      style={!isLast ? { borderBottomWidth: 1, borderBottomColor: isDark ? '#2a2a2a' : '#E5E7EB' } : undefined}
      activeOpacity={0.7}
    >
      <Ionicons name={icon} size={24} color={primaryColor} />
      <Text className="text-base font-medium ml-3 flex-1" style={{ color: colors.text }}>
        {label}
      </Text>
      <Ionicons name="chevron-forward" size={20} color={colors.icon} />
    </TouchableOpacity>
  );
}

function SectionTitle({
  title,
  colors,
  isFirst,
}: {
  title: string;
  colors: typeof Colors.light;
  isFirst?: boolean;
}) {
  return (
    <Text
      className={`text-lg font-bold mb-2 ${isFirst ? 'mt-0' : 'mt-6'}`}
      style={{ color: colors.text }}
    >
      {title}
    </Text>
  );
}

export default function HelpScreen({ onBack, onOpenChatbot, onFaqPress, onTermsPress, onPrivacyPress }: HelpScreenProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const isDark = colorScheme === 'dark';
  const [popupDismissedForVisit, setPopupDismissedForVisit] = useState(false);

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
          Help
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 56 + 12,
          paddingBottom: insets.bottom,
          paddingHorizontal: 20,
        }}
      >
        <SectionTitle title="FAQs" colors={colors} isFirst />
        {FAQ_ITEMS.map((faq, index) => (
          <FAQRow
            key={faq.question}
            faq={faq}
            onPress={() => onFaqPress?.(faq)}
            colors={colors}
            isDark={isDark}
            isLast={index === FAQ_ITEMS.length - 1}
          />
        ))}

        <SectionTitle title="Support & Legal" colors={colors} />
        <HelpLinkRow
          icon="document-text-outline"
          label="Terms of Service"
          onPress={() => onTermsPress?.()}
          colors={colors}
          isDark={isDark}
        />
        <HelpLinkRow
          icon="shield-checkmark-outline"
          label="Privacy Policy"
          onPress={() => onPrivacyPress?.()}
          colors={colors}
          isDark={isDark}
          isLast
        />

        <View className="items-center pt-4" style={{ paddingBottom: 0, marginBottom: 0 }}>
          <Text className="text-sm" style={{ color: colors.icon }}>
            Soothera – Book your spa with ease
          </Text>
          <Text className="text-xs mt-1" style={{ color: colors.icon }}>
            Version 1.0.0
          </Text>
        </View>
      </ScrollView>

      <ChatbotFAB
        visible
        floatingAboveTabBar={false}
        showPopupInitially={!popupDismissedForVisit}
        onOpenChat={onOpenChatbot}
        onPopupDismiss={() => setPopupDismissedForVisit(true)}
      />
    </View>
  );
}
