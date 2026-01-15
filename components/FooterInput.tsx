import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Platform, KeyboardAvoidingView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSocket } from '../context/SocketContext';
import { Colors } from '../constants/Colors';

interface FooterInputProps {
    onSend?: (message: string) => void;
    chatType?: 'public' | 'private';
    chatId?: string;
}

export default function FooterInput({ onSend, chatType, chatId }: FooterInputProps) {
    const [message, setMessage] = useState('');
    const insets = useSafeAreaInsets();
    const { socket, isConnected } = useSocket();

    const handleSend = () => {
        if (message.trim().length > 0) {

            if (chatType && chatId && socket && isConnected) {
                if (chatType === 'public') {
                    socket.emit('sendPublicMessage', {
                        room: chatId,
                        content: message,
                        type: 'TEXT'
                    });
                } else if (chatType === 'private') {
                    socket.emit('sendPrivateMessage', {
                        conversationId: chatId,
                        content: message,
                        type: 'TEXT'
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
    );
}

const styles = StyleSheet.create({
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
