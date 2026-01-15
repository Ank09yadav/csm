import React, { useEffect, useState, useRef } from 'react';
import {
    StyleSheet, Text, View, Image,
    KeyboardAvoidingView, ScrollView, Platform, ActivityIndicator, Alert, TouchableOpacity
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Swipeable, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import UserProfileModal from './UserProfileModal';
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
    replyTo?: Message; // For now assuming nested population or just ID
    createdAt: string;
}

interface ChatRoomProps {
    roomName: string;
    roomDisplayName: string;
    isHindiRoom?: boolean;
    includeSafeAreaTop?: boolean;
}

// Swipeable Message Component
const SwipeableMessage = ({ children, onSwipe, isMe }: { children: React.ReactNode, onSwipe: () => void, isMe: boolean }) => {
    const renderRightActions = (_: any, dragX: any) => {
        // Animation logic could go here
        return (
            <View style={{ width: 1, height: '100%' }} />
        );
    };

    return (
        <Swipeable
            renderRightActions={renderRightActions}
            friction={2}
            overshootRight={false}
            onSwipeableOpen={(direction) => {
                if (direction === 'right') {
                    onSwipe();
                }
            }}
        >
            {children}
        </Swipeable>
    );
};


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

    // Reply State
    const [replyingTo, setReplyingTo] = useState<Message | null>(null);
    const [selectedUser, setSelectedUser] = useState<any>(null);

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
            replyTo: replyingTo || undefined,
            createdAt: new Date().toISOString()
        };

        setMessages(prev => [...prev, optimisticMsg]);
        setReplyingTo(null); // Clear reply after sending
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

                        const openUserProfile = () => {
                            if (!isMe) setSelectedUser(msg.sender);
                        };

                        return (
                            <SwipeableMessage
                                key={msg._id || index}
                                isMe={isMe || false}
                                onSwipe={() => setReplyingTo(msg)}
                            >
                                <View style={styles.messageRow}>
                                    <TouchableOpacity onPress={openUserProfile}>
                                        <Image
                                            source={{ uri: avatarUri }}
                                            style={styles.avatar}
                                        />
                                    </TouchableOpacity>

                                    <View style={[
                                        styles.messageBubble,
                                        isMe ? styles.myBubble : styles.theirBubble
                                    ]}>
                                        <TouchableOpacity onPress={openUserProfile}>
                                            <Text style={styles.senderName}>{senderName}</Text>
                                        </TouchableOpacity>

                                        {msg.replyTo && (
                                            <View style={styles.replyContext}>
                                                <View style={styles.replyBar} />
                                                <Text numberOfLines={1} style={styles.replyText}>
                                                    {(msg.replyTo as any).content || "Replying to a message"}
                                                </Text>
                                            </View>
                                        )}

                                        <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.theirMessageText]}>
                                            {msg.content}
                                        </Text>
                                        <Text style={[styles.timestamp, isMe ? styles.myTimestamp : styles.theirTimestamp]}>
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </Text>
                                    </View>
                                </View>
                            </SwipeableMessage>
                        );
                    })}
                </ScrollView>
            )}

            <FooterInput
                onSend={handleSend}
                chatType="public"
                chatId={roomName}
                replyingTo={replyingTo}
                onCancelReply={() => setReplyingTo(null)}
            />

            <UserProfileModal
                visible={!!selectedUser}
                user={selectedUser}
                onClose={() => setSelectedUser(null)}
            />
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
        alignItems: 'flex-start', // Top align for avatar vs bubble
        marginBottom: 16,
        width: '100%',
        paddingRight: 40, // Avoid full width to distinguish messages
    },

    avatar: {
        width: 38,
        height: 38,
        borderRadius: 19,
        marginRight: 10,
        backgroundColor: Colors.surfaceHighlight,
        borderWidth: 1,
        borderColor: Colors.border,
    },

    messageBubble: {
        flex: 1,
        padding: 12,
        borderRadius: 16,
        // Make bubbles slightly less rounded to look more like "blocks" if desired
        borderTopLeftRadius: 4,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
    },
    myBubble: {
        backgroundColor: '#2A2A35', // Distinct dark for me
        borderColor: Colors.primary,
        borderWidth: 1,
    },
    theirBubble: {
        backgroundColor: Colors.surface,
        borderColor: Colors.border,
        borderWidth: 1,
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
    myMessageText: { color: Colors.text },
    theirMessageText: { color: Colors.text },

    timestamp: {
        fontSize: 10,
        marginTop: 6,
        alignSelf: 'flex-end',
    },
    myTimestamp: { color: Colors.textMuted },
    theirTimestamp: { color: Colors.textMuted },

    // Reply Styles
    replyContext: {
        marginBottom: 6,
        padding: 6,
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: 4,
        flexDirection: 'row',
    },
    replyBar: {
        width: 3,
        backgroundColor: Colors.primary,
        marginRight: 6,
        borderRadius: 2,
    },
    replyText: {
        color: Colors.textSecondary,
        fontSize: 12,
        fontStyle: 'italic',
    },
});
