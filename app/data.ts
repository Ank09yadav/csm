
export interface User {
    id: string;
    name: string;
    email: string;
    avatar: string;
    bio: string;
    status: 'online' | 'offline' | 'away';
    lastSeen?: string;
    phone?: string;
}
export const rooms = [
    { id: 'hindi', name: 'Hindi', icon: 'language' },
    { id: 'english', name: 'English', icon: 'text' },
    { id: 'song', name: 'Songs', icon: 'musical-notes' },
    { id: 'poetry', name: 'Poetry', icon: 'brush' },
  ];

export interface Message {
    id: string;
    roomId: string;
    senderId: string;
    content: string;
    timestamp: string; // ISO string
    type: 'text' | 'image' | 'video' | 'audio';
    status: 'sent' | 'delivered' | 'read';
    replyToId?: string;
}

export interface Room {
    id: string;
    type: 'direct' | 'group';
    name?: string; // For group chats or derived from participant for direct
    participants: string[]; // User IDs
    admins?: string[]; // User IDs for group admins
    lastMessageId?: string;
    unreadCount: number;
    avatar?: string; // For group chats
    createdAt: string;
}

// --- Mock Data ---

export const CURRENT_USER: User = {
    id: 'u1',
    name: 'Ankur Sharma',
    email: 'ankur@example.com',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80',
    bio: 'Full Stack Developer | Music Lover',
    status: 'online',
    phone: '+91 98765 43210'
};

export const USERS: User[] = [
    {
        id: 'u2',
        name: 'Sarah Chen',
        email: 'sarah@example.com',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80',
        bio: 'Coffee addict ☕ & UI Designer',
        status: 'online',
    },
    {
        id: 'u3',
        name: 'Michael Ross',
        email: 'mike@example.com',
        avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80',
        bio: 'Gym rat 💪 | Hiking',
        status: 'away',
        lastSeen: '2023-10-25T14:30:00Z',
    },
    {
        id: 'u4',
        name: 'Jessica Pearson',
        email: 'jessica@example.com',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80',
        bio: 'Managing Partner @ Pearson Specter',
        status: 'offline',
        lastSeen: '2023-10-24T09:15:00Z',
    },
    {
        id: 'u5',
        name: 'David Kim',
        email: 'david@example.com',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80',
        bio: 'Travel photographer 📸',
        status: 'online',
    },
];

// Friends list (subset of USERS)
export const FRIENDS: User[] = [USERS[0], USERS[1], USERS[3]];

export const MESSAGES: Message[] = [
    // Conversation with Sarah (u2) - Room r1
    {
        id: 'm1',
        roomId: 'r1',
        senderId: 'u2',
        content: 'Hey Ankur! Are we still on for lunch?',
        timestamp: '2023-10-25T10:30:00Z',
        type: 'text',
        status: 'read',
    },
    {
        id: 'm2',
        roomId: 'r1',
        senderId: 'u1',
        content: 'Yes, definitely! 1 PM at the usual place?',
        timestamp: '2023-10-25T10:32:00Z',
        type: 'text',
        status: 'read',
    },
    {
        id: 'm3',
        roomId: 'r1',
        senderId: 'u2',
        content: 'Perfect. See you then! 👋',
        timestamp: '2023-10-25T10:33:00Z',
        type: 'text',
        status: 'read',
    },

    // Conversation with Michael (u3) - Room r2
    {
        id: 'm4',
        roomId: 'r2',
        senderId: 'u1',
        content: 'Did you check the new PR?',
        timestamp: '2023-10-24T16:00:00Z',
        type: 'text',
        status: 'read',
    },
    {
        id: 'm5',
        roomId: 'r2',
        senderId: 'u3',
        content: 'Not yet, just got back from the gym. Will check in an hour.',
        timestamp: '2023-10-24T17:15:00Z',
        type: 'text',
        status: 'delivered',
    },

    // Group Chat (Weekend Trip) - Room r3
    {
        id: 'm6',
        roomId: 'r3',
        senderId: 'u4',
        content: 'Guys, who is bringing the snacks?',
        timestamp: '2023-10-25T09:00:00Z',
        type: 'text',
        status: 'read',
    },
    {
        id: 'm7',
        roomId: 'r3',
        senderId: 'u5',
        content: 'I can bring chips and dips!',
        timestamp: '2023-10-25T09:05:00Z',
        type: 'text',
        status: 'read',
    },
    {
        id: 'm8',
        roomId: 'r3',
        senderId: 'u1',
        content: 'I will handle drinks. 🥤',
        timestamp: '2023-10-25T09:10:00Z',
        type: 'text',
        status: 'sent',
    },
];

export const ROOMS: Room[] = [
    {
        id: 'r1',
        type: 'direct',
        participants: ['u1', 'u2'],
        unreadCount: 0,
        lastMessageId: 'm3',
        createdAt: '2023-01-15T10:00:00Z',
    },
    {
        id: 'r2',
        type: 'direct',
        participants: ['u1', 'u3'],
        unreadCount: 1, // Simulating Michael sent the last message and we haven't read it (conceptually, though local user sent last in mock? Wait m5 mock says U3 sent it. So yes unread)
        lastMessageId: 'm5',
        createdAt: '2023-02-20T14:00:00Z',
    },
    {
        id: 'r3',
        type: 'group',
        name: 'Weekend Trip 🏕️',
        participants: ['u1', 'u4', 'u5'],
        admins: ['u4'],
        unreadCount: 2,
        lastMessageId: 'm8',
        avatar: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
        createdAt: '2023-10-01T09:00:00Z',
    },
];

// Helper to get full object for convenience in UI
export const getRoomMessages = (roomId: string) => MESSAGES.filter(m => m.roomId === roomId).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
export const getUser = (userId: string) => USERS.find(u => u.id === userId) || (userId === CURRENT_USER.id ? CURRENT_USER : undefined);
export const getLastMessage = (room: Room) => MESSAGES.find(m => m.id === room.lastMessageId);
