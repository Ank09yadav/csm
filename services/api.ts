import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

import { API_URL } from '../constants/api';
import { Logger } from './Logger';

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
        try {
            const token = await SecureStore.getItemAsync('authToken');
            Logger.debug(`[API] Requesting ${endpoint} | Authenticated: true | Token Found: ${!!token}`);

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            } else {
                Logger.warn(`[API] Authenticated request but no token found.`);
            }
        } catch (error) {
            Logger.error(`[API] Error retrieving token`, error);
        }
    } else {
        Logger.debug(`[API] Requesting ${endpoint} | Authenticated: false`);
    }

    try {
        Logger.debug(`[API] Fetching: ${url}`);
        const response = await fetch(url, { ...options, headers });
        Logger.debug(`[API] Response Status: ${response.status}`);

        const data = await response.json();

        if (!response.ok) {
            Logger.error(`[API] Error Response:`, data);
            throw new Error(data.message || data.error || 'Something went wrong');
        }
        return data;
    } catch (error: any) {
        Logger.error(`API Error [${endpoint}]:`, error);
        throw error;
    }
};
