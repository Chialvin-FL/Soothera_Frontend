import React from 'react';
import { View, Pressable } from 'react-native';
import { Text } from '@/components/Text';
import { Ionicons } from '@expo/vector-icons';

type Screen = 'home' | 'explore' | 'profile';

interface SidebarProps {
  activeScreen: Screen;
  onNavigate: (screen: Screen) => void;
}

interface NavItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  screen: Screen;
  isActive: boolean;
  onPress: () => void;
}

const NavItem = ({ icon, label, isActive, onPress }: NavItemProps) => {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center px-6 py-4 mb-2 mx-3 rounded-lg transition-colors ${isActive
          ? 'bg-primary'
          : 'hover:bg-gray-100'
        }`}
    >
      <Ionicons
        name={icon}
        size={24}
        color={isActive ? '#ffffff' : '#6b7280'}
      />
      <Text
        className={`ml-4 text-base font-medium ${isActive ? 'text-white' : 'text-gray-700'
          }`}
      >
        {label}
      </Text>
    </Pressable>
  );
};

export default function Sidebar({ activeScreen, onNavigate }: SidebarProps) {
  return (
    <View className="w-64 bg-white border-r border-gray-200 min-h-screen">
      {/* Header */}
      <View className="px-6 py-6 border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-900">Soothera</Text>
        <Text className="text-sm text-gray-500 mt-1">Web Application</Text>
      </View>

      {/* Navigation Items */}
      <View className="py-4">
        <NavItem
          icon="home"
          label="Home"
          screen="home"
          isActive={activeScreen === 'home'}
          onPress={() => onNavigate('home')}
        />
        <NavItem
          icon="compass"
          label="Explore"
          screen="explore"
          isActive={activeScreen === 'explore'}
          onPress={() => onNavigate('explore')}
        />
        <NavItem
          icon="person"
          label="Profile"
          screen="profile"
          isActive={activeScreen === 'profile'}
          onPress={() => onNavigate('profile')}
        />
      </View>

      {/* Footer */}
      <View className="absolute bottom-0 left-0 right-0 px-6 py-4 border-t border-gray-200">
        <Text className="text-xs text-gray-400">© 2024 Soothera</Text>
      </View>
    </View>
  );
}
