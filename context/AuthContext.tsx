import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';

interface User {
    username: string;
    _id: string;
}

interface AuthContextType {
    token: string | null;
    user: User | null;
    isLoading: boolean;
    signIn: (token: string, user: User) => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    token: null,
    user: null,
    isLoading: true,
    signIn: async () => { },
    signOut: async () => { },
});

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadAuth() {
            try {
                const storedToken = await SecureStore.getItemAsync('authToken');
                const storedUser = await SecureStore.getItemAsync('authUser');
                if (storedToken && storedUser) {
                    setToken(storedToken);
                    setUser(JSON.parse(storedUser));
                }
            } catch (e) {
                console.error("Failed to load auth", e);
            } finally {
                setIsLoading(false);
            }
        }
        loadAuth();
    }, []);

    const signIn = async (newToken: string, newUser: User) => {
        setToken(newToken);
        setUser(newUser);
        await SecureStore.setItemAsync('authToken', newToken);
        await SecureStore.setItemAsync('authUser', JSON.stringify(newUser));
    };

    const signOut = async () => {
        setToken(null);
        setUser(null);
        await SecureStore.deleteItemAsync('authToken');
        await SecureStore.deleteItemAsync('authUser');
    };

    return (
        <AuthContext.Provider value={{ token, user, isLoading, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}
