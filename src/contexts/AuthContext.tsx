import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, RoleId } from '../types';
import { DEMO_USERS } from '../constants/roles';
import { DataService } from '../services/dataService';

interface RegisterData {
  nama: string;
  nip: string;
  email: string;
  unit_id: string;
  unit_nama: string;
  jabatan: string;
  role_id: RoleId;
  atasan_id?: string;
  atasan_nama?: string;
}

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (nipOrEmail: string, password?: string) => { success: boolean; message?: string };
  register: (userData: RegisterData) => { success: boolean; message?: string };
  loginAsUser: (userId: string) => void;
  switchRole: (roleId: RoleId) => void;
  logout: () => void;
  updateCurrentUser: (user: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dataService = DataService.getInstance();

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    // Clear legacy active user storage so app always opens at login page
    localStorage.removeItem('bskji_active_user');
    return null;
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('bskji_active_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('bskji_active_user');
    }
  }, [currentUser]);

  const login = (nipOrEmail: string, password?: string): { success: boolean; message?: string } => {
    const cleanInput = nipOrEmail.trim().toLowerCase();
    const allUsers = dataService.getUsers();
    
    // Find user by NIP or Email
    const targetUser = allUsers.find(
      (u) => u.nip.toLowerCase() === cleanInput || u.email.toLowerCase() === cleanInput
    );

    if (!targetUser) {
      return {
        success: false,
        message: 'NIP atau Email tidak terdaftar dalam sistem BSKJI.',
      };
    }

    if (targetUser.status === 'Nonaktif') {
      return {
        success: false,
        message: 'Akun Anda sedang dalam status Nonaktif. Silakan hubungi Administrator.',
      };
    }

    // Default password check if provided
    if (password && password.length > 0 && password !== 'password' && password !== '123456' && password !== targetUser.nip) {
      return {
        success: false,
        message: 'Password yang Anda masukkan salah.',
      };
    }

    setCurrentUser(targetUser);
    return { success: true };
  };

  const register = (userData: RegisterData): { success: boolean; message?: string } => {
    const res = dataService.registerUser(userData);
    if (res.success && res.user) {
      setCurrentUser(res.user);
      return { success: true };
    }
    return { success: false, message: res.message || 'Gagal mendaftarkan akun.' };
  };

  const loginAsUser = (userId: string) => {
    const allUsers = dataService.getUsers();
    const targetUser = allUsers.find((u) => u.id === userId) || DEMO_USERS[0];
    setCurrentUser(targetUser);
  };

  const switchRole = (roleId: RoleId) => {
    const allUsers = dataService.getUsers();
    const targetUser = allUsers.find((u) => u.role_id === roleId) || DEMO_USERS[0];
    setCurrentUser(targetUser);
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('bskji_active_user');
  };

  const updateCurrentUser = (partialUser: Partial<User>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...partialUser };
    setCurrentUser(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        login,
        register,
        loginAsUser,
        switchRole,
        logout,
        updateCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

