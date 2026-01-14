import { api } from './api';

export const authService = {
    login: (payload: { username?: string; email?: string; password: string }) =>
        api('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),

    register: (payload: { username: string; password: string }) =>
        api('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),

    forgotPassword: (email: string) =>
        api('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),

    verifyOtp: (email: string, otp: string) =>
        api('/auth/verify-otp', { method: 'POST', body: JSON.stringify({ email, otp }) }),

    resetPassword: (payload: { email: string; otp: string; newPassword: string }) =>
        api('/auth/reset-password', { method: 'POST', body: JSON.stringify(payload) }),
};
