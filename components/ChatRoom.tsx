import React, { useEffect, useState, useRef } from 'react';
import {
    StyleSheet, Text, View, Image,
    KeyboardAvoidingView, ScrollView, Platform, ActivityIndicator, Alert
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import FooterInput from './FooterInput';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { messageService } from '../services/messageService';
import { Colors } from '../constants/Colors';
import { Logger } from '../services/Logger';

interface Message {
    _id: string;
    content: string;
    sender: {
        _id: string;
        username: string;
        name?: string;
        image?: string;
    };
    createdAt: string;
}

interface ChatRoomProps {
    roomName: string;
    roomDisplayName: string;
    isHindiRoom?: boolean;
    includeSafeAreaTop?: boolean;
}

export default function ChatRoom({
    roomName,
    roomDisplayName,
    isHindiRoom,
    includeSafeAreaTop = true
}: ChatRoomProps) {
    const insets = useSafeAreaInsets();
    const { user, signOut } = useAuth();
    const { socket, isConnected } = useSocket();
    const [messages, setMessages] = useState<Message[]>([]);
    const scrollViewRef = useRef<ScrollView>(null);
    const [loading, setLoading] = useState(true);

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
                if (error.message === 'Unauthorized' || error.message?.includes('Unauthorized')) {
                    Alert.alert("Session Expired", "Please login again.");
                    // signOut(); // Uncomment in production
                }
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [roomName]);

    // Socket Listeners
    useEffect(() => {
        if (socket && isConnected) {
            Logger.info("Joined room:", roomName);
            socket.emit('joinPublicRoom', roomName);

            // Listen for NEW messages
            const handleNewMessage = (msg: Message) => {
                setMessages((prev) => {
                    // Deduplication: Check if ID exists
                    if (prev.some(m => m._id === msg._id)) return prev;
                    return [...prev, msg];
                });
            };

            socket.on('newPublicMessage', handleNewMessage);

            return () => {
                socket.off('newPublicMessage', handleNewMessage);
            };
        }
    }, [socket, isConnected, roomName]);

    // Auto-scroll
    useEffect(() => {
        if (messages.length > 0) {
            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [messages, loading]);

    const handleSend = (msgContent: string) => {
        // Optimistic UI Update
        if (!user) return;

        const tempId = `temp-${Date.now()}`;

        const optimisticMsg: Message = {
            _id: tempId,
            content: msgContent,
            sender: {
                _id: user._id,
                username: user.username,
                name: (user as any).name,
                image: (user as any).image
            },
            createdAt: new Date().toISOString()
        };

        setMessages(prev => [...prev, optimisticMsg]);
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.mainWrapper}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
            <View style={[
                styles.subHeader,
                {
                    height: 50 + (includeSafeAreaTop ? insets.top : 0),
                    paddingTop: includeSafeAreaTop ? insets.top : 0
                }
            ]}>
                <Text style={styles.subHeaderText}>
                    {roomDisplayName} {isConnected ? <Text style={{ fontSize: 12 }}>🟢</Text> : <Text style={{ fontSize: 12 }}>🔴</Text>}
                </Text>
            </View>

            {loading ? (
                <View style={[styles.chatContainer, { justifyContent: 'center', alignItems: 'center' }]}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            ) : (
                <ScrollView
                    ref={scrollViewRef}
                    style={styles.chatContainer}
                    contentContainerStyle={{ padding: 15, paddingBottom: 20 }}
                    keyboardShouldPersistTaps="handled"
                    onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
                >
                    {messages.length === 0 && (
                        <View style={{ alignItems: 'center', marginTop: 50 }}>
                            <Text style={{ color: Colors.textSecondary, fontSize: 16 }}>No messages yet.</Text>
                            <Text style={{ color: Colors.textMuted, fontSize: 14 }}>Be the first to say hello!</Text>
                        </View>
                    )}

                    {messages.map((msg, index) => {
                        const currentUserId = user?._id;
                        const senderId = typeof msg.sender === 'object' ? msg.sender._id : msg.sender;
                        const isMe = currentUserId && senderId && currentUserId.toString() === senderId.toString();

                        const avatarUri = (msg.sender as any).image
                            ? (msg.sender as any).image
                            : `https://ui-avatars.com/api/?name=${(msg.sender as any).name || (msg.sender as any).username}&background=random&color=fff`;

                        const senderName = (msg.sender as any).name || (msg.sender as any).username;

                        return (
                            <View key={msg._id || index} style={[styles.messageRow, isMe ? styles.rowReverse : styles.rowRow]}>

                                {/* Avatar - Always Show */}
                                <Image
                                    source={{ uri: avatarUri }}
                                    style={styles.avatar}
                                />

                                {isMe ? (
                                    <LinearGradient
                                        colors={[Colors.primary, Colors.primaryDark]}
                                        style={[styles.messageBubble, styles.myBubble]}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                    >
                                        <Text style={[styles.messageText, styles.myMessageText]}>
                                            {msg.content}
                                        </Text>
                                        <Text style={[styles.timestamp, styles.myTimestamp]}>
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </Text>
                                    </LinearGradient>
                                ) : (
                                    <View style={[styles.messageBubble, styles.theirBubble]}>
                                        <Text style={styles.senderName}>{senderName}</Text>
                                        <Text style={[styles.messageText, styles.theirMessageText]}>
                                            {msg.content}
                                        </Text>
                                        <Text style={[styles.timestamp, styles.theirTimestamp]}>
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        );
                    })}
                </ScrollView>
            )}

            <FooterInput onSend={handleSend} chatType="public" chatId={roomName} />
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    mainWrapper: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    subHeader: {
        backgroundColor: Colors.surface,
        paddingHorizontal: 15,
        justifyContent: 'center',
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        elevation: 2,
    },
    subHeaderText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.text,
    },
    chatContainer: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    messageRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginBottom: 16,
        width: '100%',
    },
    rowRow: { justifyContent: 'flex-start' },
    rowReverse: { justifyContent: 'flex-end' },

    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        marginHorizontal: 8,
        marginBottom: 2,
        backgroundColor: Colors.surfaceHighlight,
        borderWidth: 1,
        borderColor: Colors.border,
    },

    messageBubble: {
        maxWidth: '75%',
        padding: 12,
        borderRadius: 20,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
    },
    myBubble: {
        borderBottomRightRadius: 4,
        marginRight: 4, // Space from edge/avatar if needed
    },
    theirBubble: {
        backgroundColor: Colors.surface,
        borderBottomLeftRadius: 4,
        marginLeft: 4,
    },

    senderName: {
        fontSize: 11,
        color: Colors.accent,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    messageText: {
        fontSize: 15,
        lineHeight: 22,
    },
    myMessageText: { color: '#fff' },
    theirMessageText: { color: Colors.text },

    timestamp: {
        fontSize: 10,
        marginTop: 6,
        alignSelf: 'flex-end',
    },
    myTimestamp: { color: 'rgba(255,255,255,0.7)' },
    theirTimestamp: { color: Colors.textMuted },
});
