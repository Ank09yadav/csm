import { api } from './api';

export const userService = {
    getUserById: (userId: string) =>
        api(`/users/${userId}`, { authenticated: true, method: 'GET' }),
};
