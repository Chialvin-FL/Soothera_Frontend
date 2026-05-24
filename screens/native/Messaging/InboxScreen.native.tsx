import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
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
import { getBookings } from '@/api/endpoints/apiBooking';
import { getOrCreateConversation } from '@/api/endpoints/apiMessage';
import type { ConversationResponseDTO } from '@/api/types';

// ─── Conversation type shared with ChatRoomScreen + navigation stack ───────────
export interface Conversation {
  /** conversationId from the backend */
  id: string;
  bookingId: string;
  /** Display name shown in the inbox row (the *other* party's name) */
  name: string;
  /** Last message content preview */
  lastMessage: string;
  /** Formatted time of the last message */
  timestamp: string;
  unreadCount?: number;
  type: 'salon' | 'chatbot';
  isReadOnly: boolean;
  timeRemainingSeconds: number;
  customerId: string;
  customerName: string;
  staffId: string;
  staffName: string;
  /** The UID of the currently logged-in user — needed in ChatRoomScreen to decide bubble direction */
  currentUserId: string;
  /** Full conversation data from the backend (includes messages array) */
  conversationData: ConversationResponseDTO;
}

// ─── Mock chatbot data ─────────────────────────────────────────────────────────
const mockChatbots = [
  { id: 'cb1', name: 'Soothera Assistant', description: 'Your wellness companion', lastMessage: 'I can help you find the perfect massage spa or book an appointment. What would you like to do?', timestamp: '08:40 AM' },
  { id: 'cb2', name: 'Booking Helper', description: 'Help with appointments', lastMessage: 'I found 3 available time slots for tomorrow. Would you like to see them?', timestamp: '07:00 AM' },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

export function formatTimestamp(isoString: string): string {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    const now = new Date();
    const isToday =
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate();
    if (isToday) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return isoString;
  }
}

// ─── Component props ───────────────────────────────────────────────────────────

interface InboxScreenProps {
  onChatRoomChange?: (isActive: boolean) => void;
  onNavigateToProfile?: () => void;
  useNavigatorOverlays?: boolean;
  onNavigateChatRoom?: (conversation: Conversation) => void;
  onNavigateNotifications?: () => void;
  userRole?: UIRole | null;
  userProfilePic?: string | null;
  /** UID of the logged-in user — used to derive the "other party" display name */
  currentUserId?: string | null;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TRANSITION_DURATION = 300;

export default function InboxScreen({
  onChatRoomChange,
  onNavigateToProfile,
  useNavigatorOverlays = false,
  onNavigateChatRoom,
  onNavigateNotifications,
  userRole,
  userProfilePic,
  currentUserId,
}: InboxScreenProps = {}) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<InboxTabType>('all');

  const maxAnimatedItems = 8;
  const baseItemDelay = 120;
  const perItemDelay = 110;

  // Shared value for horizontal slide transition
  const chatTranslateX = useSharedValue(SCREEN_WIDTH);

  // ─── Load conversations from API ─────────────────────────────────────────────

