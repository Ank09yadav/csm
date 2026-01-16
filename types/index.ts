export interface User {
    _id: string;
    username: string;
    name?: string;
    image?: string;
    email?: string;
    about?: string;
    college?: string;
}

export interface Message {
    _id: string;
    content: string;
    sender: User;
    replyTo?: Message;
    createdAt: string;
    chatType?: 'public' | 'private';
    readBy?: string[];
}

export interface ChatRoomProps {
    roomName: string; // The ID used for socket/api
    roomDisplayName: string; // The UI name
    isHindiRoom?: boolean;
    includeSafeAreaTop?: boolean;
}
