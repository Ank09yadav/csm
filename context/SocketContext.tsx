import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Alert } from 'react-native';
import { useAuth } from './AuthContext';
import { SOCKET_URL } from '../constants/api';
import { Logger } from '../services/Logger';

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    const { user, token } = useAuth();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Only initialize if we have a user AND a token.
        // Professional apps require secure connections.
        if (user && user._id && token) {
            Logger.info("Initializing socket for user:", user._id);

            const socketInstance = io(SOCKET_URL, {
                query: { userId: user._id },
                auth: { token }, // securely pass token
                transports: ['websocket'],
                reconnection: true,
                reconnectionAttempts: 5,
            });

            socketInstance.on('connect', () => {
                Logger.info('Socket connected:', socketInstance.id);
                setIsConnected(true);
            });

            socketInstance.on('disconnect', () => {
                Logger.warn('Socket disconnected');
                setIsConnected(false);
            });

            socketInstance.on('connect_error', (err) => {
                Logger.error('Socket connection error:', err);
            });

            // Global Notification Listener
            socketInstance.on('notification', (data: any) => {
                Logger.info('Notification received:', data);
                // In a future update, this should use a proper In-App Notification UI (Toast/Snackbar)
                // For now, we use Alert as a robust fallback.
                if (data.type === 'friendRequest') {
                    Alert.alert(
                        'New Friend Request',
                        data.message,
                        [
                            { text: 'Ignore', style: 'cancel' },
                            {
                                text: 'Accept',
                                onPress: () => {
                                    socketInstance.emit('acceptFriendRequest', data.from._id);
                                }
                            }
                        ]
                    );
                } else if (data.type === 'friendRequestAccepted') {
                    Alert.alert('Friend Request Accepted', data.message);
                } else {
                    Alert.alert('Notification', data.message);
                }
            });

            setSocket(socketInstance);

            return () => {
                Logger.debug("Cleaning up socket connection");
                socketInstance.disconnect();
            };
        } else {
            if (socket) {
                Logger.debug("User logged out, closing socket");
                socket.disconnect();
                setSocket(null);
                setIsConnected(false);
            }
        }
    }, [user?._id, token]); // Re-run if user or token changes

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};
