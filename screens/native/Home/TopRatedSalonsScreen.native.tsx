import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Text } from '@/components/Text';
import { primaryColor } from '@/constants/theme';
import { SearchBarWithBack } from './components/SearchBarWithBack';
import { MassageSpaCardsList } from './components/SalonCardsList';
import { useEstablishments } from './hooks/useEstablishments';

interface TopRatedMassageSpasScreenProps {
  onBack?: () => void;
  onSalonPress?: (salonId: string) => void;
  autoOpenFilter?: boolean;
  autoFocusSearch?: boolean;
}

export default function TopRatedMassageSpasScreen({
  onBack,
  onSalonPress,
  autoOpenFilter = false,
  autoFocusSearch = false,
}: TopRatedMassageSpasScreenProps = {}) {
  const { salons, loading, error } = useEstablishments();

  return (
    <View className="flex-1 bg-white">
      {/* Search Bar with Back Button */}
      <SearchBarWithBack
        onBack={onBack}
        autoFocus={autoFocusSearch}
        autoOpenFilter={autoOpenFilter}
      />

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={primaryColor} />
          <Text className="text-sm mt-3" style={{ color: '#9CA3AF' }}>
            Loading salons...
          </Text>
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-sm text-center" style={{ color: '#9CA3AF' }}>
            {error}
          </Text>
        </View>
      ) : (
        <MassageSpaCardsList
          salons={salons}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
          onSalonPress={onSalonPress}
        />
      )}
    </View>
  );
}
