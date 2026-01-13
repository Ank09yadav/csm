import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Platform, KeyboardAvoidingView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSocket } from '../context/SocketContext';

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
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
            style={styles.keyboardView}
        >
            <View style={[styles.inputWrapper, { paddingBottom: insets.bottom + 10 }]}>
                <TouchableOpacity style={styles.iconButton}>
                    <Ionicons name='add-circle-outline' size={28} color="#2e78b7" />
                </TouchableOpacity>

                <TextInput
                    style={styles.textInput}
                    placeholder='Type a message...'
                    value={message}
                    onChangeText={setMessage}
                    multiline
                    placeholderTextColor="#999"
                />

                <TouchableOpacity
                    style={styles.sendButton}
                    onPress={handleSend}
                >
                    <Ionicons name='send' size={24} color="white" />
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        backgroundColor: '#fff',
        paddingHorizontal: 10,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    keyboardView: {
    },
    textInput: {
        flex: 1,
        backgroundColor: '#f0f2f5',
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 8,
        marginHorizontal: 10,
        maxHeight: 100,
        fontSize: 16,
        color: '#333',
    },
    iconButton: { padding: 5 },
    sendButton: {
        backgroundColor: '#2e78b7',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    }
});
