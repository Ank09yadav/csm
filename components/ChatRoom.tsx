import React, { useRef, useState, useEffect } from 'react';
import {
    StyleSheet, Text, View,
    KeyboardAvoidingView, Platform, ActivityIndicator, FlatList
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import UserProfileModal from './UserProfileModal';
import FooterInput from './FooterInput';
import MessageBubble from './MessageBubble';

import { useChatMessages } from '../hooks/useChatMessages';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { Colors } from '../constants/Colors';
import { ChatRoomProps, Message } from '../types';

export default function ChatRoom({
    roomName,
    roomDisplayName,
    isHindiRoom,
    includeSafeAreaTop = true
}: ChatRoomProps) {
    const insets = useSafeAreaInsets();
    const { user } = useAuth();
    const { isConnected } = useSocket();
    const { messages, loading, replyingTo, setReplyingTo, sendMessage } = useChatMessages(roomName);

    // UI State
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const flatListRef = useRef<FlatList<Message>>(null);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        if (messages.length > 0) {
            // Small timeout to ensure layout is computed
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 200);
        }
    }, [messages.length, loading]);

    const handleProfilePress = (sender: any) => {
        if (user && sender._id !== user._id) {
            setSelectedUser(sender);
        }
    };

    const renderItem = ({ item }: { item: Message }) => {
        const isMe = user?._id === item.sender._id;
        return (
            <MessageBubble
                message={item}
                isMe={isMe}
                onSwipe={(msg) => setReplyingTo(msg)}
                onProfilePress={handleProfilePress}
            />
        );
    };

    const EmptyComponent = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No messages yet.</Text>
            <Text style={styles.emptySubtitle}>Be the first to say hello!</Text>
        </View>
    );

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
                    {roomDisplayName} {isConnected ? <Text style={styles.statusDot}>🟢</Text> : <Text style={styles.statusDot}>🔴</Text>}
                </Text>
            </View>

            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            ) : (
                <View style={styles.listContainer}>
                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        keyExtractor={(item) => item._id}
                        renderItem={renderItem}
                        contentContainerStyle={styles.flatListContent}
                        ListEmptyComponent={EmptyComponent}
                        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                        onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
                    />
                </View>
            )}

            <FooterInput
                onSend={sendMessage}
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
    statusDot: {
        fontSize: 12,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContainer: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    flatListContent: {
        padding: 15,
        paddingBottom: 20,
        flexGrow: 1,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 50,
        flex: 1,
        justifyContent: 'center'
    },
    emptyTitle: {
        color: Colors.textSecondary,
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    emptySubtitle: {
        color: Colors.textMuted,
        fontSize: 14,
    },
});
