import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, Image, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Colors } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useSocket } from '../context/SocketContext';
import { Logger } from '../services/Logger';
import { userService } from '../services/userService';
import { useRouter } from 'expo-router';

interface UserProfileModalProps {
    visible: boolean;
    onClose: () => void;
    user: {
        _id: string;
        username: string;
        name?: string;
        image?: string;
        about?: string;
        college?: string;
    } | null;
}

export default function UserProfileModal({ visible, onClose, user }: UserProfileModalProps) {
    const { socket, isConnected } = useSocket();
    const router = useRouter();
    const [requestSent, setRequestSent] = useState(false);
    const [fullUser, setFullUser] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (visible && user?._id) {
            fetchUserDetails();
            setRequestSent(false);
        } else {
            setFullUser(null);
        }
    }, [visible, user]);

    const fetchUserDetails = async () => {
        if (!user?._id) return;
        setLoading(true);
        try {
            const data = await userService.getUserById(user._id);
            setFullUser(data);
        } catch (error) {
            Logger.error("Failed to fetch user details", error);
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    // Merge passed user data with fetched data (fetched takes precedence)
    const displayUser = { ...user, ...fullUser };

    const handleAddFriend = () => {
        if (socket && isConnected) {
            socket.emit('sendFriendRequest', user._id);
            setRequestSent(true);
            Logger.info(`Friend request sent to ${user.username}`);
        }
    };

    const avatarUri = displayUser.image
        ? displayUser.image
        : `https://ui-avatars.com/api/?name=${displayUser.name || displayUser.username}&background=random&color=fff`;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>

                    {/* Header Image Background */}
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
                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={Colors.primary} />
                        </View>
                    ) : (
                        <ScrollView contentContainerStyle={styles.infoContainer}>
                            <Text style={styles.name}>{displayUser.name || displayUser.username}</Text>
                            <Text style={styles.username}>@{displayUser.username}</Text>

                            {displayUser.college && (
                                <View style={styles.infoItem}>
                                    <Ionicons name="school-outline" size={18} color={Colors.textSecondary} style={{ marginRight: 8 }} />
                                    <Text style={styles.infoText}>{displayUser.college}</Text>
                                </View>
                            )}

                            {displayUser.about && (
                                <View style={styles.aboutContainer}>
                                    <Text style={styles.aboutTitle}>About</Text>
                                    <Text style={styles.aboutText}>{displayUser.about}</Text>
                                </View>
                            )}

                            {/* Actions */}
                            <ActionButtons
                                displayUser={displayUser}
                                requestSent={requestSent}
                                onRequestSent={() => {
                                    handleAddFriend();
                                }}
                                onClose={onClose}
                            />
                        </ScrollView>
                    )}
                </View>
            </View>
        </Modal>
    );
}

// Separate component to handle the logic cleanly using hooks if needed, or just inline.
// Since we are inside the component, we can access context.
// But we need 'currentUser' from AuthContext.
import { useAuth } from '../context/AuthContext';

function ActionButtons({ displayUser, requestSent, onRequestSent, onClose }: any) {
    const { user: currentUser } = useAuth();
    const router = useRouter();

    // Check status
    const isFriend = displayUser.friends?.includes((currentUser as any)?._id || (currentUser as any)?.userId) ||
        displayUser.friends?.some((f: any) => f === (currentUser as any)?._id || f._id === (currentUser as any)?._id);

    // Check if we already sent a request (UI state + data check)
    // Note: displayUser.friendRequests contains IDs of people who requested *displayUser*
    const isRequestPending = requestSent || (displayUser.friendRequests?.includes(currentUser?._id));

    // Check if *they* sent *us* a request (optional, could show "Accept")

    return (
        <View style={styles.actionContainer}>
            {isFriend ? (
                <TouchableOpacity
                    style={[styles.actionButton, styles.disabledButton]}
                    disabled={true}
                >
                    <Ionicons name="people" size={20} color="#fff" />
                    <Text style={styles.actionButtonText}>Friends</Text>
                </TouchableOpacity>
            ) : (
                <TouchableOpacity
                    style={[styles.actionButton, isRequestPending && styles.disabledButton]}
                    onPress={onRequestSent}
                    disabled={isRequestPending}
                >
                    <Ionicons name={isRequestPending ? "checkmark" : "person-add"} size={20} color="#fff" />
                    <Text style={styles.actionButtonText}>
                        {isRequestPending ? "Request Sent" : "Add Friend"}
                    </Text>
                </TouchableOpacity>
            )}

            <TouchableOpacity
                style={[styles.actionButton, styles.secondaryButton, !isFriend && { opacity: 0.5 }]}
                onPress={() => {
                    if (isFriend) {
                        onClose();
                        router.push(`/(privateChat)/${displayUser._id}`);
                    } else {
                        // Optional: Alert that they must be friends
                    }
                }}
                disabled={!isFriend}
            >
                <Ionicons name="chatbubble-ellipses-outline" size={20} color={isFriend ? Colors.text : Colors.textMuted} />
                <Text style={[styles.actionButtonText, { color: isFriend ? Colors.text : Colors.textMuted }]}>Message</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({

    modalOverlay: {
        flex: 1,
        backgroundColor: Colors.overlay, // Use shared overlay color
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: Colors.surface,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        minHeight: '50%',
        paddingBottom: 40,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
    },
    headerBackground: {
        height: 100,
        backgroundColor: Colors.primary, // Emerald
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        position: 'relative',
    },
    closeButton: {
        position: 'absolute',
        top: 15,
        right: 15,
        backgroundColor: Colors.surfaceHighlight, // Better than rgba
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
    loadingContainer: {
        padding: 50,
        alignItems: 'center',
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
        marginBottom: 15,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        backgroundColor: Colors.surfaceHighlight,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    infoText: {
        color: Colors.text,
        fontSize: 14,
    },
    aboutContainer: {
        width: '100%',
        backgroundColor: Colors.surfaceHighlight,
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
        backgroundColor: Colors.success, // Green for "Sent" / "Friends"
    },
    secondaryButton: {
        backgroundColor: Colors.surfaceHighlight,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    actionButtonText: {
        color: '#fff', // White text on buttons (Primary/Success)
        fontWeight: 'bold',
        marginLeft: 8,
        fontSize: 15,
    },
});
