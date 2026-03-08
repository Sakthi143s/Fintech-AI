import { create } from 'zustand';
import { api } from '../services/api';

interface User {
    id: number;
    name: string;
    email: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (token: string) => Promise<void>;
    logout: () => void;
    checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: localStorage.getItem('token'),
    isLoading: true,
    login: async (token: string) => {
        localStorage.setItem('token', token);
        set({ token });
        try {
            const res = await api.get('/auth/me');
            set({ user: res.data, isLoading: false });
        } catch (err) {
            localStorage.removeItem('token');
            set({ user: null, token: null, isLoading: false });
        }
    },
    logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null });
        window.location.href = '/login';
    },
    checkAuth: async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            set({ isLoading: false });
            return;
        }
        try {
            const res = await api.get('/auth/me');
            set({ user: res.data, isLoading: false });
        } catch (err) {
            localStorage.removeItem('token');
            set({ user: null, token: null, isLoading: false });
        }
    },
}));
