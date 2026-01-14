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
        <View style={[styles.inputContainer, { paddingBottom: insets.bottom > 0 ? insets.bottom : 10 }]}>

            {/* Attach Button (Visual Only for now) */}
            <TouchableOpacity style={styles.attachButton}>
                <Ionicons name="add" size={24} color="#4A00E0" />
            </TouchableOpacity>

            {/* Text Input Area */}
            <View style={styles.inputFieldContainer}>
                <TextInput
                    style={styles.textInput}
                    placeholder='Message...'
                    value={message}
                    onChangeText={setMessage}
                    multiline
                    placeholderTextColor="#999"
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
        backgroundColor: '#fff',
        paddingTop: 12,
        paddingHorizontal: 12,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    attachButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#f0f2f5',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 6,
        marginRight: 8,
    },
    inputFieldContainer: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#eee',
        paddingHorizontal: 15,
        paddingTop: 8,
        paddingBottom: 8,
        marginBottom: 4,
        minHeight: 40,
        maxHeight: 120,
    },
    textInput: {
        fontSize: 16,
        color: '#1a1a1a',
        padding: 0,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#4A00E0',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
        marginBottom: 4,
        shadowColor: '#4A00E0',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    sendButtonDisabled: {
        backgroundColor: '#ccc',
        shadowOpacity: 0,
        elevation: 0,
    },
});
