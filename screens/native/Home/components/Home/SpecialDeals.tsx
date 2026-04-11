import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { Text } from '@/components/Text';
import { primaryColor } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { SuccessModal } from '@/components/native/SuccessModal';
import { specialDeals } from '../../configs/mockData';

export function SpecialDeals() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [currentDealIndex, setCurrentDealIndex] = useState(0);
  const [successModalVisible, setSuccessModalVisible] = useState(false);

  return (
    <View className="mb-6">
      <View className="flex-row items-center justify-between px-5 mb-4">
        <Text className="text-xl font-bold" style={{ color: colors.text }}>
          #SpecialForYou
        </Text>
        {/* <TouchableOpacity>
          <Text className="text-base font-medium" style={{ color: primaryColor }}>
            See All
          </Text>
        </TouchableOpacity> */}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20 }}
        className="mb-4"
        scrollEventThrottle={16}
        onScroll={(event: NativeSyntheticEvent<NativeScrollEvent>) => {
          const scrollPosition = event.nativeEvent.contentOffset.x;
          const cardWidth = 320 + 16; // w-80 (320px) + mr-4 (16px)
          const currentIndex = Math.round(scrollPosition / cardWidth);
          setCurrentDealIndex(currentIndex);
        }}
        pagingEnabled={false}
        decelerationRate="fast"
      >
        {specialDeals.map((deal, index) => (
          <View
            key={deal.id}
            className="w-80 h-52 rounded-2xl mr-4 overflow-hidden"
            style={{ backgroundColor: '#2C2C2C' }}
          >
            <View className="absolute top-4 left-4 z-10">
              <View className="bg-white/90 px-3 py-1 rounded-full">
                <Text className="text-xs font-semibold" style={{ color: primaryColor }}>
                  {deal.tag}
                </Text>
              </View>
            </View>

            <View className="flex-1 p-5 justify-between">
              <Text className="text-2xl font-bold text-white mb-2 mt-8">{deal.title}</Text>
              <View className="flex-row items-start mb-2">
                <Text className="text-l font-bold text-white">Up to</Text>
                <View className="flex-row items-end ml-2">
                  <Text className="text-4xl font-bold text-white">{deal.discount}</Text>
                  <View className="bg-white/20 px-2 py-1 rounded mb-2 ml-1">
                    <Text className="text-sm font-bold text-white">%</Text>
                  </View>
                </View>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-xs text-white/70">All Massage Spas available | T&C Applied</Text>
                <TouchableOpacity
                  className="bg-white/20 px-6 py-2 rounded-full"
                  style={{ backgroundColor: primaryColor }}
                  onPress={() => setSuccessModalVisible(true)}
                >
                  <Text className="text-white font-semibold">Claim</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Page Indicators */}
      <View className="flex-row justify-center items-center">
        {specialDeals.map((_, index) => (
          <View
            key={index}
            className={`h-2 rounded-full mx-1 ${index === currentDealIndex ? 'w-6' : 'w-2'}`}
            style={{ backgroundColor: index === currentDealIndex ? primaryColor : '#E0E0E0' }}
          />
        ))}
      </View>

      <SuccessModal
        visible={successModalVisible}
        title="Deal Claimed!"
        message="Your special discount has been applied. You can use it at any participating massage spa."
        onClose={() => setSuccessModalVisible(false)}
      />
    </View>
  );
}
