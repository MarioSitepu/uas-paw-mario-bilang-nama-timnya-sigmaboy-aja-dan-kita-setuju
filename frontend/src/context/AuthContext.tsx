import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authService } from '../services/mock/auth.service';
import type { User } from '../types';
import { UserRole } from '../types';

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    googleLogin: (token: string) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => void;
    updateUser: (user: User) => void;
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
        const storedToken = authService.getToken();
        
        if (storedToken) {
            authService.getMe()
                .then((user) => {
                    if (user) {
                        setToken(storedToken);
                        setUser(user);
                    } else {
                        setToken(null);
                        setUser(null);
                    }
                })
                .catch(() => {
                    setToken(null);
                    setUser(null);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        } else {
            setIsLoading(false);
        }
    }, []);

    const login = async (email: string, password: string) => {
        const { token: newToken, user: newUser } = await authService.login(email, password);
        setToken(newToken);
        setUser(newUser);
    };

    const googleLogin = async (_credential: string) => {
        // For mock, we'll just create a dummy user from Google
        // In real app, verify credential with backend
        const email = 'google@user.com'; // Extract from credential in real app
        const { token: newToken, user: newUser } = await authService.login(email, 'google_password');
        setToken(newToken);
        setUser(newUser);
    };

    const register = async (data: RegisterData) => {
        const { token: newToken, user: newUser } = await authService.register(data);
        setToken(newToken);
        setUser(newUser);
    };

    const logout = async () => {
        await authService.logout();
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
