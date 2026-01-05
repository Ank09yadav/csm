
import { Channel } from './models';

// This file contains the Static Configuration for the Public Chat Rooms (Channels).
// Dynamic data (Users, Conversations, Messages) has been moved to 'mocks.ts'
// or should be fetched from the database.

export const CHANNELS: Channel[] = [
    {
        id: 'hindi',
        name: 'Hindi - General',
        slug: 'hindi',
        icon: 'language',
        description: 'A place to discuss general topics in Hindi. Everyone is welcome!',
        activeUserCount: 120
    },
    {
        id: 'english',
        name: 'English - Learning',
        slug: 'english',
        icon: 'text',
        description: 'Practice your English skills or discuss literature here.',
        activeUserCount: 85
    },
    {
        id: 'song',
        name: 'Music & Songs',
        slug: 'song',
        icon: 'musical-notes',
        description: 'Share your favorite tracks, lyrics, and discuss music theory.',
        activeUserCount: 45
    },
    {
        id: 'poetry',
        name: 'Poetry & Art',
        slug: 'poetry',
        icon: 'brush',
        description: 'A creative space for poets and artists to share their work.',
        activeUserCount: 30
    },
];

// Compatibility export for existing components
export const rooms = CHANNELS;
