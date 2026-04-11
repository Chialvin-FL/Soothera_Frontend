import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput, Image, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/Text';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Header } from '@/components/native/Header';
import { RisingItem } from '@/components/native/RisingItem';
import ChatRoomScreen from './ChatRoomScreen.native';
import InboxTabNavigation, { InboxTabType } from './components/InboxTabNavigation';
import type { UIRole } from '@/navigation/hooks/useSessionLoader';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { topRatedSalons } from '../Home/configs/mockData';
import { getSalonDetails } from '../Home/configs/mockData';
import { Therapist } from '../Home/types/SalonDetails';

export interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unreadCount?: number;
  avatar?: string;
  isOnline?: boolean;
  type: 'salon' | 'therapist' | 'chatbot';
  salonId?: string; // Reference to salon if type is 'salon'
  therapistId?: string; // Reference to therapist if type is 'therapist'
  salonTherapistId?: string; // Reference to salon if therapist belongs to a salon
  chatbotId?: string; // Reference to chatbot if type is 'chatbot'
}

// Mock chatbot data
const mockChatbots = [
  { id: '1', name: 'Soothera Assistant', description: 'Your wellness companion' },
  { id: '2', name: 'Booking Helper', description: 'Help with appointments' },
];

// Helper to get therapist name from salon
const getTherapistFromSalon = (salonId: string, therapistId: string): { name: string; title: string } | null => {
  const salonDetails = getSalonDetails(salonId);
  if (!salonDetails) return null;
  const therapist = salonDetails.therapists.find(t => t.id === therapistId);
  if (!therapist) return null;
  return { name: therapist.name, title: therapist.title };
};

// Mock data for conversations - related to actual salons, therapists, and chatbots
const mockConversations: Conversation[] = [
  // Massage spa conversations
  {
    id: '1',
    name: topRatedSalons[0].name,
    lastMessage: 'Your appointment is confirmed for tomorrow at 2:00 PM. See you soon!',
    timestamp: '12:40 PM',
    unreadCount: 3,
    type: 'salon',
    salonId: topRatedSalons[0].id,
    avatar: undefined,
    isOnline: true
  },
  {
    id: '3',
    name: topRatedSalons[2].name,
    lastMessage: 'We have a special promotion this week! Book now and get 20% off.',
    timestamp: '04:40 PM',
    unreadCount: 4,
    type: 'salon',
    salonId: topRatedSalons[2].id,
    avatar: undefined,
    isOnline: false
  },
  {
    id: '6',
    name: topRatedSalons[5].name,
    lastMessage: 'Thank you for your booking! We\'re looking forward to serving you.',
    timestamp: '10:10 AM',
    unreadCount: 2,
    type: 'salon',
    salonId: topRatedSalons[5].id,
    avatar: undefined,
    isOnline: true
  },
  // Therapist conversations (from salons)
  {
    id: '2',
    name: 'Kathryn Murphy',
    lastMessage: 'Hi! I\'m available for your massage session. What time works for you?',
    timestamp: '01:40 AM',
    type: 'therapist',
    therapistId: '1',
    salonTherapistId: '1', // From Salon Elite
    avatar: undefined,
    isOnline: true
  },
  {
    id: '4',
    name: 'Esther Howard',
    lastMessage: 'I\'ve prepared everything for your appointment. See you in 30 minutes!',
    timestamp: '09:30 AM',
    type: 'therapist',
    therapistId: '2',
    salonTherapistId: '1', // From Salon Elite
    avatar: undefined,
    isOnline: false
  },
  {
    id: '7',
    name: 'Jane Smith',
    lastMessage: 'Your massage room is ready. Please let me know if you need any adjustments.',
    timestamp: '03:25 PM',
    type: 'therapist',
    therapistId: '3',
    salonTherapistId: '2', // From Beauty Haven
    avatar: undefined,
    isOnline: true
  },
  // Chatbot conversations
  {
    id: '5',
    name: mockChatbots[0].name,
    lastMessage: 'I can help you find the perfect massage spa or book an appointment. What would you like to do?',
    timestamp: '08:40 AM',
    type: 'chatbot',
    chatbotId: mockChatbots[0].id,
    avatar: undefined,
    isOnline: true
  },
  {
    id: '8',
    name: mockChatbots[1].name,
    lastMessage: 'I found 3 available time slots for tomorrow. Would you like to see them?',
    timestamp: '07:00 AM',
    unreadCount: 1,
    type: 'chatbot',
    chatbotId: mockChatbots[1].id,
    avatar: undefined,
    isOnline: true
  },
];

interface InboxScreenProps {
  onChatRoomChange?: (isActive: boolean) => void;
  onNavigateToProfile?: () => void;
  useNavigatorOverlays?: boolean;
  onNavigateChatRoom?: (conversation: Conversation) => void;
  onNavigateNotifications?: () => void;
  userRole?: UIRole | null;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TRANSITION_DURATION = 300;

export default function InboxScreen({ onChatRoomChange, onNavigateToProfile, useNavigatorOverlays = false, onNavigateChatRoom, onNavigateNotifications, userRole }: InboxScreenProps = {}) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<InboxTabType>('all');
  const maxAnimatedItems = 8;
  const baseItemDelay = 120;
  const perItemDelay = 110;

  // Shared value for horizontal slide transition
  const chatTranslateX = useSharedValue(SCREEN_WIDTH);

