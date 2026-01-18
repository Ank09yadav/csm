import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';

interface User {
    _id: string;
    username: string;
    name?: string;
    image?: string;
    email?: string;
    about?: string;
    college?: string;
    isPremium?: boolean;
    reports?: number;
    friends?: any[];
}

interface AuthContextType {
    token: string | null;
    user: User | null;
    isLoading: boolean;
    signIn: (token: string, user: User) => Promise<void>;
    signOut: () => Promise<void>;
    updateUser: (updatedData: Partial<User>) => Promise<void>;
    refreshUserData: () => Promise<void>;
}

import { API_URL } from '../constants/api';

const AuthContext = createContext<AuthContextType>({
    token: null,
    user: null,
    isLoading: true,
    signIn: async () => { },
    signOut: async () => { },
    updateUser: async () => { },
    refreshUserData: async () => { },
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

    const updateUser = async (updatedData: Partial<User>) => {
        if (!user) return;
        const newUser = { ...user, ...updatedData };
        setUser(newUser);
        await SecureStore.setItemAsync('authUser', JSON.stringify(newUser));
    };

    const signOut = async () => {
        setToken(null);
        setUser(null);
        await SecureStore.deleteItemAsync('authToken');
        await SecureStore.deleteItemAsync('authUser');
    };

    const refreshUserData = async () => {
        if (!token) return;
        try {
            // We need to use valid API URL. Using absolute path or importing API service might cause circular dep if api uses useAuth.
            // Safe to uses fetch here directly or helper that doesn't use hooks.
            // Actually, we can use the 'api' service if we ensure it doesn't depend on useAuth hooks during initialization.
            // But 'api' service likely takes token as arg? Let's check api.ts.
            // For now, raw fetch with stored token is safest to avoid circular deps.

            // Note: We need API_URL. We can import it.
            const response = await fetch(`${API_URL}/user`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();

            if (response.ok && data.user) {
                const refreshedUser = data.user;
                setUser(refreshedUser);
                await SecureStore.setItemAsync('authUser', JSON.stringify(refreshedUser));
            }
        } catch (error) {
            console.error("Background User Refresh Failed", error);
        }
    };

    return (
        <AuthContext.Provider value={{ token, user, isLoading, signIn, signOut, updateUser, refreshUserData }}>
            {children}
        </AuthContext.Provider>
    );
}
