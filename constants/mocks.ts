
import { User, Conversation, Message, Channel } from './models';
import { CHANNELS } from './data'; // Import Channels to link messages if needed, though mostly independent now.

// Re-export types
export type { User, Conversation, Message };

// --- Mock Users ---
export const CURRENT_USER: User = {
    id: 'u1',
    name: 'Ankur Sharma',
    email: 'ankur@example.com',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
    bio: 'Full Stack Developer | Music Lover',
    status: 'online',
    lastSeenAt: new Date().toISOString(),
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-10-01T00:00:00Z',
};

export const USERS: User[] = [
    {
        id: 'u2',
        name: 'Sarah Chen',
        email: 'sarah@example.com',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
        bio: 'Coffee addict ☕ & UI Designer',
        status: 'online',
        lastSeenAt: new Date().toISOString(),
        createdAt: '2023-02-15T10:00:00Z',
        updatedAt: '2023-02-15T10:00:00Z',
    },
    {
        id: 'u3',
        name: 'Michael Ross',
        email: 'mike@example.com',
        avatarUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
        bio: 'Gym rat 💪 | Hiking',
        status: 'away',
        lastSeenAt: '2023-10-25T14:30:00Z',
        createdAt: '2023-03-20T09:30:00Z',
        updatedAt: '2023-03-20T09:30:00Z',
    },
    {
        id: 'u4',
        name: 'Jessica Pearson',
        email: 'jessica@example.com',
        avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
        bio: 'Managing Partner @ Pearson Specter',
        status: 'offline',
        lastSeenAt: '2023-10-24T09:15:00Z',
        createdAt: '2023-04-10T11:20:00Z',
        updatedAt: '2023-04-10T11:20:00Z',
    },
    {
        id: 'u5',
        name: 'David Kim',
        email: 'david@example.com',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
        bio: 'Travel photographer 📸',
        status: 'online',
        lastSeenAt: new Date().toISOString(),
        createdAt: '2023-05-05T14:00:00Z',
        updatedAt: '2023-05-05T14:00:00Z',
    },
];

// Friends list (subset of USERS)
export const FRIENDS: User[] = [USERS[0], USERS[1], USERS[3]];
export const FRIEND_REQUESTS: User[] = [USERS[2]];
export const SENT_REQUESTS: User[] = [USERS[1]];


// --- Mock Conversations ---
export const CONVERSATIONS: Conversation[] = [
    {
        id: 'r1',
        type: 'DIRECT',
        participantIds: ['u1', 'u2'],
        lastMessageId: 'm3',
        lastMessageAt: '2023-10-25T10:33:00Z',
    },
    {
        id: 'r2',
        type: 'DIRECT',
        participantIds: ['u1', 'u3'],
        lastMessageId: 'm5',
        lastMessageAt: '2023-10-24T17:15:00Z',
    },
    {
        id: 'r3',
        type: 'GROUP',
        name: 'Weekend Trip 🏕️',
        ownerId: 'u1',
        participantIds: ['u1', 'u4', 'u5'],
        lastMessageId: 'm8',
        lastMessageAt: '2023-10-25T09:10:00Z',
        avatarUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
    },
];

// Compatibility export
export const ROOMS = CONVERSATIONS;

// --- Mock Messages ---
export const MESSAGES: Message[] = [
    // Conversation with Sarah (u2) - Room r1
    {
        id: 'm1',
        conversationId: 'r1',
        senderId: 'u2',
        content: 'Hey Ankur! Are we still on for lunch?',
        createdAt: '2023-10-25T10:30:00Z',
        type: 'TEXT',
        status: 'READ',
    },
    {
        id: 'm2',
        conversationId: 'r1',
        senderId: 'u1',
        content: 'Yes, definitely! 1 PM at the usual place?',
        createdAt: '2023-10-25T10:32:00Z',
        type: 'TEXT',
        status: 'READ',
    },
    {
        id: 'm3',
        conversationId: 'r1',
        senderId: 'u2',
        content: 'Perfect. See you then! 👋',
        createdAt: '2023-10-25T10:33:00Z',
        type: 'TEXT',
        status: 'READ',
    },

    // Conversation with Michael (u3) - Room r2
    {
        id: 'm4',
        conversationId: 'r2',
        senderId: 'u1',
        content: 'Did you check the new PR?',
        createdAt: '2023-10-24T16:00:00Z',
        type: 'TEXT',
        status: 'READ',
    },
    {
        id: 'm5',
        conversationId: 'r2',
        senderId: 'u3',
        content: 'Not yet, just got back from the gym. Will check in an hour.',
        createdAt: '2023-10-24T17:15:00Z',
        type: 'TEXT',
        status: 'DELIVERED',
    },

    // Group Chat (Weekend Trip) - Room r3
    {
        id: 'm6',
        conversationId: 'r3',
        senderId: 'u4',
        content: 'Guys, who is bringing the snacks?',
        createdAt: '2023-10-25T09:00:00Z',
        type: 'TEXT',
        status: 'READ',
    },
    {
        id: 'm7',
        conversationId: 'r3',
        senderId: 'u5',
        content: 'I can bring chips and dips!',
        createdAt: '2023-10-25T09:05:00Z',
        type: 'TEXT',
        status: 'READ',
    },
    {
        id: 'm8',
        conversationId: 'r3',
        senderId: 'u1',
        content: 'I will handle drinks. 🥤',
        createdAt: '2023-10-25T09:10:00Z',
        type: 'TEXT',
        status: 'SENT',
    },
];

// --- Helpers ---

export const getRoomMessages = (roomId: string) =>
    MESSAGES.filter(m => m.conversationId === roomId || m.channelId === roomId)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

export const getUser = (userId: string) =>
    USERS.find(u => u.id === userId) || (userId === CURRENT_USER.id ? CURRENT_USER : undefined);

export const getLastMessage = (conversation: Conversation) =>
    MESSAGES.find(m => m.id === conversation.lastMessageId);
