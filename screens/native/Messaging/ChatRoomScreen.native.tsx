import React, { useState, useRef, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput, Image, Platform, Keyboard } from 'react-native';
import { Text } from '@/components/Text';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Conversation } from './InboxScreen.native';
import { getSalonDetails } from '../Home/configs/mockData';
import { topRatedSalons } from '../Home/configs/mockData';

interface Message {
  id: string;
  text: string;
  isOutgoing: boolean;
  timestamp: string;
  media?: {
    type: 'music';
    title: string;
    artist?: string;
  };
}

interface ChatRoomScreenProps {
  conversation: Conversation;
  onBack: () => void;
}

// Mock messages – massage appointment conversation
const mockMessages: Message[] = [
  { id: '1', text: 'Hi! Just confirming your massage appointment for tomorrow at 2:00 PM.', isOutgoing: false, timestamp: '10:15 AM' },
  { id: '2', text: 'Yes, that works for me. Thank you!', isOutgoing: true, timestamp: '10:18 AM' },
  { id: '3', text: 'Great! Any areas you’d like us to focus on?', isOutgoing: false, timestamp: '10:20 AM' },
  { id: '4', text: 'My shoulders and lower back have been really tense.', isOutgoing: true, timestamp: '10:22 AM' },
  { id: '5', text: 'We’ll give extra attention to those areas. Do you prefer deep tissue or Swedish?', isOutgoing: false, timestamp: '10:25 AM' },
  { id: '6', text: 'Deep tissue please.', isOutgoing: true, timestamp: '10:26 AM' },
  { id: '7', text: 'Noted. See you tomorrow at 2 PM. Please arrive 10 mins early if it’s your first visit.', isOutgoing: false, timestamp: '10:28 AM' },
  { id: '8', text: 'Will do. Looking forward to it!', isOutgoing: true, timestamp: '10:30 AM' },
];

