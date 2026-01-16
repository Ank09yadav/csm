import React, { useEffect } from 'react';
import { Alert } from 'react-native';
import { useSocket } from '../context/SocketContext';
import { Logger } from '../services/Logger';
import { useRouter } from 'expo-router';

export default function NotificationManager() {
    const { socket, isConnected } = useSocket();
    const router = useRouter();

    useEffect(() => {
        if (!socket || !isConnected) return;

        const handleNotification = (data: any) => {
            Logger.info("Notification Received:", data);

            // "next user will get a notification that you this persons send you a friend request"
            if (data.type === 'friendRequest') {
                Alert.alert(
                    "New Friend Request",
                    data.message,
                    [
                        { text: "Ignore", style: "cancel" },
                        {
                            text: "View",
                            onPress: () => router.push('/(home)/friendListPage')
                        }
                    ]
                );
            }
            // "if thet user will accept the request then the user who send the friends request they will get a notification"
            else if (data.type === 'friendRequestAccepted') {
                Alert.alert(
                    "Friend Request Accepted",
                    data.message,
                    [
                        { text: "OK" },
                        {
                            text: "Chat",
                            onPress: () => {
                                // Navigate to private chat
                                if (data.from && data.from._id) {
                                    router.push(`/(privateChat)/${data.from._id}`);
                                }
                            }
                        }
                    ]
                );
            }
        };

        socket.on('notification', handleNotification);

        return () => {
            socket.off('notification', handleNotification);
        };
    }, [socket, isConnected]);

    return null; // Logic only
}
