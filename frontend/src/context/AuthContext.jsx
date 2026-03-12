import { createContext, useContext, useState, useCallback } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
    });
    const [token, setToken] = useState(() => localStorage.getItem('token'));

    const login = useCallback(async (username, password) => {
        const data = await authService.login({ username, password });
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify({ username: data.username, email: data.email }));
        setToken(data.access_token);
        setUser({ username: data.username, email: data.email });
        return data;
    }, []);

    const signup = useCallback(async (username, email, password) => {
        const data = await authService.signup({ username, email, password });
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify({ username: data.username, email: data.email }));
        setToken(data.access_token);
        setUser({ username: data.username, email: data.email });
        return data;
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider value={{ user, token, login, signup, logout, isAuthenticated: !!token }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};
