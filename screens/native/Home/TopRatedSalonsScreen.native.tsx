import React from 'react';
import { View } from 'react-native';
import { SearchBarWithBack } from './components/SearchBarWithBack';
import { MassageSpaCardsList } from './components/SalonCardsList';
import { topRatedSalons } from './configs/mockData';

interface TopRatedMassageSpasScreenProps {
  onBack?: () => void;
  onSalonPress?: (salonId: string) => void;
  autoOpenFilter?: boolean;
  autoFocusSearch?: boolean;
}

export default function TopRatedMassageSpasScreen({ onBack, onSalonPress, autoOpenFilter = false, autoFocusSearch = false }: TopRatedMassageSpasScreenProps = {}) {
  return (
    <View className="flex-1 bg-white">
      {/* Search Bar with Back Button */}
      <SearchBarWithBack 
        onBack={onBack} 
        autoFocus={autoFocusSearch}
        autoOpenFilter={autoOpenFilter}
      />

      {/* All Massage Spas in Card View - Single Column */}
      <MassageSpaCardsList 
        salons={topRatedSalons}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
        onSalonPress={onSalonPress}
      />
    </View>
  );
}
