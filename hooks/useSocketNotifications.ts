import { useEffect } from 'react';
import { Alert } from 'react-native';
import { useSocket } from '../context/SocketContext';
import { useRouter } from 'expo-router';
import { Logger } from '../services/Logger';
import { useAuth } from '../context/AuthContext';

export function useSocketNotifications() {
    const { socket } = useSocket();
    const router = useRouter();
    const { refreshUserData } = useAuth();

    useEffect(() => {
        if (!socket) return;

        const handleNotification = (data: any) => {
            Logger.info("Notification received hook:", data.type);

            // Refresh data on relevant notifications
            if (data.type === 'friendRequest' || data.type === 'friendRequestAccepted') {
                refreshUserData();
            }

            if (data.type === 'friendRequest') {
                Alert.alert(
                    'New Friend Request',
                    data.message,
                    [
                        { text: 'Ignore', style: 'cancel' },
                        {
                            text: 'View',
                            onPress: () => router.push('/(home)/friendListPage')
                        }
                    ]
                );
            }
            else if (data.type === 'friendRequestAccepted') {
                Alert.alert(
                    'Friend Connected',
                    data.message,
                    [
                        { text: 'OK' },
                        {
                            text: 'Chat',
                            onPress: () => {
                                if (data.from && data.from._id) {
                                    router.push(`/(privateChat)/${data.from._id}`);
                                }
                            }
                        }
                    ]
                );
            }
            else {
                // Generic notification
                Alert.alert('Notification', data.message);
            }
        };

        const handleFriendListUpdated = () => {
            Logger.debug("Friend list updated event received - Refreshing User Data");
            refreshUserData();
        };

        socket.on('notification', handleNotification);
        socket.on('friendListUpdated', handleFriendListUpdated);

        return () => {
            socket.off('notification', handleNotification);
            socket.off('friendListUpdated', handleFriendListUpdated);
        };
    }, [socket, router]);
}
