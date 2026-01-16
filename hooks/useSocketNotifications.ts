import { useEffect } from 'react';
import { Alert } from 'react-native';
import { useSocket } from '../context/SocketContext';
import { useRouter } from 'expo-router';
import { Logger } from '../services/Logger';

export function useSocketNotifications() {
    const { socket } = useSocket();
    const router = useRouter();

    useEffect(() => {
        if (!socket) return;

        const handleNotification = (data: any) => {
            Logger.info("Notification received hook:", data.type);

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
            // This could trigger a refresh via a global event emitter or Context
            // For now, we rely on the user navigating to the page to refresh, 
            // or we could implement a global "invalidateQuery" if using React Query.
            Logger.debug("Friend list updated event received");
        };

        socket.on('notification', handleNotification);
        socket.on('friendListUpdated', handleFriendListUpdated);

        return () => {
            socket.off('notification', handleNotification);
            socket.off('friendListUpdated', handleFriendListUpdated);
        };
    }, [socket, router]);
}