  // Filter conversations based on active tab and search query
  const filteredConversations = mockConversations.filter(conv => {
    // Filter by tab
    const matchesTab = activeTab === 'all' || conv.type === activeTab;

    // Filter by search query
    const matchesSearch = searchQuery === '' ||
      conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  // Handle conversation press
  const handleConversationPress = (conversationId: string) => {
    if (useNavigatorOverlays) {
      const conversation = mockConversations.find(c => c.id === conversationId);
      if (conversation) {
        onNavigateChatRoom?.(conversation);
      }
      return;
    }
    setSelectedConversationId(conversationId);
  };

  // Handle back from chat room
  const handleBackFromChatRoom = () => {
    chatTranslateX.value = withTiming(
      SCREEN_WIDTH,
      { duration: TRANSITION_DURATION },
      () => {
        runOnJS(setSelectedConversationId)(null);
      }
    );
  };

  // Notify parent when chat room is shown/hidden
  React.useEffect(() => {
    onChatRoomChange?.(selectedConversationId !== null);
  }, [selectedConversationId, onChatRoomChange]);
  // Animate chat room when it becomes active
  React.useEffect(() => {
    if (selectedConversationId) {
      chatTranslateX.value = withTiming(0, { duration: TRANSITION_DURATION });
    } else {
      chatTranslateX.value = SCREEN_WIDTH;
    }
  }, [selectedConversationId, chatTranslateX]);

  const chatAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: chatTranslateX.value }],
  }));

  return (
    <View className="flex-1 bg-white dark:bg-[#151718]">
      {/* Header Section */}
      <RisingItem delay={0}>
        <Header
          onProfilePress={onNavigateToProfile}
          onNotificationPress={onNavigateNotifications}
        />
      </RisingItem>

      {/* Search Bar */}
      <RisingItem delay={60}>
        <View className="px-5 py-2 mb-2">
          <View className="flex-row items-center bg-gray-100 dark:bg-[#2a2a2a] rounded-full px-4 py-1">
            <Ionicons name="search-outline" size={20} color={colors.icon} />
            <TextInput
              placeholder="Search"
              placeholderTextColor={colors.icon}
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="flex-1 ml-2 text-base"
              style={{ color: colors.text }}
            />
          </View>
        </View>
      </RisingItem>

      {/* Tab Navigation */}
      <RisingItem delay={80}>
        <InboxTabNavigation
          activeTab={activeTab}
          onTabPress={setActiveTab}
          userRole={userRole}
        />
      </RisingItem>

      {/* Conversations List */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 70 }}
      >
        {filteredConversations.map((conversation, index) => {
          const delay = baseItemDelay + Math.min(index, maxAnimatedItems) * perItemDelay;

          // Get avatar/image based on conversation type
          const getConversationAvatar = () => {
            if (conversation.type === 'salon' && conversation.salonId) {
              const salon = topRatedSalons.find(s => s.id === conversation.salonId);
              return salon?.image;
            } else if (conversation.type === 'therapist' && conversation.salonTherapistId && conversation.therapistId) {
              const salonDetails = getSalonDetails(conversation.salonTherapistId);
              if (salonDetails) {
                const therapist = salonDetails.therapists.find(t => t.id === conversation.therapistId);
                return therapist?.image;
              }
            }
            return conversation.avatar ? { uri: conversation.avatar } : undefined;
          };

          const avatarSource = getConversationAvatar();

          return (
            <RisingItem key={conversation.id} delay={delay}>
              <TouchableOpacity
                onPress={() => handleConversationPress(conversation.id)}
                className="flex-row items-center px-5 py-4 border-b border-gray-100 dark:border-[#2a2a2a]"
                activeOpacity={0.7}
              >
                {/* Avatar */}
                <View className="w-12 h-12 rounded-full bg-gray-200 dark:bg-[#2a2a2a] items-center justify-center mr-3 overflow-hidden">
                  {avatarSource ? (
                    <Image
                      source={avatarSource}
                      className="w-12 h-12 rounded-full"
                      resizeMode="cover"
                    />
                  ) : (
                    <Text
                      className="text-lg font-semibold"
                      style={{ color: colors.primary }}
                    >
                      {conversation.name.charAt(0).toUpperCase()}
                    </Text>
                  )}
                </View>

                {/* Conversation Info */}
                <View className="flex-1">
                  <View className="flex-row items-center justify-between mb-1">
                    <Text
                      className="text-base font-semibold"
                      style={{ color: colors.text }}
                    >
                      {conversation.name}
                    </Text>
                    <Text
                      className="text-xs"
                      style={{ color: colors.icon }}
                    >
                      {conversation.timestamp}
                    </Text>
                  </View>
                  <View className="flex-row items-center justify-between">
                    <Text
                      className="text-sm flex-1 mr-2"
                      numberOfLines={1}
                      style={{ color: colors.icon }}
                    >
                      {conversation.lastMessage}
                    </Text>
                    {conversation.unreadCount && conversation.unreadCount > 0 && (
                      <View
                        className="min-w-[20px] h-5 rounded-full items-center justify-center px-1.5"
                        style={{ backgroundColor: colors.primary }}
                      >
                        <Text
                          className="text-xs font-semibold"
                          style={{ color: '#fff' }}
                        >
                          {conversation.unreadCount}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            </RisingItem>
          );
        })}
      </ScrollView>

      {/* Chat Room overlay with horizontal "next page" transition */}
      {!useNavigatorOverlays && selectedConversationId && (
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 5,
            },
            chatAnimatedStyle,
          ]}
        >
          {(() => {
            const conversation = mockConversations.find(c => c.id === selectedConversationId);
            if (!conversation) return null;
            return (
              <ChatRoomScreen
                conversation={conversation}
                onBack={handleBackFromChatRoom}
              />
            );
          })()}
        </Animated.View>
      )}
    </View>
  );
}
