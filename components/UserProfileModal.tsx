import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, Image, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Colors } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useSocket } from '../context/SocketContext';
import { Logger } from '../services/Logger';
import { userService } from '../services/userService';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import ReportModal from './ReportModal';

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
        createdAt?: string;
    } | null;
}

export default function UserProfileModal({ visible, onClose, user }: UserProfileModalProps) {
    const { socket, isConnected } = useSocket();
    const { user: currentUser } = useAuth();
    const router = useRouter();
    const [requestSent, setRequestSent] = useState(false);
    const [fullUser, setFullUser] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [reportModalVisible, setReportModalVisible] = useState(false);
    const [reporting, setReporting] = useState(false);

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

    const handleReportSubmit = async (reason: string) => {
        setReporting(true);
        try {
            await api('/user/report', {
                method: 'POST',
                authenticated: true,
                body: JSON.stringify({ targetUserId: user?._id, reason })
            });
            Alert.alert("Report Submitted", "Thank you for your report. We will review it shortly.");
            setReportModalVisible(false);
        } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to submit report");
        } finally {
            setReporting(false);
        }
    };

    if (!user) return null;

    // Merge passed user data with fetched data
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

    // Date formatting
    const joinedDate = displayUser.createdAt ? new Date(displayUser.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }) : 'Unknown';

    // Friend Logic
    // Check if friends list contains current user ID (String or Object comparison)
    const isFriend = displayUser.friends?.some((f: any) =>
        (typeof f === 'string' && f === currentUser?._id) ||
        (typeof f === 'object' && f._id === currentUser?._id)
    );

    const isRequestPending = requestSent ||
        displayUser.friendRequests?.some((id: any) => id.toString() === currentUser?._id) ||
        displayUser.sentRequests?.some((id: any) => id.toString() === currentUser?._id);

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

                        <TouchableOpacity
                            style={styles.reportButton}
                            onPress={() => setReportModalVisible(true)}
                        >
                            <Ionicons name="flag-outline" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    {/* Profile Image - Left Aligned */}
                    <View style={styles.profileHeaderSection}>
                        <Image source={{ uri: avatarUri }} style={styles.profileImage} />
                        <View style={{ flex: 1 }}>
                            {/* Empty space for now, or stats */}
                        </View>
                    </View>

                    {/* Content */}
                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={Colors.primary} />
                        </View>
                    ) : (
                        <ScrollView contentContainerStyle={styles.infoContainer}>
                            <View style={styles.nameSection}>
                                <Text style={styles.name}>{displayUser.name || displayUser.username}</Text>
                                <Text style={styles.username}>@{displayUser.username}</Text>
                                <Text style={styles.joinedDate}>Joined {joinedDate}</Text>
                            </View>

                            <View style={styles.divider} />

                            {displayUser.college && (
                                <View style={styles.infoRow}>
                                    <View style={styles.iconBox}>
                                        <Ionicons name="school-outline" size={20} color={Colors.primary} />
                                    </View>
                                    <View>
                                        <Text style={styles.label}>Institution</Text>
                                        <Text style={styles.value}>{displayUser.college}</Text>
                                    </View>
                                </View>
                            )}

                            {displayUser.about && (
                                <View style={styles.infoRow}>
                                    <View style={styles.iconBox}>
                                        <Ionicons name="information-circle-outline" size={20} color={Colors.primary} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.label}>About</Text>
                                        <Text style={styles.value}>{displayUser.about}</Text>
                                    </View>
                                </View>
                            )}

                            {/* Action Buttons */}
                            <View style={styles.actionContainer}>
                                {isFriend ? (
                                    <>
                                        <TouchableOpacity style={[styles.actionButton, styles.friendIndicator]}>
                                            <Ionicons name="people" size={20} color={Colors.text} />
                                            <Text style={[styles.actionText, { color: Colors.text }]}>Friends</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={[styles.actionButton, styles.messageButton]}
                                            onPress={() => {
                                                onClose();
                                                router.push(`/(privateChat)/${displayUser._id}`);
                                            }}
                                        >
                                            <Ionicons name="chatbubble-ellipses" size={20} color="#fff" />
                                            <Text style={styles.actionText}>Message</Text>
                                        </TouchableOpacity>
                                    </>
                                ) : (
                                    <>
                                        <TouchableOpacity
                                            style={[
                                                styles.actionButton,
                                                styles.addButton,
                                                isRequestPending && styles.disabledButton
                                            ]}
                                            onPress={handleAddFriend}
                                            disabled={isRequestPending}
                                        >
                                            <Ionicons name={isRequestPending ? "time-outline" : "person-add"} size={20} color="#fff" />
                                            <Text style={styles.actionText}>
                                                {isRequestPending ? "Request Sent" : "Add Friend"}
                                            </Text>
                                        </TouchableOpacity>

                                        {/* Disabled/Hidden Message Button for non-friends if strictly required by user request ("enable... when friends") */}
                                        <TouchableOpacity
                                            style={[styles.actionButton, styles.messageButton, { opacity: 0.5 }]}
                                            disabled={true}
                                        >
                                            <Ionicons name="chatbubble-ellipses-outline" size={20} color="#fff" />
                                            <Text style={styles.actionText}>Message</Text>
                                        </TouchableOpacity>
                                    </>
                                )}
                            </View>

                        </ScrollView>
                    )}
                </View>
            </View>

            <ReportModal
                visible={reportModalVisible}
                onClose={() => setReportModalVisible(false)}
                onSubmit={handleReportSubmit}
                loading={reporting}
            />
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: Colors.overlay,
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: Colors.surface,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        height: '85%', // Taller modal
        borderTopWidth: 1,
        borderTopColor: Colors.border,
    },
    headerBackground: {
        height: 120,
        backgroundColor: Colors.primary,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
    },
    closeButton: {
        position: 'absolute',
        top: 20,
        right: 20,
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: 20,
        padding: 5,
        zIndex: 10
    },
    reportButton: {
        position: 'absolute',
        top: 20,
        left: 20,
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: 20,
        padding: 5,
        zIndex: 10
    },
    profileHeaderSection: {
        paddingHorizontal: 24,
        marginTop: -60, // Overlap header
        marginBottom: 10,
        alignItems: 'flex-start', // Left align
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 6,
        borderColor: Colors.surface,
        backgroundColor: Colors.surface,
    },
    loadingContainer: {
        padding: 50,
        alignItems: 'center',
    },
    infoContainer: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    nameSection: {
        marginTop: 10,
        marginBottom: 20,
        alignItems: 'flex-start' // Left Align
    },
    name: {
        fontSize: 26,
        fontWeight: 'bold',
        color: Colors.text,
    },
    username: {
        fontSize: 16,
        color: Colors.primary,
        fontWeight: '600',
        marginBottom: 4
    },
    joinedDate: {
        fontSize: 12,
        color: Colors.textMuted
    },
    divider: {
        height: 1,
        backgroundColor: Colors.border,
        width: '100%',
        marginBottom: 20
    },
    infoRow: {
        flexDirection: 'row',
        marginBottom: 24,
        alignItems: 'flex-start'
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: Colors.surfaceHighlight,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16
    },
    label: {
        fontSize: 13,
        color: Colors.textMuted,
        fontWeight: '600',
        marginBottom: 4,
        textTransform: 'uppercase'
    },
    value: {
        fontSize: 16,
        color: Colors.text,
        lineHeight: 24
    },
    actionContainer: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 10
    },
    actionButton: {
        flex: 1,
        height: 50,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    addButton: {
        backgroundColor: Colors.surfaceHighlight,
        borderWidth: 1,
        borderColor: Colors.border
    },
    messageButton: {
        backgroundColor: Colors.primary,
    },
    friendIndicator: {
        backgroundColor: Colors.surfaceHighlight, // Neutral
        borderWidth: 1,
        borderColor: Colors.primary // Green border to indicate connected
    },
    disabledButton: {
        backgroundColor: Colors.surface,
        borderColor: Colors.textMuted,
        opacity: 0.7
    },
    actionText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff'
    }
});