  const loadConversations = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    setError(null);
    try {
      // Fetch bookings for the current user
      const bookingParams: Record<string, unknown> = { pageSize: 100 };
      if (userRole === 'therapist' && currentUserId) {
        bookingParams.staffId = currentUserId;
      } else if (currentUserId) {
        bookingParams.customerId = currentUserId;
      }

      const bookingsRes = await getBookings(bookingParams as any);
      const bookings = bookingsRes?.data?.items ?? [];

      // Filter client-side for Confirmed, Ongoing, or Completed bookings
      const eligibleBookings = bookings.filter((b) => {
        const statusStr = String(b.status ?? '').toLowerCase();
        return (
          statusStr === '1' ||
          statusStr === 'confirmed' ||
          statusStr === '2' ||
          statusStr === 'ongoing' ||
          statusStr === 'in progress' ||
          statusStr === '3' ||
          statusStr === 'completed'
        );
      });

      // Fetch conversations in parallel for all eligible bookings
      const settled = await Promise.allSettled(
        eligibleBookings.map((b) => getOrCreateConversation(b.bookingId)),
      );

      const loaded: Conversation[] = [];
      settled.forEach((result, idx) => {
        if (result.status === 'fulfilled' && result.value.success && result.value.data) {
          const conv = result.value.data;
          const booking = eligibleBookings[idx];
          const uid = currentUserId ?? '';

          // The "other party" name depends on who is logged in
          const otherName =
            userRole === 'therapist'
              ? conv.customerName
              : conv.staffName || 'Therapist';

          const lastMsg = conv.messages.at(-1);
          loaded.push({
            id: conv.conversationId,
            bookingId: conv.bookingId,
            name: otherName || booking.establishmentName,
            lastMessage: lastMsg?.content ?? 'No messages yet',
            timestamp: lastMsg ? formatTimestamp(lastMsg.timestamp) : '',
            type: 'salon',
            isReadOnly: conv.isReadOnly,
            timeRemainingSeconds: conv.timeRemainingSeconds,
            customerId: conv.customerId,
            customerName: conv.customerName,
            staffId: conv.staffId,
            staffName: conv.staffName,
            currentUserId: uid,
            conversationData: conv,
          });
        }
      });

      setConversations(loaded);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load conversations.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [userRole, currentUserId]);

  // Load conversations on mount and set up background polling (every 8 seconds) for live updates
  useEffect(() => {
    loadConversations();

    const interval = setInterval(() => {
      loadConversations(true);
    }, 8000);

    return () => clearInterval(interval);
  }, [loadConversations]);

  // ─── Build chatbot pseudo-conversations ──────────────────────────────────────

  const chatbotConversations: Conversation[] = mockChatbots.map((bot) => ({
    id: bot.id,
    bookingId: '',
    name: bot.name,
    lastMessage: bot.lastMessage,
    timestamp: bot.timestamp,
    type: 'chatbot',
    isReadOnly: false,
    timeRemainingSeconds: 0,
    customerId: '',
    customerName: '',
    staffId: '',
    staffName: '',
    currentUserId: currentUserId ?? '',
    conversationData: {
      conversationId: bot.id,
      bookingId: '',
      customerId: '',
      customerName: '',
      staffId: '',
      staffName: '',
      activatedDate: '',
      isReadOnly: false,
      timeRemainingSeconds: 0,
      messages: [],
    },
  }));

  // ─── Filtering ───────────────────────────────────────────────────────────────

  const allConversations = [...conversations, ...chatbotConversations];

