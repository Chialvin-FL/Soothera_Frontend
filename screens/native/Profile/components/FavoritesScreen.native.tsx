import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/Text';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { SalonCardsList } from '../../Home/components/SalonCardsList';
import { topRatedSalons } from '../../Home/configs/mockData';

interface FavoritesScreenProps {
  onBack?: () => void;
  onSalonPress?: (salonId: string) => void;
  autoOpenFilter?: boolean;
  autoFocusSearch?: boolean;
}

export default function FavoritesScreen({ onBack, onSalonPress, autoOpenFilter = false, autoFocusSearch = false }: FavoritesScreenProps = {}) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const isDark = colorScheme === 'dark';

  // For now, using topRatedSalons as favorites data (mock)
  const favoriteSalons = topRatedSalons.slice(0, 3);

  return (
    <View className="flex-1 bg-white dark:bg-[#151718]">
      {/* Header */}
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
        <Text className="text-lg font-semibold flex-1" style={{ color: colors.text }}>
          Your Favorites
        </Text>
      </View>

      {/* Favorite Salons in Card View - Single Column */}
      <SalonCardsList
        salons={favoriteSalons}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 20,
          paddingTop: insets.top + 64,
        }}
        onSalonPress={onSalonPress}
      />
    </View>
  );
}