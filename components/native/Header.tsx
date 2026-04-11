import React, { useEffect, useRef } from 'react';
import { View, Image, TouchableOpacity, Animated, Easing } from 'react-native';
import { Text } from '@/components/Text';
import { Ionicons } from '@expo/vector-icons';
import { Colors, primaryColor } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/env';
import { UserData } from '@/api/types';
import { getRoleLabel } from '@/utils/roleHelpers';
import type { UIRole } from '@/navigation/hooks/useSessionLoader';

interface HeaderProps {
  userName?: string;
  onNotificationPress?: () => void;
  onProfilePress?: () => void;
  hasNotifications?: boolean;
}

export const Header = ({ userName, onNotificationPress, onProfilePress, hasNotifications = true }: HeaderProps) => {
  const [currentUserName, setCurrentUserName] = React.useState(userName || 'John Doe');
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fetchUserName = async () => {
      if (userName) {
        setCurrentUserName(userName);
        return;
      }
      try {
        const storedData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
        if (storedData) {
          const userData: UserData = JSON.parse(storedData);
          // Build name from available fields
          const displayName = [userData.firstName, userData.lastName]
            .filter(Boolean)
            .join(' ') || userData.email;
          
          if (displayName) {
            setCurrentUserName(displayName);
          }
        }
      } catch (error) {
        console.error('Error fetching user name in Header:', error);
      }
    };

    fetchUserName();
  }, [userName]);

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
    transform: [{
      rotate: shakeAnim.interpolate({
        inputRange: [-10, 10],
        outputRange: ['-10deg', '10deg'],
      })
    }],
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
          source={require('../../assets/user.jpg')}
          className="w-10 h-10 rounded-full mr-3"
        />
        <Text className="text-base font-semibold" style={{ color: colors.text }}>
          {currentUserName}
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
