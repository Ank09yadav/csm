import { useState, useEffect, useCallback, useRef } from 'react';
import { Alert } from 'react-native';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { messageService } from '../services/messageService';
import { Logger } from '../services/Logger';
import { Message } from '../types';

export const useChatMessages = (roomName: string) => {
    const { user } = useAuth();
    const { socket, isConnected } = useSocket();
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [replyingTo, setReplyingTo] = useState<Message | null>(null);

    // Initial Fetch
    useEffect(() => {
        const fetchHistory = async () => {
            setLoading(true);
            try {
                const response = await messageService.getMessages(roomName);
                if (response && response.messages) {
                    setMessages(response.messages);
                }
            } catch (error: any) {
                Logger.error("Failed to fetch messages:", error);
                if (error.message?.includes('Unauthorized')) {
                    Alert.alert("Session Expired", "Please login again.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [roomName]);

    // Socket Listeners
    useEffect(() => {
        if (!socket || !isConnected) return;

        Logger.info("Joined room:", roomName);
        socket.emit('joinPublicRoom', roomName);

        const handleNewMessage = (msg: Message) => {
            setMessages((prev) => {
                // Remove any temporary/optimistic message with the same content
                const filtered = prev.filter(m =>
                    !m._id.startsWith('temp-') || m.content !== msg.content
                );

                // Deduplication by ID
                if (filtered.some(m => m._id === msg._id)) return filtered;

                return [...filtered, msg];
            });
        };

        socket.on('newPublicMessage', handleNewMessage);

        return () => {
            socket.off('newPublicMessage', handleNewMessage);
        };
    }, [socket, isConnected, roomName]);

    const sendMessage = useCallback((content: string) => {
        if (!user) return;

        // Optimistic Update
        const tempId = `temp-${Date.now()}`;
        const optimisticMsg: Message = {
            _id: tempId,
            content,
            sender: user,
            replyTo: replyingTo || undefined,
            createdAt: new Date().toISOString(),
        };

        setMessages(prev => [...prev, optimisticMsg]);
        setReplyingTo(null);

        // Actual sending is handled by FooterInput via socket usually, 
        // but if logic was here we would emit 'publicMessage'
    }, [user, replyingTo]);

    return {
        messages,
        loading,
        replyingTo,
        setReplyingTo,
        sendMessage, // Exposed if needed, though FooterInput handles emission usually
        setMessages // Exposed for manual updates if needed
    };
};