  const filteredConversations = allConversations.filter((conv) => {
    const matchesTab = activeTab === 'all' || conv.type === activeTab;
    const matchesSearch =
      searchQuery === '' ||
      conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // ─── Navigation ──────────────────────────────────────────────────────────────

  const handleConversationPress = (conversationId: string) => {
    const conversation = allConversations.find((c) => c.id === conversationId);
    if (!conversation) return;
    if (useNavigatorOverlays) {
      onNavigateChatRoom?.(conversation);
      return;
    }
    setSelectedConversationId(conversationId);
  };

  const handleBackFromChatRoom = (updatedConv?: Conversation) => {
    chatTranslateX.value = withTiming(SCREEN_WIDTH, { duration: TRANSITION_DURATION }, () => {
      runOnJS(setSelectedConversationId)(null);
    });
    if (updatedConv) {
      setConversations((prev) =>
        prev.map((c) => (c.bookingId === updatedConv.bookingId ? updatedConv : c))
      );
    }
    // Silently refresh so any sent messages appear when user goes back to inbox
    loadConversations(true);
  };

  React.useEffect(() => {
    onChatRoomChange?.(selectedConversationId !== null);
  }, [selectedConversationId, onChatRoomChange]);

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

  // ─── Render ──────────────────────────────────────────────────────────────────

  const selectedConversation = allConversations.find((c) => c.id === selectedConversationId) ?? null;

  return (
    <View className="flex-1 bg-white dark:bg-[#151718]">
      {/* Header */}
      <RisingItem delay={0}>
        <Header
          onProfilePress={onNavigateToProfile}
          onNotificationPress={onNavigateNotifications}
          profilePic={userProfilePic}
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

      {/* Body */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
          <Text className="mt-3 text-sm" style={{ color: colors.icon }}>
            Loading conversations…
          </Text>
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="cloud-offline-outline" size={48} color={colors.icon} />
          <Text className="mt-3 text-base font-semibold text-center" style={{ color: colors.text }}>
            Could not load messages
          </Text>
          <Text className="mt-1 text-sm text-center" style={{ color: colors.icon }}>
            {error}
          </Text>
          <TouchableOpacity
            className="mt-4 px-6 py-2 rounded-full"
            style={{ backgroundColor: colors.primary }}
            onPress={() => loadConversations()}
          >
            <Text className="text-white font-semibold text-sm">Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 70 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => {
                setIsRefreshing(true);
                loadConversations(true);
              }}
              tintColor={colors.primary}
            />
          }
        >
          {filteredConversations.length === 0 ? (
            <View className="flex-1 items-center justify-center mt-20 px-8">
              <Ionicons name="chatbubbles-outline" size={52} color={colors.icon} />
              <Text className="mt-3 text-base font-semibold text-center" style={{ color: colors.text }}>
                No conversations yet
              </Text>
              <Text className="mt-1 text-sm text-center" style={{ color: colors.icon }}>
                Conversations appear here once a booking is confirmed.
              </Text>
            </View>
          ) : (
            filteredConversations.map((conversation, index) => {
              const delay = baseItemDelay + Math.min(index, maxAnimatedItems) * perItemDelay;
              return (
                <RisingItem key={conversation.id} delay={delay}>
                  <TouchableOpacity
                    onPress={() => handleConversationPress(conversation.id)}
                    className="flex-row items-center px-5 py-4 border-b border-gray-100 dark:border-[#2a2a2a]"
                    activeOpacity={0.7}
                  >
                    {/* Avatar */}
                    <View
                      className="w-12 h-12 rounded-full items-center justify-center mr-3 overflow-hidden"
                      style={{ backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f3f4f6' }}
                    >
                      <Text
                        className="text-lg font-semibold"
                        style={{ color: colors.primary }}
                      >
                        {conversation.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>

                    {/* Info */}
                    <View className="flex-1">
                      <View className="flex-row items-center justify-between mb-1">
                        <View className="flex-row items-center flex-1 mr-2">
                          <Text
                            className="text-base font-semibold mr-2"
                            style={{ color: colors.text }}
                            numberOfLines={1}
                          >
                            {conversation.name}
                          </Text>
                          {conversation.isReadOnly && (
                            <Ionicons name="lock-closed-outline" size={13} color={colors.icon} />
                          )}
                        </View>
                        <Text className="text-xs" style={{ color: colors.icon }}>
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
                        {(conversation.unreadCount ?? 0) > 0 && (
                          <View
                            className="min-w-[20px] h-5 rounded-full items-center justify-center px-1.5"
                            style={{ backgroundColor: colors.primary }}
                          >
                            <Text className="text-xs font-semibold" style={{ color: '#fff' }}>
                              {conversation.unreadCount}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                </RisingItem>
              );
            })
          )}
        </ScrollView>
      )}

      {/* Chat Room overlay (when NOT using navigator overlays) */}
      {!useNavigatorOverlays && selectedConversationId && selectedConversation && (
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
          <ChatRoomScreen
            conversation={selectedConversation}
            onBack={handleBackFromChatRoom}
          />
        </Animated.View>
      )}
    </View>
  );
}
