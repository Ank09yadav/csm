/**
 * CSM Application Database Models
 * Designed for scalability, performance, and real-time chat requirements.
 * 
 * Architecture Analysis:
 * 1. Users: Central entity. Needs auth fields + profile fields.
 * 2. Channels (Public Rooms): Static or Admin-managed topics (Hindi, Songs, etc.).
 * 3. Conversations (Private): Dynamic 1:1 or Group chats.
 * 4. Messages: The core high-volume entity. Needs robust indexing on (roomId, timestamp).
 * 
 * Improvements from previous ad-hoc objects:
 * - Added 'createdAt'/'updatedAt' timestamps for proper audit and sorting.
 * - Normalized 'Participants' to support scalable group chats (in a real DB, this would be a separate Join Table).
 * - Distinguishing between 'Channels' (Public) and 'Conversations' (Private) for better access control logic.
 */

// 1. User Entity
export interface User {
    id: string;              
    email: string;           
    name: string;           
    avatarUrl: string | null;
    bio: string | null;

    // Status & Presence
    status: 'online' | 'offline' | 'away';
    lastSeenAt: string;    // ISO Timestamp

    // Metadata
    createdAt: string;
    updatedAt: string;
}

// 2. Channel (Public Chat Routes like 'Hindi', 'Songs')
export interface Channel {
    id: string;             
    name: string;            
    slug: string;         
    icon: string;           
    description?: string;
    activeUserCount: number; 
}

// 3. Conversation (Private DMs & Groups)
export interface Conversation {
    id: string;              // Primary Key (UUID)
    type: 'DIRECT' | 'GROUP';

    // Group Info (Nullable for DIRECT)
    name?: string;
    avatarUrl?: string;
    ownerId?: string;       // Admin of the group

    // Metadata for Listing/Sorting
    lastMessageId?: string; // Foreign Key to Messages
    lastMessageAt: string;  // Index this for sorting inbox

    // Participants (In a SQL DB, this would be a separate table 'ConversationParticipants')
    // We keep it here for data-loader convenience in frontend models
    participantIds: string[];
}

// 4. Message
export interface Message {
    id: string;              // Primary Key (UUID)
    content: string;

    // Relationships (Polymorphic association or two nullable fields)
    // A message belongs to EITHER a Channel OR a Conversation
    channelId?: string;
    conversationId?: string;

    senderId: string;       // Foreign Key to Users

    // Message Layout
    type: 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'SYSTEM';
    mediaUrl?: string;

    // Status
    status: 'SENT' | 'DELIVERED' | 'READ';
    replyToId?: string;    // Self-referential Foreign Key

    createdAt: string;      // ISO Timestamp (Index this)
}

// 5. Attachment/Media (Optional, but good practice to separate)
export interface Media {
    id: string;
    uploaderId: string;
    url: string;
    mimeType: string;
    sizeBytes: number;
    createdAt: string;
}
