
export interface User {
    id: string;
    email: string;
    name: string;
    avatarUrl: string | null;
    bio: string | null;
    status: 'online' | 'offline' | 'away';
    lastSeenAt: string;
    createdAt: string;
    updatedAt: string;
}

export interface Channel {
    id: string;
    name: string;
    slug: string;
    icon: string;
    description?: string;
    activeUserCount: number;
}

export interface Conversation {
    id: string;
    type: 'DIRECT' | 'GROUP';
    name?: string;
    avatarUrl?: string;
    ownerId?: string;
    lastMessageId?: string;
    lastMessageAt: string;
    participantIds: string[];
}

export interface Message {
    id: string;
    content: string;
    channelId?: string;
    conversationId?: string;
    senderId: string;
    type: 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'SYSTEM';
    mediaUrl?: string;
    status: 'SENT' | 'DELIVERED' | 'READ';
    replyToId?: string;
    createdAt: string;
}
export interface Media {
    id: string;
    uploaderId: string;
    url: string;
    mimeType: string;
    sizeBytes: number;
    createdAt: string;
}
