import React, { useState, useRef, useEffect } from 'react';
import { View, ScrollView, Image, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { Text } from '@/components/Text';
import { Ionicons } from '@expo/vector-icons';
import { primaryColor } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { topRatedSalons } from '../configs/mockData';

interface TopRatedMassageSpasProps {
  onSeeAll?: () => void;
  onSalonPress?: (salonId: string) => void;
}

export function TopRatedMassageSpas({ onSeeAll, onSalonPress }: TopRatedMassageSpasProps = {}) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [isAtEnd, setIsAtEnd] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const slideAnim = useRef(new Animated.Value(200)).current; // Start off-screen to the right
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const screenWidth = Dimensions.get('window').width;

  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingEnd = 60; // paddingRight value to accommodate arrow button
    const isEnd = layoutMeasurement.width + contentOffset.x >= contentSize.width - paddingEnd - 10;
    
    if (isEnd && !isAtEnd) {
      setIsAtEnd(true);
      // Slide in from right to left (from off-screen to visible position)
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else if (!isEnd && isAtEnd) {
      setIsAtEnd(false);
      // Slide out from current position to the right (off-screen)
      Animated.timing(slideAnim, {
        toValue: screenWidth,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  // Pulsing animation when arrow is visible
  useEffect(() => {
    if (isAtEnd) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [isAtEnd]);

  const handleArrowPress = () => {
    onSeeAll?.();
  };

  return (
    <View className="mb-6 pb-6">
      <View className="flex-row items-center px-5 mb-4">
        <Text className="text-xl font-bold" style={{ color: colors.text }}>
          Top Rated Massage Spas
        </Text>
      </View>

      <View className="relative">
        <ScrollView
          ref={scrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingRight: 60 }}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {topRatedSalons.slice(0, 4).map((salon) => (
            <TouchableOpacity 
              key={salon.id} 
              className="w-56 mr-4"
              activeOpacity={0.7}
              onPress={() => onSalonPress?.(salon.id)}
            >
              <View className="relative rounded-2xl overflow-hidden mb-2">
                <Image
                  source={salon.image}
                  className="w-full h-40"
                  resizeMode="cover"
                />
                <View className="absolute bottom-2 right-2 flex-row items-center bg-black/60 px-2 py-1 rounded-full">
                  <Ionicons name="star" size={14} color="#FFD700" />
                  <Text className="text-white text-sm font-semibold ml-1">{salon.rating}</Text>
                </View>
              </View>
              <View>
                <Text className="text-base font-semibold mb-1" style={{ color: colors.text }}>
                  {salon.name}
                </Text>
                <View className="flex-row items-center">
                  <Ionicons name="location" size={14} color={colors.icon} />
                  <Text className="text-sm ml-1" style={{ color: colors.icon }}>
                    {salon.location}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Animated Arrow Button - Centered within image */}
        <Animated.View
          style={{
            position: 'absolute',
            right: 20,
            top: 60, // (160px image height - 40px button height) / 2 = 60px
            zIndex: 10,
            transform: [
              {
                translateX: slideAnim,
              },
            ],
          }}
          pointerEvents={isAtEnd ? 'auto' : 'none'}
        >
          <TouchableOpacity
            onPress={handleArrowPress}
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: primaryColor }}
            activeOpacity={0.8}
          >
            <Animated.View
              style={{
                transform: [
                  {
                    scale: pulseAnim,
                  },
                ],
              }}
            >
              <Ionicons name="arrow-forward" size={20} color="white" />
            </Animated.View>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}
