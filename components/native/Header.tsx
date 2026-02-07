import React, { useEffect, useRef } from 'react';
import { View, Image, TouchableOpacity, Animated, Easing } from 'react-native';
import { Text } from '@/components/Text';
import { Ionicons } from '@expo/vector-icons';
import { Colors, primaryColor } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface HeaderProps {
  userName?: string;
  onNotificationPress?: () => void;
  onProfilePress?: () => void;
  hasNotifications?: boolean;
}

export const Header = ({ userName = 'John Doe', onNotificationPress, onProfilePress, hasNotifications = true }: HeaderProps) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (hasNotifications) {
      // Create shake animation: rotate left and right
      const shakeAnimation = Animated.sequence([
        Animated.timing(shakeAnim, {
          toValue: 10,
          duration: 100,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: -10,
          duration: 100,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 10,
          duration: 100,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: -10,
          duration: 100,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 0,
          duration: 100,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]);

      // Start animation when component mounts
      shakeAnimation.start();

      // Repeat animation every 3 seconds
      const interval = setInterval(() => {
        shakeAnimation.start();
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [hasNotifications, shakeAnim]);

  const animatedStyle = {
    transform: [{ rotate: shakeAnim.interpolate({
      inputRange: [-10, 10],
      outputRange: ['-10deg', '10deg'],
    }) }],
  };

  return (
    <View className="flex-row items-center justify-between px-5 pt-4 pb-4">
      {/* User Profile */}
      <TouchableOpacity 
        className="flex-row items-center" 
        onPress={onProfilePress}
        activeOpacity={0.7}
      >
        <Image
          source={require('../../assets/pfp.jpg')}
          className="w-10 h-10 rounded-full mr-3"
        />
        <Text className="text-base font-semibold" style={{ color: colors.text }}>
          {userName}
        </Text>
      </TouchableOpacity>

      {/* Notification Icon */}
      <TouchableOpacity className="relative" onPress={onNotificationPress}>
        <Animated.View style={hasNotifications ? animatedStyle : undefined}>
          <Ionicons name="notifications-outline" size={24} color={colors.text} />
        </Animated.View>
        {hasNotifications && (
          <View className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full" style={{ backgroundColor: primaryColor }} />
        )}
      </TouchableOpacity>
    </View>
  );
};
