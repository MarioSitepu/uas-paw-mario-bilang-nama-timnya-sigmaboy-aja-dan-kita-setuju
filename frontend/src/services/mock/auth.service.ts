import type { User, UserRole as UserRoleType } from '../../types';
import { UserRole } from '../../types';

// Mock users storage
const MOCK_USERS_KEY = 'mock_users';
const MOCK_CURRENT_USER_KEY = 'mock_current_user';
const MOCK_TOKEN_KEY = 'mock_token';

// Initialize with default users
const initializeMockUsers = (): User[] => {
  const stored = localStorage.getItem(MOCK_USERS_KEY);
  if (stored) {
    return JSON.parse(stored);
  }

  const defaultUsers: User[] = [
    {
      id: 1,
      name: 'Dr. Sarah Johnson',
      email: 'doctor@clinic.com',
      role: UserRole.DOCTOR,
      photoUrl: 'https://i.pravatar.cc/150?img=47',
    },
    {
      id: 2,
      name: 'John Patient',
      email: 'patient@clinic.com',
      role: UserRole.PATIENT,
      photoUrl: 'https://i.pravatar.cc/150?img=12',
    },
  ];

  localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(defaultUsers));
  return defaultUsers;
};

export const authService = {
  async register(data: {
    name: string;
    email: string;
    password: string;
    role: UserRoleType;
  }): Promise<{ user: User; token: string }> {
    const users = initializeMockUsers();

    // Check if email exists
    if (users.some((u) => u.email === data.email)) {
      throw new Error('Email already registered');
    }

    const newUser: User = {
      id: users.length + 1,
      name: data.name,
      email: data.email,
      role: data.role,
      photoUrl: `https://i.pravatar.cc/150?img=${users.length + 10}`,
    };

    users.push(newUser);
    localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));

    const token = `mock_token_${Date.now()}`;
    localStorage.setItem(MOCK_TOKEN_KEY, token);
    localStorage.setItem(MOCK_CURRENT_USER_KEY, JSON.stringify(newUser));

    return { user: newUser, token };
  },

  async login(email: string, _password: string): Promise<{ user: User; token: string }> {
    void _password;
    const users = initializeMockUsers();
    const user = users.find((u) => u.email === email);

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // In real app, verify password here
    // For mock, accept any password

    const token = `mock_token_${Date.now()}`;
    localStorage.setItem(MOCK_TOKEN_KEY, token);
    localStorage.setItem(MOCK_CURRENT_USER_KEY, JSON.stringify(user));

    return { user, token };
  },

  async getMe(): Promise<User | null> {
    const stored = localStorage.getItem(MOCK_CURRENT_USER_KEY);
    if (!stored) return null;
    return JSON.parse(stored);
  },

  async logout(): Promise<void> {
    localStorage.removeItem(MOCK_TOKEN_KEY);
    localStorage.removeItem(MOCK_CURRENT_USER_KEY);
  },

  getToken(): string | null {
    return localStorage.getItem(MOCK_TOKEN_KEY);
  },
};

