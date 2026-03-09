import React, { useRef, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from '@/components/Text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type TabType = 'all' | 'upcoming' | 'completed' | 'cancelled';

interface TabNavigationProps {
  activeTab: TabType;
  onTabPress: (tab: TabType) => void;
  tabs?: TabType[];
}

const defaultTabs: TabType[] = ['all', 'upcoming', 'completed', 'cancelled'];

const getTabLabel = (tab: TabType): string => {
  switch (tab) {
    case 'all':
      return 'All';
    case 'upcoming':
      return 'Upcoming';
    case 'completed':
      return 'Completed';
    case 'cancelled':
      return 'Cancelled';
    default:
      return tab;
  }
};

export default function TabNavigation({ activeTab, onTabPress, tabs = defaultTabs }: TabNavigationProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const scrollViewRef = useRef<ScrollView>(null);

  // Auto-scroll when tab changes
  useEffect(() => {
    if (activeTab === 'cancelled') {
      // Scroll to the right (end) when cancelled is selected
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } else if (activeTab === 'all' || activeTab === tabs[0]) {
      // Scroll to the left (start) when all or the first tab is selected
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ x: 0, animated: true });
      }, 100);
    }
  }, [activeTab, tabs]);

  return (
    <View className="mx-5 mt-2 mb-4 bg-gray-100 rounded-full p-1">
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
