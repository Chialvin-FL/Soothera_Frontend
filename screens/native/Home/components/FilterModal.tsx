import React, { useState } from 'react';
import { Modal, View, TouchableOpacity, TouchableWithoutFeedback, ScrollView } from 'react-native';
import { Text } from '@/components/Text';
import { Ionicons } from '@expo/vector-icons';
import { Colors, primaryColor } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export interface FilterCategory {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  options?: string[];
}

export interface FilterModalProps {
  visible: boolean;
  onApply: (selectedFilters: Record<string, any>) => void;
  onCancel: () => void;
}

export const filterCategories: FilterCategory[] = [
  { id: 'salon', label: 'Massage Spa', icon: 'business-outline' },
  { id: 'services', label: 'Services', icon: 'cut-outline' },
  { id: 'ratings', label: 'Ratings', icon: 'star-outline' },
  { id: 'therapists', label: 'Therapists', icon: 'people-outline' },
  { id: 'location', label: 'Location', icon: 'location-outline' },
  { id: 'priceRange', label: 'Price Range', icon: 'cash-outline' },
];

// Mapping filter IDs to placeholder text
export const getPlaceholderForFilter = (filterId: string | null): string => {
  switch (filterId) {
    case 'salon':
      return 'Search Massage Spas...';
    case 'services':
      return 'Search Services...';
    case 'ratings':
      return 'Search by Ratings...';
    case 'therapists':
      return 'Search Therapists...';
    case 'location':
      return 'Search by Location...';
    case 'priceRange':
      return 'Search by Price Range...';
    default:
      return 'Search Massage Spas...';
  }
};

export function FilterModal({ visible, onApply, onCancel }: FilterModalProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';

  const [selectedFilters, setSelectedFilters] = useState<Record<string, boolean>>({
    salon: true,
    services: false,
    ratings: false,
    therapists: false,
    location: false,
    priceRange: false,
  });

  const toggleFilter = (categoryId: string) => {
    // Check if this filter is already selected
    const isAlreadySelected = selectedFilters[categoryId] === true;
    
    // Only allow one selection at a time (radio button behavior)
    const newFilters = {
      salon: false,
      services: false,
      ratings: false,
      therapists: false,
      location: false,
      priceRange: false,
      [categoryId]: true,
    };
    
    setSelectedFilters(newFilters);
    
    // If selecting a different filter, apply immediately and close modal
    if (!isAlreadySelected) {
      onApply(newFilters);
      onCancel();
    }
  };

  const handleReset = () => {
    // Reset to default state (salon selected)
    const resetFilters = {
      salon: true,
      services: false,
      ratings: false,
      therapists: false,
      location: false,
      priceRange: false,
    };
    setSelectedFilters(resetFilters);
    // Apply immediately and close modal
    onApply(resetFilters);
    onCancel();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onCancel}
      statusBarTranslucent={true}
    >
      <View style={{ flex: 1 }}>
        {/* Backdrop */}
        <TouchableWithoutFeedback onPress={onCancel}>
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
            }}
          />
        </TouchableWithoutFeedback>
        
        {/* Modal Content - Positioned at very bottom, ignoring safe areas */}
        <TouchableWithoutFeedback>
          <View
            className={`rounded-t-3xl ${isDark ? 'bg-[#1f1f1f]' : 'bg-white'}`}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              height: 500,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
              zIndex: 1,
            }}
          >
              {/* Header */}
              <View className="flex-row items-center justify-between px-5 pt-5 pb-4 border-b"
                style={{ borderBottomColor: isDark ? '#3a3a3a' : '#E5E7EB' }}
              >
                <Text
                  className="text-xl font-semibold"
                  style={{ color: colors.text }}
                >
                  Filter Categories
                </Text>
                <TouchableOpacity onPress={onCancel} activeOpacity={0.7}>
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>

              {/* Filter List */}
              <ScrollView className="flex-1 px-5 py-4" showsVerticalScrollIndicator={false}>
                {filterCategories.map((category) => {
                  const isSelected = selectedFilters[category.id];
                  return (
                    <TouchableOpacity
                      key={category.id}
                      className="flex-row items-center justify-between py-4 border-b"
                      style={{ borderBottomColor: isDark ? '#3a3a3a' : '#F3F4F6' }}
                      onPress={() => toggleFilter(category.id)}
                      activeOpacity={0.7}
                    >
                      <View className="flex-row items-center flex-1">
                        <View
                          className="w-10 h-10 rounded-full items-center justify-center mr-3"
                          style={{
                            backgroundColor: isSelected
                              ? `${primaryColor}20`
                              : isDark
                              ? '#2a2a2a'
                              : '#F3F4F6',
                          }}
                        >
                          <Ionicons
                            name={category.icon}
                            size={20}
                            color={isSelected ? primaryColor : colors.icon}
                          />
                        </View>
                        <Text
                          className="text-base font-medium"
                          style={{ color: isSelected ? primaryColor : colors.text }}
                        >
                          {category.label}
                        </Text>
                      </View>
                      <View
                        className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                          isSelected ? '' : ''
                        }`}
                        style={{
                          borderColor: isSelected ? primaryColor : colors.icon,
                          backgroundColor: isSelected ? primaryColor : 'transparent',
                        }}
                      >
                        {isSelected && (
                          <Ionicons name="checkmark" size={14} color="white" />
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Footer Buttons */}
              <View className="px-5 pb-5 pt-4 border-t"
                style={{ borderTopColor: isDark ? '#3a3a3a' : '#E5E7EB' }}
              >
                <TouchableOpacity
                  className={`w-full border rounded-xl py-3.5 ${
                    isDark ? 'border-[#3a3a3a]' : 'border-gray-300'
                  }`}
                  onPress={handleReset}
                  activeOpacity={0.7}
                  disabled={selectedFilters.salon === true}
                  style={{ opacity: selectedFilters.salon !== true ? 1 : 0.5 }}
                >
                  <Text
                    className="font-semibold text-center"
                    style={{ color: colors.text }}
                  >
                    Reset
                  </Text>
                </TouchableOpacity>
              </View>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </Modal>
  );
}