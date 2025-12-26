import React from 'react';
import { useUser } from '@clerk/clerk-expo';
import {
    StyleSheet, Text, View,
    KeyboardAvoidingView, ScrollView, Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FooterInput from '../../components/FooterInput';

export default function ChatPage() {
    const insets = useSafeAreaInsets();
    const { user } = useUser();
    const router = useRouter();

    const handleSend = (msg: string) => {
        console.log('Message sent:', msg);
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.mainWrapper}
            // Offset matches your header height to prevent overlapping
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
            {/* 1. Sub-Header (Sticky at top) */}
            <View style={[styles.subHeader, { paddingTop: insets.top }]}>
                <Text style={styles.subHeaderText}>English Room</Text>
            </View>

            {/* 2. Message List (Scrollable Area) */}
            <ScrollView
                style={styles.chatContainer}
                contentContainerStyle={{ padding: 15, paddingBottom: 20 }}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.receivedMessage}>
                    <Text style={styles.messageText}>Hello! This is the first message.</Text>
                    <Text style={styles.timestamp}>12:00 PM</Text>
                </View>

                {/* Placeholder for sent messages */}
                <View style={styles.sentMessage}>
                    <Text style={styles.sentMessageText}>Hi! I can see this works perfectly.</Text>
                </View>
            </ScrollView>

            {/* 3. Input Bar (Sticky at bottom) */}
            <FooterInput onSend={handleSend} />
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    mainWrapper: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    subHeader: {
        backgroundColor: '#fff',
        paddingHorizontal: 15,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    subHeaderText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1c2d43',
    },
    chatContainer: {
        flex: 1,
        backgroundColor: '#bdcfe7ff',
    },
    receivedMessage: {
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 15,
        borderTopLeftRadius: 2,
        maxWidth: '80%',
        alignSelf: 'flex-start',
        marginBottom: 10,
        elevation: 1,
    },
    sentMessage: {
        backgroundColor: '#2e78b7',
        padding: 12,
        borderRadius: 15,
        borderTopRightRadius: 2,
        maxWidth: '80%',
        alignSelf: 'flex-end',
        marginBottom: 10,
    },
    messageText: { color: '#333' },
    sentMessageText: { color: '#fff' },
    timestamp: { fontSize: 10, color: '#999', marginTop: 4, textAlign: 'right' },
});