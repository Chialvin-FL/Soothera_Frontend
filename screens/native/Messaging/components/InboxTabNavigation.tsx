import React, { useRef, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from '@/components/Text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

import type { UIRole } from '@/navigation/hooks/useSessionLoader';

export type InboxTabType = 'all' | 'salon' | 'therapist' | 'chatbot' | 'customer';

interface InboxTabNavigationProps {
  activeTab: InboxTabType;
  onTabPress: (tab: InboxTabType) => void;
  userRole?: UIRole | null;
}

const getTabsForRole = (role?: UIRole | null): InboxTabType[] => {
  if (role === 'admin') {
    return ['all', 'customer', 'therapist', 'chatbot'];
  }
  if (role === 'therapist') {
    return ['all', 'customer', 'salon', 'chatbot'];
  }
  return ['all', 'salon', 'therapist', 'chatbot'];
};

const getTabLabel = (tab: InboxTabType): string => {
  switch (tab) {
    case 'all':
      return 'All';
    case 'salon':
      return 'Salon';
    case 'therapist':
      return 'Therapist';
    case 'chatbot':
      return 'Chatbot';
    case 'customer':
      return 'Customer';
    default:
      return tab;
  }
};

export default function InboxTabNavigation({ activeTab, onTabPress, userRole }: InboxTabNavigationProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const scrollViewRef = useRef<ScrollView>(null);

  const tabs = getTabsForRole(userRole);

  // Auto-scroll when tab changes
  useEffect(() => {
    if (activeTab === 'chatbot') {
      // Scroll to the right (end) when chatbot is selected
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } else if (activeTab === 'all') {
      // Scroll to the left (start) when all is selected
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ x: 0, animated: true });
      }, 100);
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
