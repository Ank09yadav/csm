import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

import { API_URL } from '../constants/api';

// Use the centralized API_URL which is set to the production server
export const BASE_URL = API_URL;

interface ApiOptions extends RequestInit {
    authenticated?: boolean;
}

export const api = async (endpoint: string, options: ApiOptions = {}) => {
    const url = `${BASE_URL}${endpoint}`;

    let headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    };

    if (options.authenticated) {
        const token = await SecureStore.getItemAsync('authToken');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    }

    try {
        const response = await fetch(url, { ...options, headers });
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || data.error || 'Something went wrong');
        }
        return data;
    } catch (error: any) {
        console.error(`API Error [${endpoint}]:`, error);
        throw error;
    }
};
