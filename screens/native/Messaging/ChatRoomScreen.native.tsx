import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import { Text } from '@/components/Text';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Conversation, formatTimestamp } from './InboxScreen.native';
import { getOrCreateConversation, sendMessage } from '@/api/endpoints/apiMessage';
import type { MessageResponseDTO } from '@/api/types';

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatMessageTime(isoString: string): string {
  if (!isoString) return '';
  try {
    return new Date(isoString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

function formatCountdown(seconds: number): string {
  if (seconds <= 0) return '0s';
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h remaining`;
  if (h > 0) return `${h}h ${m}m remaining`;
  return `${m}m remaining`;
}

// ─── Props ─────────────────────────────────────────────────────────────────────

interface ChatRoomScreenProps {
  conversation: Conversation;
  onBack: (updatedConv?: Conversation) => void;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function ChatRoomScreen({ conversation, onBack }: ChatRoomScreenProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();

  const [messages, setMessages] = useState<MessageResponseDTO[]>(
    conversation.conversationData.messages ?? [],
  );
  const [isReadOnly, setIsReadOnly] = useState(conversation.isReadOnly);
  const [timeRemaining, setTimeRemaining] = useState(conversation.timeRemainingSeconds);

  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const scrollViewRef = useRef<ScrollView>(null);
  const textInputRef = useRef<TextInput>(null);

  const bookingId = conversation.bookingId;
  const currentUserId = conversation.currentUserId;

  // ─── Refresh messages from API ──────────────────────────────────────────────

  const refreshMessages = useCallback(async () => {
    if (!bookingId) return;
    try {
      const res = await getOrCreateConversation(bookingId);
      if (res.success && res.data) {
        setMessages(res.data.messages ?? []);
        setIsReadOnly(res.data.isReadOnly);
        setTimeRemaining(res.data.timeRemainingSeconds);
      }
    } catch {
      // Silently fail on refresh — messages already loaded initially
    }
  }, [bookingId]);

  // Refresh messages on mount and poll for new messages (live fetching every 3s)
  useEffect(() => {
    refreshMessages();

    if (isReadOnly || !bookingId) return;

    const interval = setInterval(() => {
      refreshMessages();
    }, 3000);

    return () => clearInterval(interval);
  }, [bookingId, isReadOnly, refreshMessages]);

  // ─── Keyboard handling ──────────────────────────────────────────────────────

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates.height);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 300);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => setKeyboardHeight(0));

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages]);

  // ─── Send message ───────────────────────────────────────────────────────────

  const handleSendMessage = async () => {
    const trimmed = messageText.trim();
    if (!trimmed || isSending || isReadOnly || !bookingId) return;

    setSendError(null);
    setIsSending(true);

    // Optimistic local append
    const optimistic: MessageResponseDTO = {
      messageId: `optimistic-${Date.now()}`,
      senderId: currentUserId,
      senderName: 'You',
      content: trimmed,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setMessageText('');

    try {
      const res = await sendMessage(bookingId, trimmed);
      if (!res.success) {
        // Rollback optimistic message on failure
        setMessages((prev) => prev.filter((m) => m.messageId !== optimistic.messageId));
        setSendError(res.message ?? 'Failed to send message.');
      } else {
        // Refresh to get the real message with backend-assigned ID
        await refreshMessages();
      }
    } catch (err: any) {
      setMessages((prev) => prev.filter((m) => m.messageId !== optimistic.messageId));
      setSendError(err?.message ?? 'Network error. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleBack = () => {
    const lastMsg = messages.at(-1);
    const updatedConversation: Conversation = {
      ...conversation,
      lastMessage: lastMsg?.content ?? 'No messages yet',
      timestamp: lastMsg ? formatTimestamp(lastMsg.timestamp) : '',
      isReadOnly,
      timeRemainingSeconds: timeRemaining,
      conversationData: {
        ...conversation.conversationData,
        isReadOnly,
        timeRemainingSeconds: timeRemaining,
        messages,
      },
    };
    onBack(updatedConversation);
  };

  const inputAreaHeight = 60;

  // ─── Header info ────────────────────────────────────────────────────────────

  const subtitle =
    conversation.type === 'chatbot'
      ? 'AI Assistant'
      : isReadOnly
      ? 'Conversation ended'
      : formatCountdown(timeRemaining);

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <View className="flex-1 bg-white dark:bg-[#151718]">
      {/* Header */}
      <View
        className="flex-row items-center px-5 py-3 border-b border-gray-200 dark:border-[#2a2a2a]"
        style={{ paddingTop: insets.top > 0 ? insets.top : 12 }}
      >
        <TouchableOpacity onPress={handleBack} className="mr-3" activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} style={{ color: colors.primary }} />
        </TouchableOpacity>

        {/* Avatar */}
        <View
          className="w-10 h-10 rounded-full items-center justify-center mr-3 overflow-hidden"
          style={{ backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f3f4f6' }}
        >
          <Text className="text-base font-semibold" style={{ color: colors.primary }}>
            {conversation.name.charAt(0).toUpperCase()}
          </Text>
        </View>

        {/* Name + status */}
        <View className="flex-1">
          <Text className="text-base font-semibold" style={{ color: colors.text }}>
            {conversation.name}
          </Text>
          <View className="flex-row items-center">
            {isReadOnly && (
              <Ionicons name="lock-closed-outline" size={11} color={colors.icon} style={{ marginRight: 3 }} />
            )}
            <Text className="text-xs" style={{ color: isReadOnly ? colors.icon : colors.primary }}>
              {subtitle}
            </Text>
          </View>
        </View>
      </View>

      {/* Read-only banner */}
      {isReadOnly && (
        <View
          className="mx-4 mt-3 mb-1 px-4 py-2 rounded-xl flex-row items-center"
          style={{ backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f3f4f6' }}
        >
          <Ionicons name="lock-closed-outline" size={15} color={colors.icon} style={{ marginRight: 8 }} />
          <Text className="text-xs flex-1" style={{ color: colors.icon }}>
            This conversation is now read-only. The 3-day messaging window has ended.
          </Text>
        </View>
      )}

      {/* Messages area */}
      <ScrollView
        ref={scrollViewRef}
        className="flex-1 px-5"
        contentContainerStyle={{
          paddingVertical: 16,
          paddingBottom: keyboardHeight > 0 ? keyboardHeight + inputAreaHeight : inputAreaHeight,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.length === 0 && (
          <View className="flex-1 items-center justify-center mt-12">
            <Ionicons name="chatbubble-ellipses-outline" size={44} color={colors.icon} />
            <Text className="mt-3 text-sm text-center" style={{ color: colors.icon }}>
              No messages yet.{'\n'}
              {!isReadOnly && 'Say hello!'}
            </Text>
          </View>
        )}

        {messages.map((msg) => {
          const isOutgoing = msg.senderId === currentUserId;
          return (
            <View
              key={msg.messageId}
              className={`mb-4 ${isOutgoing ? 'items-end' : 'items-start'}`}
            >
              {/* Sender name (only for incoming) */}
              {!isOutgoing && (
                <Text className="text-xs mb-1 px-2" style={{ color: colors.icon }}>
                  {msg.senderName}
                </Text>
              )}

              {/* Bubble */}
              <View
                className="px-4 py-3 rounded-2xl max-w-[80%]"
                style={{
                  backgroundColor: isOutgoing
                    ? colors.primary
                    : colorScheme === 'dark'
                    ? '#2a2a2a'
                    : '#f3f4f6',
                }}
              >
                <Text
                  className="text-sm"
                  style={{ color: isOutgoing ? '#fff' : colors.text }}
                >
                  {msg.content}
                </Text>
              </View>

              {/* Timestamp */}
              <Text className="text-xs mt-1 px-2" style={{ color: colors.icon }}>
                {formatMessageTime(msg.timestamp)}
              </Text>
            </View>
          );
        })}
      </ScrollView>

      {/* Send error */}
      {sendError && (
        <View className="mx-5 mb-1 px-4 py-2 rounded-xl" style={{ backgroundColor: '#fee2e2' }}>
          <Text className="text-xs text-red-600">{sendError}</Text>
        </View>
      )}

      {/* Input area */}
      {!isReadOnly && (
        <View
          className="flex-row items-center px-5 py-2 border-t border-gray-200 dark:border-[#2a2a2a] absolute left-0 right-0"
          style={{
            backgroundColor: colorScheme === 'dark' ? '#151718' : '#fff',
            borderTopColor: colorScheme === 'dark' ? '#2a2a2a' : '#e5e7eb',
            bottom: keyboardHeight > 0 ? keyboardHeight : insets.bottom,
          }}
        >
          <View
            className="flex-1 flex-row items-center px-4 py-2 rounded-full mr-3"
            style={{ backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f3f4f6' }}
          >
            <TextInput
              ref={textInputRef}
              placeholder="Type your message here!"
              placeholderTextColor={colors.icon}
              value={messageText}
              onChangeText={setMessageText}
              onSubmitEditing={handleSendMessage}
              className="flex-1 text-sm"
              style={{ color: colors.text }}
              multiline
              maxLength={500}
              onFocus={() => {
                setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 300);
              }}
            />
          </View>
          <TouchableOpacity
            onPress={handleSendMessage}
            activeOpacity={0.7}
            disabled={isSending || !messageText.trim()}
          >
            {isSending ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Ionicons
                name="send"
                size={24}
                style={{
                  color: messageText.trim() ? colors.primary : colors.icon,
                  opacity: messageText.trim() ? 1 : 0.4,
                }}
              />
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
