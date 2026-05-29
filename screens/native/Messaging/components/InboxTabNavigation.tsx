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


export default function InboxTabNavigation({
  activeTab,
  onTabPress,
  userRole,
}: InboxTabNavigationProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const scrollViewRef = useRef<ScrollView>(null);

  // Determine tabs list based on userRole
  const tabs: InboxTabType[] = userRole === 'admin' ? ['all', 'chatbot'] : ['all', 'salon', 'chatbot'];

  // Determine tab labels based on userRole
  const getTabLabel = (tab: InboxTabType): string => {
    if (tab === 'all') return 'All';
    if (tab === 'chatbot') return 'Chatbot';
    if (tab === 'salon') {
      if (userRole === 'therapist') return 'Customer';
      if (userRole === 'customer') return 'Therapist';
      return 'Massage Spa';
    }
    return '';
  };

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
        {tabs.map((tab, index) => (
          <TouchableOpacity
            key={tab}
            className={`px-4 py-3 rounded-full ${index < tabs.length - 1 ? 'mr-2' : ''}`}
            style={{ backgroundColor: activeTab === tab ? colors.primary : 'transparent' }}
            onPress={() => onTabPress(tab)}
          >
            <Text
              className={`text-center font-semibold ${activeTab === tab ? '' : 'opacity-60'}`}
              style={{ color: activeTab === tab ? 'white' : colors.icon }}
            >
              {getTabLabel(tab)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
