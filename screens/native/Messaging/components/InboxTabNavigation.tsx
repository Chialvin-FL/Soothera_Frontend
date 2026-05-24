import React, { useRef, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from '@/components/Text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

import type { UIRole } from '@/navigation/hooks/useSessionLoader';

// Tabs that exist in the inbox.
// 'salon'   → booking-based therapist ↔ customer conversations
// 'chatbot' → AI assistant bots
export type InboxTabType = 'all' | 'salon' | 'chatbot';

interface InboxTabNavigationProps {
  activeTab: InboxTabType;
  onTabPress: (tab: InboxTabType) => void;
  userRole?: UIRole | null;
}

const TABS: InboxTabType[] = ['all', 'salon', 'chatbot'];

const TAB_LABELS: Record<InboxTabType, string> = {
  all: 'All',
  salon: 'Massage Spa',
  chatbot: 'Chatbot',
};

export default function InboxTabNavigation({
  activeTab,
  onTabPress,
}: InboxTabNavigationProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const scrollViewRef = useRef<ScrollView>(null);

  // Auto-scroll when tab changes
  useEffect(() => {
    if (activeTab === 'chatbot') {
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    } else if (activeTab === 'all') {
      setTimeout(() => scrollViewRef.current?.scrollTo({ x: 0, animated: true }), 100);
    }
  }, [activeTab]);

  return (
    <View className="mx-5 mt-2 mb-4 bg-gray-100 dark:bg-[#2a2a2a] rounded-full p-1">
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 4 }}
      >
        {TABS.map((tab, index) => (
          <TouchableOpacity
            key={tab}
            className={`px-4 py-3 rounded-full ${index < TABS.length - 1 ? 'mr-2' : ''}`}
            style={{ backgroundColor: activeTab === tab ? colors.primary : 'transparent' }}
            onPress={() => onTabPress(tab)}
          >
            <Text
              className={`text-center font-semibold ${activeTab === tab ? '' : 'opacity-60'}`}
              style={{ color: activeTab === tab ? 'white' : colors.icon }}
            >
              {TAB_LABELS[tab]}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
