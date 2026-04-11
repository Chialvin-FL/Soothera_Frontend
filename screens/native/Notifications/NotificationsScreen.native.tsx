import React from 'react';
import { View, ScrollView, Image, TouchableOpacity, Pressable } from 'react-native';
import { Text } from '@/components/Text';
import { Ionicons } from '@expo/vector-icons';
import { Colors, primaryColor } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface NotificationItem {
  id: string;
  type: 'appointment' | 'cancellation' | 'reschedule';
  salonName: string;
  serviceName: string;
  date: string;
  time: string;
  timestamp: string;
  avatar?: string;
  isRead: boolean;
}

interface NotificationsScreenProps {
  onBack?: () => void;
}

export default function NotificationsScreen({ onBack }: NotificationsScreenProps = {}) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();

  // Mock notification data
  const notifications: NotificationItem[] = [
    {
      id: '1',
      type: 'appointment',
      salonName: 'Massage Spa Elite',
      serviceName: 'Haircut & Styling',
      date: 'Tomorrow',
      time: '2:00 PM',
      timestamp: '2h',
      isRead: false,
    },
    {
      id: '2',
      type: 'cancellation',
      salonName: 'Beauty Haven',
      serviceName: 'Facial Treatment',
      date: 'December 20, 2024',
      time: '10:00 AM',
      timestamp: '5h',
      isRead: false,
    },
    {
      id: '3',
      type: 'reschedule',
      salonName: 'Style Studio',
      serviceName: 'Manicure & Pedicure',
      date: 'December 22, 2024',
      time: '3:30 PM',
      timestamp: '1d',
      isRead: true,
    },
    {
      id: '4',
      type: 'appointment',
      salonName: 'Glamour House',
      serviceName: 'Hair Color',
      date: 'December 25, 2024',
      time: '11:00 AM',
      timestamp: '2d',
      isRead: true,
    },
    {
      id: '5',
      type: 'cancellation',
      salonName: 'Luxury Spa',
      serviceName: 'Full Body Massage',
      date: 'December 18, 2024',
      time: '4:00 PM',
      timestamp: '3d',
      isRead: true,
    },
    {
      id: '6',
      type: 'reschedule',
      salonName: 'Relaxation Center',
      serviceName: 'Deep Tissue Massage',
      date: 'December 24, 2024',
      time: '1:00 PM',
      timestamp: '4d',
      isRead: true,
    },
    {
      id: '7',
      type: 'appointment',
      salonName: 'Wellness Studio',
      serviceName: 'Aromatherapy Session',
      date: 'December 26, 2024',
      time: '9:30 AM',
      timestamp: '5d',
      isRead: true,
    },
    {
      id: '8',
      type: 'cancellation',
      salonName: 'Massage Spa Elite',
      serviceName: 'Hair Treatment',
      date: 'December 19, 2024',
      time: '2:30 PM',
      timestamp: '6d',
      isRead: true,
    },
  ];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'appointment':
        return 'calendar-outline';
      case 'cancellation':
        return 'close-circle-outline';
      case 'reschedule':
        return 'time-outline';
      default:
        return 'notifications-outline';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'appointment':
        return '#4C7A6C'; // primaryColor
      case 'cancellation':
        return '#EF4444'; // red
      case 'reschedule':
        return '#F59E0B'; // orange/amber
      default:
        return colors.icon;
    }
  };

  const getNotificationMessage = (notification: NotificationItem) => {
    switch (notification.type) {
      case 'appointment':
        return `Your appointment for ${notification.serviceName} is scheduled for ${notification.date} at ${notification.time}.`;
      case 'cancellation':
        return `Your appointment for ${notification.serviceName} on ${notification.date} at ${notification.time} has been cancelled.`;
      case 'reschedule':
        return `Your appointment for ${notification.serviceName} has been rescheduled to ${notification.date} at ${notification.time}.`;
      default:
        return '';
    }
  };

  return (
    <View className="flex-1 bg-white dark:bg-[#151718]">
      {/* Header */}
      <View className="flex-row items-center px-5 pt-4 pb-4 border-b border-gray-200 dark:border-[#2a2a2a]" style={{paddingTop: insets.top}}>
        <TouchableOpacity
          onPress={onBack}
          className="mr-4"
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text className="text-xl font-bold" style={{ color: colors.text }}>
          Notifications
        </Text>
      </View>

      {/* Notifications List */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {notifications.map((notification) => {
          const iconName = getNotificationIcon(notification.type);
          const iconColor = getNotificationColor(notification.type);
          const message = getNotificationMessage(notification);

          return (
            <View
              key={notification.id}
              className={`px-5 py-4 border-b border-gray-100 dark:border-[#2a2a2a] ${
                !notification.isRead ? 'bg-blue-50/30 dark:bg-blue-950/20' : ''
              }`}
            >
              <View className="flex-row">
                {/* Avatar/Icon */}
                <View className="relative mr-3">
                  <View
                    className="w-14 h-14 rounded-full justify-center items-center"
                    style={{ backgroundColor: iconColor + '20' }}
                  >
                    <Ionicons name={iconName as any} size={28} color={iconColor} />
                  </View>
                  {/* Badge indicator for unread */}
                  {!notification.isRead && (
                    <View
                      className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2"
                      style={{
                        backgroundColor: primaryColor,
                        borderColor: colors.background,
                      }}
                    />
                  )}
                </View>

                {/* Content */}
                <View className="flex-1 mr-2">
                  <View className="flex-row items-start justify-between mb-1">
                    <View className="flex-1">
                      <Text className="text-base font-semibold mb-1" style={{ color: colors.text }}>
                        {notification.salonName}
                      </Text>
                      <Text className="text-sm leading-5" style={{ color: colors.icon }}>
                        {message}
                      </Text>
                    </View>
                    <Pressable className="ml-2">
                      <Ionicons name="ellipsis-horizontal" size={20} color={colors.icon} />
                    </Pressable>
                  </View>

                  {/* Timestamp */}
                  <Text className="text-xs mt-1" style={{ color: colors.icon }}>
                    {notification.timestamp}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
