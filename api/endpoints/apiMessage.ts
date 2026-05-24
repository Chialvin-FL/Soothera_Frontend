import axiosClient from '../axiosClient';
import type { GetConversationResponseDTO, SendMessageResponseDTO } from '../types';

// ─────────────────────────────────────────────────────────────
// Messaging Endpoints
// Base route: /api/Message
// All endpoints require [Authorize] (Bearer token)
// ─────────────────────────────────────────────────────────────

const BASE = '/Message';

/**
 * GET /api/Message/booking/{bookingId}
 * Gets or lazily creates the conversation linked to this booking.
 * The conversation is automatically activated once the booking is confirmed.
 * After 3 days the conversation becomes read-only.
 */
export async function getOrCreateConversation(
    bookingId: string,
): Promise<GetConversationResponseDTO> {
    console.log('[apiMessage] getOrCreateConversation: bookingId =', bookingId);

    const { data } = await axiosClient.get<GetConversationResponseDTO>(
        `${BASE}/booking/${bookingId}`,
    );

    console.log('[apiMessage] getOrCreateConversation: response =', JSON.stringify({
        success: data.success,
        conversationId: data.data?.conversationId,
        messageCount: data.data?.messages?.length,
        isReadOnly: data.data?.isReadOnly,
    }));

    return data;
}

/**
 * POST /api/Message/booking/{bookingId}/send
 * Sends a message inside the booking's conversation.
 * The backend uses the JWT to identify the sender.
 * Returns a failure when the conversation is read-only.
 */
export async function sendMessage(
    bookingId: string,
    content: string,
): Promise<SendMessageResponseDTO> {
    console.log('[apiMessage] sendMessage: bookingId =', bookingId, '| content length =', content.length);

    const { data } = await axiosClient.post<SendMessageResponseDTO>(
        `${BASE}/booking/${bookingId}/send`,
        { content },
    );

    console.log('[apiMessage] sendMessage: response =', JSON.stringify(data));
    return data;
}
