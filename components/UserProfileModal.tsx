import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, Image, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Colors } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useSocket } from '../context/SocketContext';
import { Logger } from '../services/Logger';

interface UserProfileModalProps {
    visible: boolean;
    onClose: () => void;
    user: {
        _id: string;
        username: string;
        name?: string;
        image?: string;
        about?: string;
    } | null;
}

import { useRouter } from 'expo-router';

export default function UserProfileModal({ visible, onClose, user }: UserProfileModalProps) {
    const { socket, isConnected } = useSocket();
    const router = useRouter();
    const [requestSent, setRequestSent] = useState(false);

    if (!user) return null;

    const handleAddFriend = () => {
        if (socket && isConnected) {
            socket.emit('sendFriendRequest', user._id);
            setRequestSent(true);
            Logger.info(`Friend request sent to ${user.username}`);
        }
    };

    const avatarUri = user.image
        ? user.image
        : `https://ui-avatars.com/api/?name=${user.name || user.username}&background=random&color=fff`;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>

                    {/* Header Image Background (Optional, using solid color for now) */}
                    <View style={styles.headerBackground}>
                        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                            <Ionicons name="close" size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    {/* Profile Image */}
                    <View style={styles.profileImageContainer}>
                        <Image source={{ uri: avatarUri }} style={styles.profileImage} />
                    </View>

                    {/* Content */}
                    <View style={styles.infoContainer}>
                        <Text style={styles.name}>{user.name || user.username}</Text>
                        <Text style={styles.username}>@{user.username}</Text>

                        {user.about && (
                            <View style={styles.aboutContainer}>
                                <Text style={styles.aboutTitle}>About</Text>
                                <Text style={styles.aboutText}>{user.about}</Text>
                            </View>
                        )}

                        {/* Actions */}
                        <View style={styles.actionContainer}>
                            <TouchableOpacity
                                style={[styles.actionButton, requestSent && styles.disabledButton]}
                                onPress={handleAddFriend}
                                disabled={requestSent}
                            >
                                <Ionicons name={requestSent ? "checkmark" : "person-add"} size={20} color="#fff" />
                                <Text style={styles.actionButtonText}>
                                    {requestSent ? "Request Sent" : "Add Friend"}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.actionButton, styles.secondaryButton]}
                                onPress={() => {
                                    onClose();
                                    router.push(`/(privateChat)/${user._id}`);
                                }}
                            >
                                <Ionicons name="chatbubble-ellipses-outline" size={20} color={Colors.text} />
                                <Text style={[styles.actionButtonText, { color: Colors.text }]}>Message</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: Colors.surface,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        minHeight: '50%',
        paddingBottom: 40,
    },
    headerBackground: {
        height: 100,
        backgroundColor: Colors.primaryDark,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        position: 'relative',
    },
    closeButton: {
        position: 'absolute',
        top: 15,
        right: 15,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 20,
        padding: 5,
    },
    profileImageContainer: {
        alignItems: 'center',
        marginTop: -50,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 4,
        borderColor: Colors.surface,
        backgroundColor: Colors.surface,
    },
    infoContainer: {
        padding: 20,
        alignItems: 'center',
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 4,
    },
    username: {
        fontSize: 16,
        color: Colors.textSecondary,
        marginBottom: 20,
    },
    aboutContainer: {
        width: '100%',
        backgroundColor: 'rgba(255,255,255,0.05)',
        padding: 15,
        borderRadius: 12,
        marginBottom: 20,
    },
    aboutTitle: {
        color: Colors.textMuted,
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 5,
        textTransform: 'uppercase',
    },
    aboutText: {
        color: Colors.text,
        fontSize: 14,
        lineHeight: 20,
    },
    actionContainer: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    actionButton: {
        flex: 1,
        backgroundColor: Colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        marginHorizontal: 5,
    },
    disabledButton: {
        backgroundColor: Colors.success,
    },
    secondaryButton: {
        backgroundColor: Colors.surfaceHighlight,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    actionButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        marginLeft: 8,
        fontSize: 15,
    },
});
