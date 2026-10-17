import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: string;
  mustChangePassword: boolean;
}

interface AdminAuthContextType {
  token: string | null;
  admin: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  mustChangePassword: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  changePassword: (
    currentPass: string,
    newPass: string,
    confirmPass: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const TOKEN_KEY = 'scimath_admin_token';

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verify token on mount
  useEffect(() => {
    async function verify() {
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await fetch('/api/admin/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setAdmin(data.admin);
        } else {
          // Token invalid or expired
          localStorage.removeItem(TOKEN_KEY);
          setToken(null);
          setAdmin(null);
        }
      } catch (e) {
        console.error('Error verifying admin token:', e);
      } finally {
        setIsLoading(false);
      }
    }
    verify();
  }, [token]);

  const login = async (username: string, password: string) => {
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Login failed.' };
      }

      setToken(data.token);
      setAdmin(data.admin);
      localStorage.setItem(TOKEN_KEY, data.token);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Network error during login.' };
    }
  };

  const changePassword = async (
    currentPassword: string,
    newPassword: string,
    confirmPassword: string
  ) => {
    if (!token) return { success: false, error: 'Not authenticated.' };

    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword })
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to update password.' };
      }

      if (data.token) {
        setToken(data.token);
        localStorage.setItem(TOKEN_KEY, data.token);
      }
      if (admin) {
        setAdmin({ ...admin, mustChangePassword: false });
      }

      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Network error during password update.' };
    }
  };

  const logout = async () => {
    if (token) {
      try {
        await fetch('/api/admin/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (e) {
        console.error('Error during logout:', e);
      }
    }
    setToken(null);
    setAdmin(null);
    localStorage.removeItem(TOKEN_KEY);
  };

  const refreshProfile = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAdmin(data.admin);
      }
    } catch (e) {
      console.error('Error refreshing profile:', e);
    }
  };

  return (
    <AdminAuthContext.Provider
      value={{
        token,
        admin,
        isAuthenticated: Boolean(token && admin),
        isLoading,
        mustChangePassword: Boolean(admin?.mustChangePassword),
        login,
        changePassword,
        logout,
        refreshProfile
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
}
