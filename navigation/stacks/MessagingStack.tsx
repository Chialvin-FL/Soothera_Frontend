import React from 'react';
import Animated from 'react-native-reanimated';
import ChatRoomScreen from '../../screens/native/Messaging/ChatRoomScreen.native';
import type { MessagingStackState } from '../hooks/useMessagingStack';

const OVERLAY_BASE = {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
};

interface MessagingStackProps {
    messaging: MessagingStackState;
}

export function MessagingStack({ messaging }: MessagingStackProps) {
    const { chatConversation, chatStyle, closeChat } = messaging;

    if (!chatConversation) return null;

    return (
        <Animated.View style={[{ ...OVERLAY_BASE, zIndex: 17 }, chatStyle]}>
            <ChatRoomScreen conversation={chatConversation as any} onBack={closeChat} />
        </Animated.View>
    );
}
