import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

import type { User } from '../types';
import { UserRole } from '../types';

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    googleLogin: (token: string, role?: string) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => void;
    updateUser: (user: User) => void;
    completeGoogleProfile?: (name: string, role: UserRole) => Promise<void>;
    googleProfileSetup?: {
        googleName?: string;
        email?: string;
    } | null;
}

interface RegisterData {
    name: string;
    email: string;
    password: string;
    role: UserRole;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check for existing session
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
            try {
                // Validate that storedUser is valid JSON
                if (storedUser === 'undefined' || storedUser === 'null' || !storedUser.trim()) {
                    // Invalid stored user, clear it
                    localStorage.removeItem('user');
                    localStorage.removeItem('token');
                    setIsLoading(false);
                    return;
                }
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
                setIsLoading(false);
            } catch (error) {
                // If JSON parse fails, clear invalid data
                console.error('Error parsing stored user:', error);
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                setIsLoading(false);
                return;
            }

            // Verify session with backend
            import('../services/api').then(({ authAPI }) => {
                authAPI.getMe()
                    .then((response) => {
                        const { user } = response.data;
                        if (user) {
                            setUser(user);
                            localStorage.setItem('user', JSON.stringify(user));
                        }
                    })
                    .catch(() => {
                        // If token invalid, logout
                        setToken(null);
                        setUser(null);
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                    });
            });
        } else {
            setIsLoading(false);
        }
    }, []);

    const login = async (email: string, password: string) => {
        const { authAPI } = await import('../services/api');
        const response = await authAPI.login({ email, password });
        const { token: newToken, user: newUser } = response.data;

        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));

        setToken(newToken);
        setUser(newUser);
    };

    const googleLogin = async (credential: string, role?: string) => {
        // Call real backend API for Google OAuth
        const { authAPI } = await import('../services/api');
        const response = await authAPI.googleLogin(credential, role);
        const { token: newToken, user: newUser } = response.data;

        // Store token
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));

        setToken(newToken);
        setUser(newUser);
    };

    const register = async (data: RegisterData) => {
        const { authAPI } = await import('../services/api');
        const response = await authAPI.register(data);
        const { token: newToken, user: newUser } = response.data;

        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));

        setToken(newToken);
        setUser(newUser);
    };

    const logout = async () => {
        try {
            const { authAPI } = await import('../services/api');
            await authAPI.logout();
        } catch (error) {
            console.error('Logout failed', error);
        }
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    };

    const updateUser = (updatedUser: User) => {
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isLoading,
                isAuthenticated: !!token && !!user,
                login,
                googleLogin,
                register,
                logout,
                updateUser,
                completeGoogleProfile: undefined,
                googleProfileSetup: null,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
