import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Platform, KeyboardAvoidingView, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSocket } from '../context/SocketContext';
import { Colors } from '../constants/Colors';

interface FooterInputProps {
    onSend?: (message: string) => void;
    chatType?: 'public' | 'private';
    chatId?: string;
    replyingTo?: any | null; // Allow generic for now to avoid circular dependency
    onCancelReply?: () => void;
}

export default function FooterInput({ onSend, chatType, chatId, replyingTo, onCancelReply }: FooterInputProps) {
    const [message, setMessage] = useState('');
    const insets = useSafeAreaInsets();
    const { socket, isConnected } = useSocket();

    const handleSend = () => {
        if (message.trim().length > 0) {

            if (chatType && chatId && socket && isConnected) {
                const payload = {
                    content: message,
                    type: 'TEXT',
                    replyTo: replyingTo ? replyingTo._id : undefined
                };

                if (chatType === 'public') {
                    socket.emit('sendPublicMessage', {
                        room: chatId,
                        ...payload
                    });
                } else if (chatType === 'private') {
                    socket.emit('sendPrivateMessage', {
                        conversationId: chatId,
                        ...payload
                    });
                }
            }

            if (onSend) {
                onSend(message);
            }
            setMessage('');
        }
    };

    return (
        <View>
            {/* Reply Preview Banner */}
            {replyingTo && (
                <View style={styles.replyPreviewBar}>
                    <View style={styles.replyPreviewLine} />
                    <View style={{ flex: 1 }}>
                        <Text style={styles.replyPreviewTitle}>
                            Replying into {(replyingTo.sender as any).username || "User"}
                        </Text>
                        <Text numberOfLines={1} style={styles.replyPreviewText}>
                            {replyingTo.content}
                        </Text>
                    </View>
                    <TouchableOpacity onPress={onCancelReply} style={{ padding: 5 }}>
                        <Ionicons name="close" size={20} color={Colors.textSecondary} />
                    </TouchableOpacity>
                </View>
            )}

            <View style={[styles.inputContainer, { paddingBottom: insets.bottom > 0 ? insets.bottom : 10 }]}>

                {/* Attach Button (Visual Only for now) */}
                <TouchableOpacity style={styles.attachButton}>
                    <Ionicons name="add" size={24} color={Colors.text} />
                </TouchableOpacity>

                {/* Text Input Area */}
                <View style={styles.inputFieldContainer}>
                    <TextInput
                        style={styles.textInput}
                        placeholder='Message...'
                        value={message}
                        onChangeText={setMessage}
                        multiline
                        placeholderTextColor={Colors.textSecondary}
                        maxLength={500}
                    />
                </View>

                {/* Send Button */}
                <TouchableOpacity
                    style={[styles.sendButton, !message.trim() && styles.sendButtonDisabled]}
                    onPress={handleSend}
                    disabled={!message.trim()}
                >
                    <Ionicons name='arrow-up' size={20} color="white" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    // Reply Preview Styles
    replyPreviewBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: Colors.surface,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
    },
    replyPreviewLine: {
        width: 4,
        height: '100%',
        backgroundColor: Colors.primary,
        marginRight: 10,
        borderRadius: 2,
    },
    replyPreviewTitle: {
        color: Colors.primary,
        fontWeight: 'bold',
        fontSize: 12,
        marginBottom: 2,
    },
    replyPreviewText: {
        color: Colors.textSecondary,
        fontSize: 12,
    },

    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        backgroundColor: Colors.surface, // Dark surface
        paddingTop: 12,
        paddingHorizontal: 12,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
    },
    attachButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: Colors.surfaceHighlight, // Slightly lighter
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 6,
        marginRight: 8,
    },
    inputFieldContainer: {
        flex: 1,
        backgroundColor: Colors.background, // Deep dark for input
        borderRadius: 20,
        borderWidth: 1,
        borderColor: Colors.border,
        paddingHorizontal: 15,
        paddingTop: 8,
        paddingBottom: 8,
        marginBottom: 4,
        minHeight: 40,
        maxHeight: 120,
    },
    textInput: {
        fontSize: 16,
        color: Colors.text,
        padding: 0,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
        marginBottom: 4,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    sendButtonDisabled: {
        backgroundColor: Colors.surfaceHighlight,
        shadowOpacity: 0,
        elevation: 0,
    },
});
