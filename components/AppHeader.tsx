import { View, Text, TouchableOpacity, Image, Modal, Pressable, StyleSheet, ToastAndroid } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useRouter, usePathname } from 'expo-router';
import { useState } from 'react';
import { rooms } from '../constants/data';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
                        {/* Placeholder for user image if not available in auth context yet, or user.image */}
                        <View style={[styles.profileImage, { backgroundColor: '#ccc', justifyContent: 'center', alignItems: 'center' }]}>
                            <Text style={{ fontSize: 20, color: '#fff' }}>{headerTitle.charAt(0).toUpperCase()}</Text>
                        </View>
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
        backgroundColor: '#2e78b7',
        paddingBottom: 10,  // Add some bottom padding
        minHeight: 60,      // Ensure strict minimum height for content
        paddingHorizontal: 10,
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    leftContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginLeft: 10,
        flex: 1, // Allow text to take available space
    },
    imageContainer: { marginHorizontal: 5 },
    profileImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: '#e9e8f1ff',
    },
    rightContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconButton: {
        padding: 6,
        marginLeft: 8,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.2)', // Dim background
        justifyContent: 'flex-start', // Align to top
        alignItems: 'flex-end', // Align to right
    },
    dropdownMenu: {
        marginTop: 50, // Position below header (adjust based on header height)
        marginRight: 10,
        backgroundColor: 'white',
        borderRadius: 12,
        paddingVertical: 10,
        width: 180,
        elevation: 5, // Android shadow
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    menuHeader: {
        paddingHorizontal: 15,
        paddingVertical: 8,
        fontSize: 12,
        color: '#999',
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 15,
    },
    menuItemText: {
        marginLeft: 12,
        fontSize: 16,
        color: '#333',
    },
});
