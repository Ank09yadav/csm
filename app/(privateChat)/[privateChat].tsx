import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Modal, ScrollView, Platform, Alert, Dimensions, KeyboardAvoidingView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FooterInput from '../../components/FooterInput';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';

const API_BASE = 'https://csmserver.onrender.com/api';

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

export default function PrivateChatPage() {
    const { privateChat: targetUserIdProp } = useLocalSearchParams<{ privateChat: string }>();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { token, user: currentUser } = useAuth();
    const { socket } = useSocket();

    // Ensure string
    const targetUserId = Array.isArray(targetUserIdProp) ? targetUserIdProp[0] : targetUserIdProp;

    const [menuVisible, setMenuVisible] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [targetUser, setTargetUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const scrollViewRef = useRef<ScrollView>(null);

    //Fetch Target User Details
    useEffect(() => {
        async function fetchUserAndConversation() {
            try {
                if (!targetUserId || !token) return;

                // Get User Profile
                const userRes = await fetch(`${API_BASE}/user/${targetUserId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const userData = await userRes.json();
                if (userRes.ok) {
                    setTargetUser(userData.user);
                } else {
                    Alert.alert("Error", "User not found");
                    router.back();
                    return;
                }

                // Get/Create Conversation
                const convRes = await fetch(`${API_BASE}/conversations`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ targetUserId })
                });
                const convData = await convRes.json();

                if (convRes.ok) {
                    setConversationId(convData.conversation._id);
                    // Fetch existing messages
                    fetchMessages(convData.conversation._id);
                }

            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        fetchUserAndConversation();
    }, [targetUserId, token]);

    // Fetch Messages
    async function fetchMessages(convId: string) {
        try {
            const res = await fetch(`${API_BASE}/messages?conversationId=${convId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setMessages(data.messages);
                setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: false }), 100);
            }
        } catch (e) {
            console.error(e);
        }
    }

    // Socket Listeners
    useEffect(() => {
        if (!socket || !conversationId) return;


        socket.emit('joinPublicRoom', conversationId);

        const handleNewMessage = (msg: Message) => {
            // Check based on content/ID to duplicate
            setMessages(prev => {
                if (prev.some(m => m._id === msg._id)) return prev;
                return [...prev, msg];
            });
            setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
        };

        socket.on('newPrivateMessage', handleNewMessage);

        return () => {
            socket.off('newPrivateMessage', handleNewMessage);
        };
    }, [socket, conversationId]);


    const handleSend = (text: string) => {
        // Optimistic UI or other side effects can go here
    };

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    headerTitle: '',
                    headerShadowVisible: false,
                    headerStyle: { backgroundColor: '#fff' },
                    headerLeft: () => (
                        <View style={styles.headerLeftContainer}>
                            <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 10 }}>
                                <Ionicons name="arrow-back" size={24} color="#333" />
                            </TouchableOpacity>
                            {targetUser ? (
                                <>
                                    <Image
                                        source={{ uri: targetUser.image || `https://ui-avatars.com/api/?name=${targetUser.username}&background=random&color=fff` }}
                                        style={styles.avatar}
                                    />
                                    <View>
                                        <Text style={styles.headerName}>{targetUser.name || targetUser.username}</Text>
                                        <Text style={styles.headerStatus}>{targetUser.isOnline ? 'Online' : 'Offline'}</Text>
                                    </View>
                                </>
                            ) : (
                                <Text style={styles.headerName}>Loading...</Text>
                            )}
                        </View>
                    ),
                    headerRight: () => (
                        <TouchableOpacity onPress={() => setMenuVisible(true)} style={{ padding: 5 }}>
                            <Ionicons name="ellipsis-vertical" size={24} color="#333" />
                        </TouchableOpacity>
                    ),
                }}
            />

            {(loading || !targetUser) ? (
                <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                    <ActivityIndicator size="large" color="#4A00E0" />
                </View>
            ) : (
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={{ flex: 1 }}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
                >
                    <ScrollView
                        ref={scrollViewRef}
                        style={styles.chatArea}
                        contentContainerStyle={{ padding: 15, paddingBottom: 20 }}
                        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
                        keyboardShouldPersistTaps="handled"
                    >
                        {messages.map((msg, index) => {
                            // Updated check for both user ID formats
                            const isMe = msg.sender._id === (currentUser as any)?._id || msg.sender._id === (currentUser as any)?.userId;
                            return (
                                <View
                                    key={msg._id || index}
                                    style={[
                                        styles.messageBubble,
                                        isMe ? styles.myMessage : styles.theirMessage
                                    ]}
                                >
                                    <Text style={[styles.messageText, isMe ? { color: '#fff' } : { color: Colors.text }]}>
                                        {msg.content}
                                    </Text>
                                    <Text style={[styles.timeText, isMe ? { color: 'rgba(255,255,255,0.7)' } : { color: Colors.textMuted }]}>
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </Text>
                                </View>
                            );
                        })}
                    </ScrollView>

                    <FooterInput onSend={handleSend} chatType="private" chatId={conversationId || undefined} />
                </KeyboardAvoidingView>
            )}

            {/* Menu Modal */}
            <Modal
                visible={menuVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setMenuVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setMenuVisible(false)}
                >
                    <View style={[styles.menuContainer, { top: insets.top + 50 }]}>
                        {/* 
                            Implement actions if needed. 
                            For now just placeholder or perform actual actions via API 
                        */}
                        <TouchableOpacity style={styles.menuItem} onPress={() => setMenuVisible(false)}>
                            <Ionicons name="close-circle-outline" size={20} color="#333" />
                            <Text style={styles.menuText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

// ... imports
import { Colors } from '../../constants/Colors';

// ... component body ...

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background, // Dark background
    },
    headerLeftContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
        backgroundColor: Colors.surfaceHighlight,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    headerName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.text,
    },
    headerStatus: {
        fontSize: 12,
        color: Colors.success, // or textSecondary if offline
    },
    chatArea: {
        flex: 1,
    },
    messageBubble: {
        maxWidth: '75%',
        padding: 12,
        borderRadius: 18,
        marginBottom: 10,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
    },
    myMessage: {
        alignSelf: 'flex-end',
        backgroundColor: Colors.primary, // Emerald Green
        borderBottomRightRadius: 4,
    },
    theirMessage: {
        alignSelf: 'flex-start',
        backgroundColor: Colors.surface, // Dark Card
        borderBottomLeftRadius: 4,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    messageText: {
        fontSize: 15,
        lineHeight: 20,
    },
    timeText: {
        fontSize: 10,
        marginTop: 5,
        alignSelf: 'flex-end',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: Colors.overlay, // Glass dark
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
    },
    menuContainer: {
        backgroundColor: Colors.surface,
        borderRadius: 12,
        width: 200,
        marginRight: 10,
        paddingVertical: 5,
        borderWidth: 1,
        borderColor: Colors.border,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 15,
    },
    menuText: {
        fontSize: 15,
        marginLeft: 10,
        color: Colors.text,
    }
});
