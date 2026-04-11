import React from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { primaryColor } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

interface SearchBarProps {
  onPress?: () => void;
  onFilterPress?: () => void;
}

export function SearchBar({ onPress, onFilterPress }: SearchBarProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View className="flex-row items-center px-5 py-2 mb-4">
      <TouchableOpacity 
        className="flex-1 flex-row items-center bg-gray-100 rounded-full px-4 py-1 mr-3"
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Ionicons name="search-outline" size={20} color={colors.icon} />
        <TextInput
          placeholder="Search Massage Spa, Specialist..."
          placeholderTextColor={colors.icon}
          className="flex-1 ml-2 text-base"
          style={{ color: colors.text }}
          editable={false}
          pointerEvents="none"
        />
      </TouchableOpacity>
      <TouchableOpacity
        className="w-12 h-12 rounded-xl items-center justify-center"
        style={{ backgroundColor: primaryColor }}
        onPress={onFilterPress}
        activeOpacity={0.7}
      >
        <Ionicons name="options-outline" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}
