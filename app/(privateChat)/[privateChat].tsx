import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Modal, ScrollView, Platform, Alert, Dimensions, KeyboardAvoidingView } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FooterInput from '../../components/FooterInput'; // Assuming this is the correct path based on previous context
import { getUser, User } from '../../constants/mocks'; // Adjust path if needed

const { width } = Dimensions.get('window');

export default function PrivateChatPage() {
    const { privateChat: userId } = useLocalSearchParams<{ privateChat: string }>();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [menuVisible, setMenuVisible] = useState(false);

    // Find the friend/user details
    // Ensure userId is treated as a string even if it comes as an array
    const targetUserId = Array.isArray(userId) ? userId[0] : userId;
    const friend = getUser(targetUserId || '') as User | undefined;

    // Dummy messages for UI visualization
    const [messages, setMessages] = useState([
        { id: '1', text: 'Hey, how are you?', sender: 'them', time: '10:00 AM' },
        { id: '2', text: 'I am good! just working on the new project.', sender: 'me', time: '10:05 AM' },
        { id: '3', text: 'That sounds great! Can\'t wait to see it.', sender: 'them', time: '10:07 AM' },
    ]);

    const handleSend = (text: string) => {
        setMessages([...messages, {
            id: Date.now().toString(),
            text,
            sender: 'me',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
    };

    const handleMenuOption = (option: string) => {
        setMenuVisible(false);
        Alert.alert('Action', `You selected: ${option}`);
        // Implement actual logic here
    };

    if (!friend) {
        return (
            <View style={styles.container}>
                <Stack.Screen options={{ title: 'Chat' }} />
                <Text style={{ textAlign: 'center', marginTop: 20 }}>User not found</Text>
            </View>
        );
    }

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
                            <Image source={{ uri: friend.avatarUrl || undefined }} style={styles.avatar} />
                            <View>
                                <Text style={styles.headerName}>{friend.name}</Text>
                                <Text style={styles.headerStatus}>{friend.status}</Text>
                            </View>
                        </View>
                    ),
                    headerRight: () => (
                        <TouchableOpacity onPress={() => setMenuVisible(true)} style={{ padding: 5 }}>
                            <Ionicons name="ellipsis-vertical" size={24} color="#333" />
                        </TouchableOpacity>
                    ),
                }}
            />

            {/* Chat Area */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0} // Adjust based on header height
            >
                <ScrollView
                    style={styles.chatArea}
                    contentContainerStyle={{ padding: 15, paddingBottom: 20 }}
                >
                    {messages.map((msg) => (
                        <View
                            key={msg.id}
                            style={[
                                styles.messageBubble,
                                msg.sender === 'me' ? styles.myMessage : styles.theirMessage
                            ]}
                        >
                            <Text style={[styles.messageText, msg.sender === 'me' ? { color: '#fff' } : { color: '#333' }]}>
                                {msg.text}
                            </Text>
                            <Text style={[styles.timeText, msg.sender === 'me' ? { color: 'rgba(255,255,255,0.7)' } : { color: '#999' }]}>
                                {msg.time}
                            </Text>
                        </View>
                    ))}
                </ScrollView>

                <FooterInput onSend={handleSend} />
            </KeyboardAvoidingView>

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
                        <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuOption('Remove friend')}>
                            <Ionicons name="person-remove-outline" size={20} color="#ff4444" />
                            <Text style={[styles.menuText, { color: '#ff4444' }]}>Remove friend</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuOption('Report user')}>
                            <Ionicons name="flag-outline" size={20} color="#333" />
                            <Text style={styles.menuText}>Report user</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuOption('Mute notification')}>
                            <Ionicons name="notifications-off-outline" size={20} color="#333" />
                            <Text style={styles.menuText}>Mute notification</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuOption('Block')}>
                            <Ionicons name="ban-outline" size={20} color="#333" />
                            <Text style={styles.menuText}>Block</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuOption('Clear chat')}>
                            <Ionicons name="trash-outline" size={20} color="#333" />
                            <Text style={styles.menuText}>Clear chat</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
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
        backgroundColor: '#ddd'
    },
    headerName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1c2d43',
    },
    headerStatus: {
        fontSize: 12,
        color: '#4CAF50', // Green for online, could be dynamic
    },
    chatArea: {
        flex: 1,
    },
    messageBubble: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 16,
        marginBottom: 10,
    },
    myMessage: {
        alignSelf: 'flex-end',
        backgroundColor: '#2e78b7',
        borderBottomRightRadius: 2,
    },
    theirMessage: {
        alignSelf: 'flex-start',
        backgroundColor: '#fff',
        borderBottomLeftRadius: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
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

    // Menu Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.1)',
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
    },
    menuContainer: {
        backgroundColor: 'white',
        borderRadius: 12,
        width: 200,
        marginRight: 10,
        paddingVertical: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
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
        color: '#333',
    }
});
