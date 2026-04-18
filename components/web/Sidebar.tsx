import React from 'react';
import { View, Pressable } from 'react-native';
import { Text } from '@/components/Text';
import { Ionicons } from '@expo/vector-icons';

type Screen = 'users-management' | 'profile' | 'user-verification';

const menuItems = [
    { id: 'users-management', label: 'Users', icon: 'people-outline' },
    { id: 'user-verification', label: 'Verifications', icon: 'shield-checkmark-outline' },
    { id: 'profile', label: 'My Profile', icon: 'person-outline' },
];

interface SidebarProps {
    activeScreen: Screen;
    onNavigate: (screen: 'profile' | 'users-management' | 'user-verification' | 'login') => void;
    onLogout: () => Promise<void>;
    userRole?: string;
}

interface NavItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  isActive: boolean;
  onPress: () => void;
}

const NavItem = ({ icon, label, isActive, onPress }: NavItemProps) => {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center px-6 py-4 mb-2 mx-3 rounded-xl transition-colors ${isActive
        ? 'bg-primary shadow-lg shadow-primary/20'
        : 'hover:bg-slate-50'
        }`}
    >
      <Ionicons
        name={icon}
        size={22}
        color={isActive ? '#ffffff' : '#64748b'}
      />
      <Text
        className={`ml-4 text-base ${isActive ? 'text-white' : 'text-slate-600'
          }`}
      >
        {label}
      </Text>
    </Pressable>
  );
};

export default function Sidebar({ activeScreen, onNavigate, onLogout, userRole }: SidebarProps) {
  return (
    <View className="w-72 bg-white border-r border-slate-200 min-h-screen">
      {/* Header */}
      <View className="px-8 py-10">
        <Text className="text-3xl font-bold text-slate-900">Soothera</Text>
        <View className="flex-row items-center mt-2">
          <View className="w-2 h-2 rounded-full bg-green-500 mr-2" />
          <Text className="text-xs text-slate-400 font-bold uppercase tracking-widest">{userRole || 'Admin'} Portal</Text>
        </View>
      </View>

      {/* Navigation Items */}
      <View className="flex-1 py-4">
        {menuItems.map((item) => (
          <NavItem
            key={item.id}
            icon={item.icon as keyof typeof Ionicons.glyphMap}
            label={item.label}
            isActive={activeScreen === item.id}
            onPress={() => onNavigate(item.id as any)}
          />
        ))}
      </View>

      {/* Footer */}
      <View className="p-6 border-t border-slate-100">
        <Pressable
          onPress={onLogout}
          className="flex-row items-center px-4 py-3 rounded-xl hover:bg-red-50 group transition-colors"
        >
          <Ionicons name="log-out-outline" size={22} color="#94a3b8" />
          <Text className="ml-4 text-slate-500 font-semibold group-hover:text-red-600 transition-colors">Sign Out</Text>
        </Pressable>
        <Text className="text-[10px] text-slate-300 mt-6 text-center font-bold uppercase tracking-widest">© 2026 Soothera Admin</Text>
      </View>
    </View>
  );
}
