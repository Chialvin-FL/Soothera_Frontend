import React from 'react';
import { View, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Text } from '@/components/Text';
import { Ionicons } from '@expo/vector-icons';
import { TopRatedSalon } from '../types/Home';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { RisingItem } from '@/components/native/RisingItem';

interface MassageSpaCardsListProps {
  salons: TopRatedSalon[];
  contentContainerStyle?: object;
  onSalonPress?: (salonId: string) => void;
}

export function MassageSpaCardsList({ salons, contentContainerStyle, onSalonPress }: MassageSpaCardsListProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const renderMassageSpaCard = (salon: TopRatedSalon, index: number) => {
    // Calculate number of full stars
    const fullStars = Math.floor(salon.rating);
    const hasHalfStar = salon.rating % 1 >= 0.5;

    // Group cards by row (2 cards per row)
    const cardsPerRow = 2;
    const rowIndex = Math.floor(index / cardsPerRow);
    
    const baseDelay = 120;
    const perRowDelay = 120;
    // All cards in the same row get the same delay
    const delay = baseDelay + (rowIndex * perRowDelay);

    return (
      <RisingItem key={`${salon.id ?? 'salon'}-${index}`} delay={delay} fadeIn={false} offset={28}>
        <TouchableOpacity
          key={`${salon.id ?? 'salon'}-${index}-touchable`}
          className="mb-4"
          activeOpacity={0.7}
          onPress={() => onSalonPress?.(salon.id)}
        >
          <View 
            className="rounded-xl overflow-hidden bg-white"
            style={{ 
              elevation: 3,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
            }}
          >
            {/* Massage Spa Image */}
            <View className="relative">
              <Image
                source={salon.image}
                className="w-full h-40"
                resizeMode="cover"
              />
            </View>

            {/* Salon Details */}
            <View className="p-3">
              {/* Massage Spa Name */}
              <Text 
                className="text-base font-semibold mb-1" 
                style={{ color: colors.text }}
                numberOfLines={2}
              >
                {salon.name}
              </Text>

              {/* Rating with Stars */}
              <View className="flex-row items-center mb-2">
                <View className="flex-row items-center mr-2">
                  {[...Array(5)].map((_, index) => {
                    if (index < fullStars) {
                      return (
                        <Ionicons 
                          key={index} 
                          name="star" 
                          size={16} 
                          color="#FFD700" 
                          style={{ marginRight: 2 }}
                        />
                      );
                    } else if (index === fullStars && hasHalfStar) {
                      return (
                        <Ionicons 
                          key={index} 
                          name="star-half" 
                          size={16} 
                          color="#FFD700" 
                          style={{ marginRight: 2 }}
                        />
                      );
                    } else {
                      return (
                        <Ionicons 
                          key={index} 
                          name="star-outline" 
                          size={16} 
                          color="#FFD700" 
                          style={{ marginRight: 2 }}
                        />
                      );
                    }
                  })}
                </View>
                <Text 
                  className="text-xs" 
                  style={{ color: colors.icon }}
                >
                  {salon.rating}
                </Text>
              </View>

              {/* Location */}
              <View className="flex-row items-center mb-2">
                <Ionicons name="location" size={14} color={colors.icon} />
                <Text 
                  className="text-xs ml-1 flex-1" 
                  style={{ color: colors.icon }}
                  numberOfLines={1}
                >
                  {salon.location}
                </Text>
              </View>

              {/* Services Tags */}
              <View className="flex-row flex-wrap" style={{ gap: 4 }}>
                {salon.services.map((service, serviceIndex) => (
                  <View
                    key={`${salon.id ?? 'salon'}-service-${serviceIndex}-${service}`}
                    className="px-2 py-1 rounded-full mb-1"
                    style={{ 
                      backgroundColor: colors.primary + '20',
                      flexShrink: 1,
                    }}
                  >
                    <Text 
                      className="text-xs font-medium" 
                      style={{ color: colors.primary }}
                      numberOfLines={1}
                    >
                      {service}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </RisingItem>
    );
  };

  return (
    <ScrollView 
      className="flex-1" 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={contentContainerStyle}
    >
      {salons.map((salon, index) => renderMassageSpaCard(salon, index))}
    </ScrollView>
  );
}
