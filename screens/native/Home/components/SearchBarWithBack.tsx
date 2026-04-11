import React, { useRef, useEffect, useState } from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, primaryColor } from '@/constants/theme';
import { FilterModal, getPlaceholderForFilter } from './FilterModal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface SearchBarWithBackProps {
  onBack?: () => void;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  autoFocus?: boolean;
  onFiltersChange?: (filters: Record<string, any>) => void;
  autoOpenFilter?: boolean;
  enableFilters?: boolean;
}

export function SearchBarWithBack({ 
  onBack, 
  placeholder: initialPlaceholder = "Search Massage Spas...",
  value,
  onChangeText,
  autoFocus = false,
  onFiltersChange,
  autoOpenFilter = false,
  enableFilters = true
}: SearchBarWithBackProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({
    salon: true,
    services: false,
    ratings: false,
    therapists: false,
    location: false,
    priceRange: false,
  });

  // Get the selected filter ID and compute placeholder
  const selectedFilterId = Object.keys(activeFilters).find(
    (key) => activeFilters[key] === true
  ) || 'salon';
  const dynamicPlaceholder = getPlaceholderForFilter(selectedFilterId);
  const placeholderToUse = enableFilters ? dynamicPlaceholder : initialPlaceholder;

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      // Delay to ensure the screen is fully mounted and animation has started before focusing
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [autoFocus]);

  useEffect(() => {
    if (autoOpenFilter && enableFilters) {
      // Delay to ensure the screen is fully mounted and search bar is focused before opening modal
      const timer = setTimeout(() => {
        setShowFilterModal(true);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [autoOpenFilter, enableFilters]);

  const handleFiltersApply = (filters: Record<string, any>) => {
    setActiveFilters(filters);
    onFiltersChange?.(filters);
  };

  const hasActiveFilters =
    enableFilters && Object.values(activeFilters).some((value) => value === true);

  return (
    <>
      <View className="flex-row items-center px-5 py-2 mb-4" 
      style={{paddingTop: insets.top}}>
        {/* Back Button */}
        <TouchableOpacity 
          onPress={onBack}
          className="mr-3"
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        {/* Search Bar */}
        <View className="flex-1 flex-row items-center bg-gray-100 rounded-full px-4 py-1">
          <Ionicons name="search-outline" size={20} color={colors.icon} />
          <TextInput
            ref={inputRef}
            placeholder={placeholderToUse}
            placeholderTextColor={colors.icon}
            value={value}
            onChangeText={onChangeText}
            className="flex-1 ml-2 text-base"
            style={{ color: colors.text }}
            autoFocus={autoFocus}
          />
        </View>

        {/* Filter Button */}
        {enableFilters && (
          <TouchableOpacity
            className="w-12 h-12 rounded-xl items-center justify-center ml-3"
            style={{ backgroundColor: primaryColor }}
            onPress={() => setShowFilterModal(true)}
            activeOpacity={0.7}
          >
            <Ionicons 
              name="options-outline" 
              size={24} 
              color="white" 
            />
            {hasActiveFilters && (
              <View
                className="absolute -top-1 -right-1 w-3 h-3 rounded-full"
                style={{ backgroundColor: '#EF4444' }}
              />
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Modal */}
      {enableFilters && (
        <FilterModal
          visible={showFilterModal}
          onApply={handleFiltersApply}
          onCancel={() => setShowFilterModal(false)}
        />
      )}
    </>
  );
}
