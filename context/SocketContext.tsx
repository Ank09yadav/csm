import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SOCKET_URL = 'https://csmserver.onrender.com';

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
        if (user && user._id) {
            console.log("Initializing socket for user:", user._id);
            const socketInstance = io(SOCKET_URL, {
                query: { userId: user._id },
                transports: ['websocket'],
            });

            socketInstance.on('connect', () => {
                console.log('Socket connected:', socketInstance.id);
                setIsConnected(true);
            });

            socketInstance.on('disconnect', () => {
                console.log('Socket disconnected');
                setIsConnected(false);
            });

            socketInstance.on('connect_error', (err) => {
                console.log('Socket connection error:', err);
            });

            setSocket(socketInstance);

            return () => {
                socketInstance.disconnect();
            };
        } else {
            console.log("No user loaded, skipping socket init");
            if (socket) {
                socket.disconnect();
                setSocket(null);
                setIsConnected(false);
            }
        }
    }, [user?._id]); // Only re-run if user ID changes

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};
