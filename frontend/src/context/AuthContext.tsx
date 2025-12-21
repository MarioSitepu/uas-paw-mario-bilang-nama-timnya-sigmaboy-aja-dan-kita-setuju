import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authAPI } from '../services/api';
import type { User } from '../types';
import { UserRole } from '../types';

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    needsProfileSetup: boolean;
    googleProfileSetup: { email: string; googleName: string; googleToken: string; selectedRole?: UserRole } | null;
    login: (email: string, password: string, role?: string) => Promise<void>;
    googleLogin: (credential: string, role?: UserRole) => Promise<{ isNewUser: boolean }>;
    completeGoogleProfile: (name: string, role: UserRole) => Promise<void>;
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
    const [needsProfileSetup, setNeedsProfileSetup] = useState(false);
    const [googleProfileSetup, setGoogleProfileSetup] = useState<{ 
        email: string; 
        googleName: string; 
        googleToken: string;
        selectedRole?: UserRole;
    } | null>(null);

    useEffect(() => {
        // Check for existing session
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        console.log('🔍 AuthContext init - checking stored session');
        
        if (storedToken && storedUser) {
            console.log('✓ Found stored token and user');
            try {
                const userData = JSON.parse(storedUser);
                // Normalize role to lowercase
                if (userData.role) {
                    userData.role = userData.role.toLowerCase();
                }
                setToken(storedToken);
                setUser(userData);
                console.log('✓ Restored user from localStorage:', userData);
            } catch (e) {
                console.error('❌ Failed to parse stored user');
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setToken(null);
                setUser(null);
            }
        } else {
            console.log('No stored session found');
        }
        
        setIsLoading(false);
        console.log('🔓 AuthContext initialization complete');
    }, []);

    const login = async (email: string, password: string, role?: string) => {
        try {
            console.log('🔐 Attempting login with email:', email, 'role:', role);
            const response = await authAPI.login({ email, password, role });
            const data = response.data;
            
            console.log('📦 Login response:', data);
            
            // Check if response contains an error
            if (data.error) {
                console.error('⚠️ Login error:', data.error);
                throw new Error(data.error);
            }
            
            const { token: newToken, user: newUser } = data;
            // Normalize role to lowercase
            if (newUser.role) {
                newUser.role = newUser.role.toLowerCase();
            }
            console.log('💾 Storing token and user...');
            localStorage.setItem('token', newToken);
            localStorage.setItem('user', JSON.stringify(newUser));
            console.log('🔄 Updating auth context state...');
            setToken(newToken);
            setUser(newUser);
            console.log('✓ Auth state updated');
            setNeedsProfileSetup(false);
            setGoogleProfileSetup(null);
        } catch (error: any) {
            // Extract error message from backend response
            console.error('❌ Login error:', error);
            
            // Check if it's an axios error with response data
            if (error.response && error.response.data && error.response.data.error) {
                // Backend sent a specific error message
                const errorMessage = error.response.data.error;
                console.error('⚠️ Backend error message:', errorMessage);
                throw new Error(errorMessage);
            } else if (error.message) {
                // Use the error message if available
                throw new Error(error.message);
            } else {
                // Fallback error message
                throw new Error('Login gagal. Silakan coba lagi.');
            }
        }
    };

    const googleLogin = async (credential: string, role?: UserRole): Promise<{ isNewUser: boolean }> => {
        try {
            // First step: verify token with Google
            console.log('📡 Sending Google token to backend with role:', role);
            const response = await authAPI.googleLogin(credential, role);
            const data = response.data;
            
            console.log('📦 Backend response:', data);
            
            // Check if response contains an error
            if (data.error) {
                console.error('⚠️ Backend returned error:', data.error);
                throw new Error(data.error);
            }
            
            if (data.is_new_user) {
                // New user - need profile setup
                console.log('👤 New user, setting up profile state');
                setNeedsProfileSetup(true);
                setGoogleProfileSetup({
                    email: data.email,
                    googleName: data.google_name || data.email.split('@')[0],
                    googleToken: data.token,
                    selectedRole: role // Store the role selected in Login page
                });
                return { isNewUser: true };
            } else {
                // Existing user - login directly
                console.log('✓ Existing user, setting auth state');
                const { token: newToken, user: newUser } = data;
                // Normalize role to lowercase
                if (newUser.role) {
                    newUser.role = newUser.role.toLowerCase();
                }
                localStorage.setItem('token', newToken);
                localStorage.setItem('user', JSON.stringify(newUser));
                console.log('💾 Stored token and user in localStorage');
                setToken(newToken);
                setUser(newUser);
                console.log('🔄 Updated auth context state');
                setNeedsProfileSetup(false);
                setGoogleProfileSetup(null);
                return { isNewUser: false };
            }
        } catch (error: any) {
            // Extract error message from backend response
            console.error('❌ googleLogin error:', error);
            
            // Check if it's an axios error with response data
            if (error.response && error.response.data && error.response.data.error) {
                // Backend sent a specific error message
                const errorMessage = error.response.data.error;
                console.error('⚠️ Backend error message:', errorMessage);
                throw new Error(errorMessage);
            } else if (error.message) {
                // Use the error message if available
                throw new Error(error.message);
            } else {
                // Fallback error message
                throw new Error('Login gagal. Silakan coba lagi.');
            }
        }
    };

    const completeGoogleProfile = async (name: string, role: UserRole) => {
        if (!googleProfileSetup) {
            throw new Error('No pending profile setup');
        }

        // Second step: complete profile and create user
        const response = await authAPI.googleLoginComplete({
            token: googleProfileSetup.googleToken,
            name,
            role,
        });

        const responseData = response.data;
        
        // Check if response contains an error
        if (responseData.error) {
            throw new Error(responseData.error);
        }

        const { token: newToken, user: newUser } = responseData;
        // Normalize role to lowercase
        if (newUser.role) {
            newUser.role = newUser.role.toLowerCase();
        }
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));
        setToken(newToken);
        setUser(newUser);
        setNeedsProfileSetup(false);
        setGoogleProfileSetup(null);
    };

    const register = async (data: RegisterData) => {
        const response = await authAPI.register({
            name: data.name,
            email: data.email,
            password: data.password,
            role: data.role,
        });
        const responseData = response.data;
        
        // Check if response contains an error
        if (responseData.error) {
            throw new Error(responseData.error);
        }
        
        const { token: newToken, user: newUser } = responseData;
        // Normalize role to lowercase
        if (newUser.role) {
            newUser.role = newUser.role.toLowerCase();
        }
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));
        setToken(newToken);
        setUser(newUser);
        setNeedsProfileSetup(false);
        setGoogleProfileSetup(null);
    };

    const logout = async () => {
        await authAPI.logout();
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        setNeedsProfileSetup(false);
        setGoogleProfileSetup(null);
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
                needsProfileSetup,
                googleProfileSetup,
                login,
                googleLogin,
                completeGoogleProfile,
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
