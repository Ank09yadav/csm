import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface FooterInputProps {
    onSend: (message: string) => void;
}

export default function FooterInput({ onSend }: FooterInputProps) {
    const [message, setMessage] = useState('');
    const insets = useSafeAreaInsets();

    const handleSend = () => {
        if (message.trim().length > 0) {
            onSend(message);
            setMessage('');
        }
    };

    return (
        <View style={[styles.inputWrapper, { paddingBottom: insets.bottom + 30 }]}>
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
