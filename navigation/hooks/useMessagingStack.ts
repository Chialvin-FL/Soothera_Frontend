import { useState, useEffect } from 'react';
import { useSharedValue, useAnimatedStyle, withTiming, runOnJS } from 'react-native-reanimated';
import { SCREEN_WIDTH, TRANSITION_DURATION, EXIT_TRANSITION_DURATION } from '../configs/constants';
import type { Conversation } from '../../screens/native/Messaging/InboxScreen.native';

export interface MessagingStackState {
    chatConversation: Conversation | null;
    chatStyle: ReturnType<typeof useAnimatedStyle>;
    openChat: (conversation: Conversation) => void;
    closeChat: () => void;
}

export function useMessagingStack(): MessagingStackState {
    const [chatConversation, setChatConversation] = useState<Conversation | null>(null);
    const chatTx = useSharedValue(SCREEN_WIDTH);

    useEffect(() => {
        chatTx.value = chatConversation
            ? withTiming(0, { duration: TRANSITION_DURATION })
            : SCREEN_WIDTH;
    }, [chatConversation, chatTx]);

    const chatStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: chatTx.value }],
    }));

    const openChat = (conversation: Conversation) => setChatConversation(conversation);
    const closeChat = () => {
        chatTx.value = withTiming(SCREEN_WIDTH, { duration: EXIT_TRANSITION_DURATION }, () =>
            runOnJS(setChatConversation)(null)
        );
    };

    return { chatConversation, chatStyle, openChat, closeChat };
}
