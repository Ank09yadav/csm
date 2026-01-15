import { api } from './api';

export const messageService = {
    getMessages: (channelId: string) =>
        api(`/messages?channelId=${channelId}`, { authenticated: true }),

    getPrivateMessages: (conversationId: string) =>
        api(`/messages?conversationId=${conversationId}`, { authenticated: true }),
};
