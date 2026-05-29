import React, { useState, useRef, useImperativeHandle, forwardRef } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/Text';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type NotificationType = 'pending' | 'confirmed' | 'ongoing' | 'completed' | 'cancelled' | 'info';

export type PopUpNotificationProps = Record<string, never>;

export interface PopUpNotificationRef {
  show: (options: {
    title: string;
    message: string;
    type: NotificationType;
    duration?: number;
  }) => void;
}

export const PopUpNotification = forwardRef<PopUpNotificationRef, PopUpNotificationProps>((props, ref) => {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';

  const [visible, setVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<NotificationType>('info');

  const translateY = useSharedValue(-200);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const hide = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    translateY.value = withTiming(-200, { duration: 250 }, () => {
      runOnJS(setVisible)(false);
    });
  };

  useImperativeHandle(ref, () => ({
    show: ({ title, message, type, duration = 4000 }) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setTitle(title);
      setMessage(message);
      setType(type);
      setVisible(true);

      // Start spring entering animation for bouncy feel
      translateY.value = withSpring(0, {
        damping: 15,
        stiffness: 120,
      });

      timeoutRef.current = setTimeout(() => {
        hide();
      }, duration);
    },
  }));

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
      opacity: translateY.value === -200 ? 0 : 1,
    };
  });

  if (!visible) return null;

  // Configuration based on type
  let iconName: keyof typeof Ionicons.glyphMap = 'information-circle';
  let badgeBg = 'bg-blue-500';
  let borderLeftColor = 'border-l-blue-500';

  switch (type) {
    case 'pending':
      iconName = 'hourglass';
      badgeBg = 'bg-amber-500';
      borderLeftColor = 'border-l-amber-500';
      break;
    case 'confirmed':
      iconName = 'checkmark-circle';
      badgeBg = 'bg-emerald-500';
      borderLeftColor = 'border-l-emerald-500';
      break;
    case 'ongoing':
      iconName = 'play';
      badgeBg = 'bg-indigo-500';
      borderLeftColor = 'border-l-indigo-500';
      break;
    case 'completed':
      iconName = 'checkmark-done-circle';
      badgeBg = 'bg-cyan-500';
      borderLeftColor = 'border-l-cyan-500';
      break;
    case 'cancelled':
      iconName = 'close-circle';
      badgeBg = 'bg-rose-500';
      borderLeftColor = 'border-l-rose-500';
      break;
    case 'info':
      iconName = 'information-circle';
      badgeBg = 'bg-gray-500';
      borderLeftColor = 'border-l-gray-500';
      break;
  }

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: 16,
          right: 16,
          zIndex: 9999,
          top: insets.top + 8,
        },
        animatedStyle,
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={hide}
        className={`flex-row items-center p-3 rounded-2xl border-l-[6px] ${borderLeftColor} ${
          isDark ? 'bg-[#1e1e1e] border-t border-r border-b border-gray-800' : 'bg-white border-t border-r border-b border-gray-100'
        }`}
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.15,
          shadowRadius: 16,
          elevation: 8,
        }}
      >
        {/* Status Icon Indicator */}
        <View className={`w-10 h-10 rounded-xl items-center justify-center ${badgeBg}`}>
          <Ionicons name={iconName} size={22} color="white" />
        </View>

        {/* Text Content */}
        <View className="flex-1 ml-3 mr-2">
          <Text className="text-sm font-bold text-gray-900 dark:text-white" numberOfLines={1}>
            {title}
          </Text>
          <Text className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-4" numberOfLines={2}>
            {message}
          </Text>
        </View>

        {/* Dismiss Indicator */}
        <View className="opacity-40 p-1">
          <Ionicons name="chevron-up" size={16} color={colors.icon} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

PopUpNotification.displayName = 'PopUpNotification';
export default PopUpNotification;
