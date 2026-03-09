import { Dimensions } from 'react-native';
import type { Conversation } from '../../screens/native/Messaging/InboxScreen.native';

export const { width: SCREEN_WIDTH } = Dimensions.get('window');

/** Entry / slide-in duration (ms) */
export const TRANSITION_DURATION = 500;

/** Exit / slide-out duration (ms) */
export const EXIT_TRANSITION_DURATION = 300;

/** Support / AI chatbot conversation stub used by the Help screen FAB */
export const SUPPORT_CHATBOT_CONVERSATION: Conversation = {
    id: '5',
    name: 'Soothera Assistant',
    lastMessage:
        'I can help you find the perfect salon or book an appointment. What would you like to do?',
    timestamp: '08:40 AM',
    type: 'chatbot',
    chatbotId: '1',
    avatar: undefined,
    isOnline: true,
};
