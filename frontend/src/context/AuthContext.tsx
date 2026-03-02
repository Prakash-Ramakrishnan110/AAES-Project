import { createContext, useState, useEffect, type ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';

interface User {
    id: string;
    _id: string;
    username: string;
    fullName?: string;
    email: string;
    role: 'admin' | 'hod' | 'staff' | 'student' | 'principal';
    department?: string;
    semester?: string;
    academicYear?: string;
    phone?: string;
    bloodGroup?: string;
    schooling?: string;
    currentCgpa?: string;
    historyOfArrears?: string;
    profileImage?: string;
    isAdvisor?: boolean;
    advisorYear?: string;
    advisorDepartment?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string, userData: User) => void;
    logout: () => void;
    updateUser: (updates: Partial<User>) => void;
    isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
            const decodedToken: any = jwtDecode(storedToken);
            if (decodedToken.exp * 1000 < Date.now()) {
                logout();
            } else {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
            }
        }
    }, []);

    const login = (newToken: string, userData: User) => {
        setToken(newToken);
        setUser(userData);
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    };

    const updateUser = (updates: Partial<User>) => {
        setUser(prev => {
            if (!prev) return prev;
            const updated = { ...prev, ...updates };
            localStorage.setItem('user', JSON.stringify(updated));
            return updated;
        });
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, updateUser, isAuthenticated: !!token }}>
            {children}
        </AuthContext.Provider>
    );
};