export default function ChatRoomScreen({ conversation, onBack }: ChatRoomScreenProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const textInputRef = useRef<TextInput>(null);

  // Get related information based on conversation type
  const getConversationInfo = () => {
    if (conversation.type === 'salon' && conversation.salonId) {
      const salon = topRatedSalons.find(s => s.id === conversation.salonId);
      if (salon) {
        return {
          name: salon.name,
          subtitle: salon.location,
          avatar: salon.image,
          rating: salon.rating,
        };
      }
    } else if (conversation.type === 'therapist' && conversation.salonTherapistId && conversation.therapistId) {
      const salonDetails = getSalonDetails(conversation.salonTherapistId);
      if (salonDetails) {
        const therapist = salonDetails.therapists.find(t => t.id === conversation.therapistId);
        if (therapist) {
          return {
            name: therapist.name,
            subtitle: `${therapist.title} at ${salonDetails.name}`,
            avatar: therapist.image,
            rating: therapist.rating,
          };
        }
      }
    } else if (conversation.type === 'chatbot') {
      return {
        name: conversation.name,
        subtitle: 'AI Assistant',
        avatar: undefined,
        rating: undefined,
      };
    }
    return {
      name: conversation.name,
      subtitle: conversation.isOnline ? 'Online' : 'Offline',
      avatar: conversation.avatar,
      rating: undefined,
    };
  };

  const conversationInfo = getConversationInfo();

  // Handle keyboard show/hide
  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
        // Scroll to bottom when keyboard appears
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 300);
      }
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  // Handle send message
  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: message.trim(),
        isOutgoing: true,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([...messages, newMessage]);
      setMessage('');
    }
  };

  // Calculate input area height (approximate)
  const inputAreaHeight = 60;

  return (
    <View className="flex-1 bg-white dark:bg-[#151718]">
      {/* Header */}
      <View
        className="flex-row items-center px-5 py-3 border-b border-gray-200 dark:border-[#2a2a2a]"
      >
        <TouchableOpacity onPress={onBack} className="mr-3" activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} style={{ color: colors.primary }} />
        </TouchableOpacity>

        {/* Profile Picture */}
        <View className="w-10 h-10 rounded-full bg-gray-200 dark:bg-[#2a2a2a] items-center justify-center mr-3 overflow-hidden">
          {conversationInfo.avatar != null ? (
            <Image
              source={
                typeof conversationInfo.avatar === 'string'
                  ? { uri: conversationInfo.avatar }
                  : conversationInfo.avatar
              }
              className="w-10 h-10 rounded-full"
              resizeMode="cover"
            />
          ) : (
            <Text
              className="text-base font-semibold"
              style={{ color: colors.primary }}
            >
              {conversationInfo.name.charAt(0).toUpperCase()}
            </Text>
          )}
        </View>

        {/* Name and Status */}
        <View className="flex-1">
          <Text
            className="text-base font-semibold"
            style={{ color: colors.text }}
          >
            {conversationInfo.name}
          </Text>
          <View className="flex-row items-center">
            <Text
              className="text-xs mr-2"
              style={{ color: colors.icon }}
            >
              {conversationInfo.subtitle}
            </Text>
            {conversationInfo.rating !== undefined && (
              <View className="flex-row items-center">
                <Ionicons name="star" size={12} color="#FFD700" />
                <Text
                  className="text-xs ml-1"
                  style={{ color: colors.icon }}
                >
                  {conversationInfo.rating.toFixed(1)}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Messages Area */}
      <ScrollView
        ref={scrollViewRef}
        className="flex-1 px-5"
        contentContainerStyle={{
          paddingVertical: 16,
          paddingBottom: keyboardHeight > 0 ? keyboardHeight + inputAreaHeight : inputAreaHeight
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((msg) => (
          <View
            key={msg.id}
            className={`mb-4 ${msg.isOutgoing ? 'items-end' : 'items-start'}`}
          >
            {msg.media ? (
              // Media Message (Music Card)
              <View
                className="px-4 py-3 rounded-2xl max-w-[80%]"
                style={{
                  backgroundColor: msg.isOutgoing ? colors.primary : (colorScheme === 'dark' ? '#2a2a2a' : '#f3f4f6'),
                }}
              >
                <View className="flex-row items-center">
                  <Ionicons
                    name="musical-notes"
                    size={24}
                    style={{ color: msg.isOutgoing ? '#fff' : colors.primary, marginRight: 12 }}
                  />
                  <View className="flex-1">
                    <Text
                      className="text-sm font-semibold"
                      style={{ color: msg.isOutgoing ? '#fff' : colors.text }}
                    >
                      {msg.media.title}
                    </Text>
                    {msg.media.artist && (
                      <Text
                        className="text-xs mt-1"
                        style={{ color: msg.isOutgoing ? 'rgba(255,255,255,0.8)' : colors.icon }}
                      >
                        {msg.media.artist}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            ) : (
              // Text Message
              <View
                className="px-4 py-3 rounded-2xl max-w-[80%]"
                style={{
                  backgroundColor: msg.isOutgoing ? colors.primary : (colorScheme === 'dark' ? '#2a2a2a' : '#f3f4f6'),
                }}
              >
                <Text
                  className="text-sm"
                  style={{ color: msg.isOutgoing ? '#fff' : colors.text }}
                >
                  {msg.text}
                </Text>
              </View>
            )}
            <Text
              className="text-xs mt-1 px-2"
              style={{ color: colors.icon }}
            >
              {msg.timestamp}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Input Area - Positioned on top of keyboard, respects bottom inset when keyboard closed */}
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
          style={{
            backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f3f4f6',
          }}
        >
          <TextInput
            ref={textInputRef}
            placeholder="Type your message here!"
            placeholderTextColor={colors.icon}
            value={message}
            onChangeText={setMessage}
            onSubmitEditing={handleSendMessage}
            className="flex-1 text-sm"
            style={{ color: colors.text }}
            multiline
            maxLength={500}
            onFocus={() => {
              // Scroll to bottom when input is focused
              setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
              }, 300);
            }}
          />
        </View>
        <TouchableOpacity onPress={handleSendMessage} activeOpacity={0.7}>
          <Ionicons name="send" size={24} style={{ color: colors.primary }} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
