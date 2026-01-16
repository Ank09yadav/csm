import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
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
        // Professional Standard: Only connect if authenticated
        if (user && user._id && token) {
            Logger.info("Initializing socket connection...");

            const socketInstance = io(SOCKET_URL, {
                query: { userId: user._id },
                auth: { token },
                transports: ['websocket'],
                reconnection: true,
                reconnectionAttempts: 10,
                reconnectionDelay: 1000,
            });

            socketInstance.on('connect', () => {
                Logger.info('Socket connected:', socketInstance.id);
                setIsConnected(true);
            });

            socketInstance.on('disconnect', (reason) => {
                Logger.warn('Socket disconnected:', reason);
                setIsConnected(false);
            });

            socketInstance.on('connect_error', (err) => {
                Logger.error('Socket connection error:', err.message);
            });

            setSocket(socketInstance);

            return () => {
                Logger.debug("Cleaning up socket connection");
                socketInstance.disconnect();
            };
        } else {
            // Logout cleanup
            if (socket) {
                socket.disconnect();
                setSocket(null);
                setIsConnected(false);
            }
        }
    }, [user?._id, token]);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};
