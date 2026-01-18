import { View, Text, TouchableOpacity, Image, Modal, Pressable, StyleSheet, ToastAndroid } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useRouter, usePathname } from 'expo-router';
import { useState } from 'react';
import { rooms } from '../constants/data';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';

export function AppHeader() {
    const { user } = useAuth();
    const router = useRouter();
    const currentPath = usePathname();
    const [menuVisible, setMenuVisible] = useState(false);
    const insets = useSafeAreaInsets();
    const headerTitle = user?.username || "Guest User";

    const safeNavigate = (targetPath: string) => {
        if (currentPath === targetPath) {
            ToastAndroid.show("You are already on this page", ToastAndroid.SHORT);
            return;
        }
        setMenuVisible(false);
        // @ts-ignore
        router.push(targetPath);
    };

    const navigateToRoom = (roomId: string) => {
        const targetPath = `/rooms/${roomId}`;

        if (roomId === 'hindi') {
            // Check if already in home
            if (currentPath === '/' || currentPath === '/(home)' || currentPath === '/(home)/index') {
                ToastAndroid.show("You are already in this room", ToastAndroid.SHORT);
            } else {
                router.replace('/');
            }
            setMenuVisible(false);
            return;
        }

        setMenuVisible(false);
        // @ts-ignore
        router.replace(targetPath);
    };

    return (
        <>

            <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
                <View style={styles.leftContainer}>
                    <TouchableOpacity
                        onPress={() => {
                            if (currentPath === '/profile')
                                ToastAndroid.show("Already on Profile Page", ToastAndroid.SHORT)
                            else
                                safeNavigate('/profile');
                        }}
                    >
                        {user?.image ? (
                            <Image source={{ uri: user.image }} style={styles.profileImage} />
                        ) : (
                            <View style={[styles.profileImage, { backgroundColor: Colors.surfaceHighlight, justifyContent: 'center', alignItems: 'center' }]}>
                                <Text style={{ fontSize: 20, color: Colors.text }}>{headerTitle.charAt(0).toUpperCase()}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                    <Text style={styles.headerTitle} numberOfLines={1}>{headerTitle}</Text>
                </View>

                <View style={styles.rightContainer}>
                    {/* Apps Icon triggers the Modal Menu */}
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => setMenuVisible(true)}
                    >
                        <Ionicons name={'home'} size={24} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => safeNavigate('/friendListPage')}
                    >
                        <Ionicons
                            name="chatbubble-ellipses"
                            size={24}
                            color="white"
                        />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Custom Dropdown Modal */}
            <Modal
                transparent={true}
                visible={menuVisible}
                animationType="fade"
                onRequestClose={() => setMenuVisible(false)}
            >
                <Pressable
                    style={styles.modalOverlay}
                    onPress={() => setMenuVisible(false)}
                >
                    <View style={styles.dropdownMenu}>
                        <Text style={styles.menuHeader}>Select Room</Text>
                        {rooms.map((room) => (
                            <TouchableOpacity
                                key={room.id}
                                style={styles.menuItem}
                                onPress={() => navigateToRoom(room.id)}
                            >
                                <Ionicons name={room.icon as any} size={20} color="#2e78b7" />
                                <Text style={styles.menuItemText}>{room.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </Pressable>
            </Modal>

        </>
    );
}

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: Colors.surface, // Dark Slate
        paddingBottom: 10,
        minHeight: 60,
        paddingHorizontal: 15, // Slightly more padding
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        elevation: 0, // Flat look
        shadowOpacity: 0,
    },
    leftContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    headerTitle: {
        fontSize: 20, // Slightly larger
        fontWeight: 'bold',
        color: Colors.text,
        marginLeft: 12,
        flex: 1,
    },
    imageContainer: { marginHorizontal: 5 },
    profileImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: Colors.primary, // Emerald Border
        overflow: 'hidden',
    },
    rightContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconButton: {
        padding: 8,
        marginLeft: 8,
        backgroundColor: Colors.surfaceHighlight, // Subtle circle bg
        borderRadius: 20,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: Colors.overlay, // Darker dim
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
    },
    dropdownMenu: {
        marginTop: 50,
        marginRight: 15,
        backgroundColor: Colors.surface,
        borderRadius: 16,
        paddingVertical: 10,
        width: 180,
        borderWidth: 1,
        borderColor: Colors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10,
    },
    menuHeader: {
        paddingHorizontal: 15,
        paddingVertical: 8,
        fontSize: 11,
        color: Colors.textMuted,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 15,
    },
    menuItemText: {
        marginLeft: 12,
        fontSize: 15,
        color: Colors.text,
        fontWeight: '500',
    },
});
