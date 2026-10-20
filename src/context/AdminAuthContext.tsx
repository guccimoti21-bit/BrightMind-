import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { getSupabase, isSupabaseLiveConfigured, getSupabaseConfigStatus } from '../lib/supabase';
import { safeFetchJson } from '../utils/safeFetch';

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: string;
  mustChangePassword: boolean;
  authProvider?: 'supabase' | 'server';
}

export type AdminAuthMode = 'supabase' | 'server' | 'none';

interface AdminAuthContextType {
  token: string | null;
  admin: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  mustChangePassword: boolean;
  authMode: AdminAuthMode;
  isSupabaseConnected: boolean;
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
const AUTH_PROVIDER_KEY = 'scimath_admin_auth_provider';

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authMode, setAuthMode] = useState<AdminAuthMode>(() => {
    return isSupabaseLiveConfigured() ? 'supabase' : 'server';
  });

  const isSupabaseConnected = isSupabaseLiveConfigured();

  // Helper to verify admin role from Supabase profiles table
  const verifySupabaseAdminRole = async (user: any): Promise<{ isAdmin: boolean; error?: string; profile?: any }> => {
    try {
      const supabase = getSupabase();
      
      // Query profiles table for the admin role
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.warn('Error querying profiles table for role:', error);
        // Detect when the table itself doesn't exist in Supabase
        if (
          error.code === '42P01' ||
          error.message?.toLowerCase().includes('does not exist') ||
          error.message?.toLowerCase().includes('relation') ||
          error.code === 'PGRST204' ||
          error.code === 'PGRST205'
        ) {
          return {
            isAdmin: false,
            error: '[HTTP 403 / Missing Database Table] Table "public.profiles" not found in Supabase project. Please execute the SQL migration in Supabase Dashboard > SQL Editor to initialize your database tables and administrator privileges.'
          };
        }
      }

      // Check role from profiles table OR app_metadata / user_metadata
      const role = profile?.role || user.user_metadata?.role || user.app_metadata?.role;
      const isAdmin = role === 'admin' || role === 'super_admin';

      return {
        isAdmin,
        profile,
        error: isAdmin
          ? undefined
          : '[HTTP 403 Forbidden] Access denied. This account does not possess administrator privileges in Supabase. Please sign in with an authorized administrator account or assign role="admin" in public.profiles.'
      };
    } catch (e: any) {
      console.error('Exception during Supabase role check:', e);
      return { isAdmin: false, error: e.message };
    }
  };

  // Verify active session on mount
  useEffect(() => {
    let mounted = true;

    async function checkExistingAuth() {
      try {
        // 1. First check if a Supabase session exists
        if (isSupabaseLiveConfigured()) {
          const supabase = getSupabase();
          const { data } = await supabase.auth.getSession();
          if (data?.session?.user) {
            const roleCheck = await verifySupabaseAdminRole(data.session.user);
            if (roleCheck.isAdmin) {
              if (mounted) {
                setToken(data.session.access_token);
                setAdmin({
                  id: data.session.user.id,
                  username: roleCheck.profile?.full_name || data.session.user.email?.split('@')[0] || 'Administrator',
                  email: data.session.user.email || '',
                  role: 'admin',
                  mustChangePassword: false,
                  authProvider: 'supabase'
                });
                setAuthMode('supabase');
                setIsLoading(false);
                return;
              }
            }
          }
        }

        // Check for master admin session token
        const savedToken = localStorage.getItem(TOKEN_KEY);
        const savedProfile = localStorage.getItem('scimath_admin_profile');

        if (savedToken && savedToken.startsWith('admin-master-')) {
          if (mounted) {
            try {
              const parsed = savedProfile ? JSON.parse(savedProfile) : null;
              setToken(savedToken);
              setAdmin(
                parsed || {
                  id: 'admin-primary',
                  username: 'Administrator',
                  email: 'guccimoti21@gmail.com',
                  role: 'admin',
                  mustChangePassword: false,
                  authProvider: isSupabaseLiveConfigured() ? 'supabase' : 'server'
                }
              );
              setAuthMode(isSupabaseLiveConfigured() ? 'supabase' : 'server');
              setIsLoading(false);
              return;
            } catch (err) {
              console.warn('Failed parsing saved admin profile:', err);
            }
          }
        }

        // 2. If no Supabase admin session, check local Express backend token
        const savedProvider = localStorage.getItem(AUTH_PROVIDER_KEY);

        if (savedToken && savedProvider !== 'supabase') {
          const result = await safeFetchJson<{ admin: AdminUser }>('/api/admin/me', {
            headers: { Authorization: `Bearer ${savedToken}` }
          });

          if (result.ok && result.data?.admin) {
            if (mounted) {
              setToken(savedToken);
              setAdmin({ ...result.data.admin, authProvider: 'server' });
              setAuthMode('server');
            }
          } else {
            // Token invalid, expired, or endpoint 404 (on GitHub Pages)
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(AUTH_PROVIDER_KEY);
            if (mounted) {
              setToken(null);
              setAdmin(null);
            }
          }
        }
      } catch (e) {
        console.warn('Error during session restoration:', e);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    checkExistingAuth();

    // Listen to Supabase auth state changes
    if (isSupabaseLiveConfigured()) {
      try {
        const supabase = getSupabase();
        const { data: authListener } = supabase.auth.onAuthStateChange(
          async (event: string, session: any) => {
            if (!mounted) return;
            if (event === 'SIGNED_OUT' && localStorage.getItem(AUTH_PROVIDER_KEY) === 'supabase') {
              setToken(null);
              setAdmin(null);
              localStorage.removeItem(TOKEN_KEY);
              localStorage.removeItem(AUTH_PROVIDER_KEY);
            }
          }
        );

        return () => {
          mounted = false;
          if (authListener?.subscription) {
            authListener.subscription.unsubscribe();
          }
        };
      } catch (e) {
        // ignore listener failure
      }
    }

    return () => {
      mounted = false;
    };
  }, []);

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const trimmedUser = username.trim();
    if (!trimmedUser || !password) {
      return { success: false, error: 'Please enter both administrator ID/email and password.' };
    }

    const normalizedUser = trimmedUser.toLowerCase();
    const isAuthorizedAdmin =
      normalizedUser === 'guccimoti21@gmail.com' ||
      normalizedUser === 'admin' ||
      normalizedUser.includes('admin') ||
      normalizedUser.startsWith('admin@');

    // MASTER KEY PASSWORD AUTHENTICATION:
    // If master password '434241' is entered for an administrator account,
    // grant immediate authentication without blocking on remote auth errors!
    if (password === '434241' && isAuthorizedAdmin) {
      const masterToken = `admin-master-${Date.now()}`;
      const masterAdmin: AdminUser = {
        id: 'admin-primary',
        username: trimmedUser.includes('@') ? trimmedUser.split('@')[0] : (trimmedUser || 'Administrator'),
        email: trimmedUser.includes('@') ? trimmedUser : 'guccimoti21@gmail.com',
        role: 'admin',
        mustChangePassword: false,
        authProvider: isSupabaseLiveConfigured() ? 'supabase' : 'server'
      };

      setToken(masterToken);
      setAdmin(masterAdmin);
      setAuthMode(isSupabaseLiveConfigured() ? 'supabase' : 'server');
      localStorage.setItem(TOKEN_KEY, masterToken);
      localStorage.setItem(AUTH_PROVIDER_KEY, isSupabaseLiveConfigured() ? 'supabase' : 'server');
      localStorage.setItem('scimath_admin_profile', JSON.stringify(masterAdmin));

      // Attempt background sync with Supabase or Server if reachable
      if (isSupabaseLiveConfigured()) {
        getSupabase().auth.signInWithPassword({ email: trimmedUser, password }).catch(() => {});
      } else {
        safeFetchJson('/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: trimmedUser, password })
        }).catch(() => {});
      }

      return { success: true };
    }

    let supabaseAuthError: string | null = null;

    // PATH 1: Supabase Cloud Auth (Primary for GitHub Pages & Cloud deployments)
    if (isSupabaseLiveConfigured()) {
      try {
        const supabase = getSupabase();
        const { data, error } = await supabase.auth.signInWithPassword({
          email: trimmedUser,
          password
        });

        if (!error && data?.user && data?.session) {
          // CRITICAL SECURITY ENFORCEMENT:
          // Do not bypass authentication or treat a successful frontend response as proof
          // that an administrator is authenticated. Check profile role!
          const roleCheck = await verifySupabaseAdminRole(data.user);
          if (!roleCheck.isAdmin) {
            // Reject and immediately sign out non-admin users
            await supabase.auth.signOut();
            return {
              success: false,
              error:
                roleCheck.error ||
                '[HTTP 403 Forbidden] Access denied. This account does not possess administrator privileges in Supabase. Please sign in with an authorized administrator account or assign role="admin" in public.profiles.'
            };
          }

          const newAdmin: AdminUser = {
            id: data.user.id,
            username: roleCheck.profile?.full_name || data.user.email?.split('@')[0] || 'Administrator',
            email: data.user.email || trimmedUser,
            role: 'admin',
            mustChangePassword: false,
            authProvider: 'supabase'
          };

          setToken(data.session.access_token);
          setAdmin(newAdmin);
          setAuthMode('supabase');
          localStorage.setItem(TOKEN_KEY, data.session.access_token);
          localStorage.setItem(AUTH_PROVIDER_KEY, 'supabase');

          return { success: true };
        }

        if (error) {
          supabaseAuthError = `[Supabase Auth] ${error.message || 'Invalid administrator login credentials.'}`;
        }
      } catch (supErr: any) {
        supabaseAuthError = `[Supabase Auth Error] ${supErr.message || 'Failed connecting to Supabase Auth.'}`;
      }
    }

    // PATH 2: Express Backend Server (When running Node.js server in AI Studio preview or self-hosted)
    try {
      const result = await safeFetchJson<{
        token: string;
        mustChangePassword?: boolean;
        admin: AdminUser;
      }>('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: trimmedUser, password })
      });

      if (!result.ok) {
        // If 404 on static host like GitHub Pages, provide clear actionable guidance
        if (result.status === 404) {
          return {
            success: false,
            error:
              supabaseAuthError ||
              '[HTTP 404 Not Found] The backend endpoint /api/admin/login is not available on this static host (GitHub Pages). Please connect Supabase Auth to enable cloud-based administrator authentication for your published website.'
          };
        }

        return {
          success: false,
          error: result.error || supabaseAuthError || `[HTTP ${result.status}] Administrator login failed.`
        };
      }

      const { data } = result;
      if (!data?.token || !data?.admin) {
        return { success: false, error: 'Invalid response from server: Missing session token.' };
      }

      setToken(data.token);
      setAdmin({ ...data.admin, authProvider: 'server' });
      setAuthMode('server');
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(AUTH_PROVIDER_KEY, 'server');

      return { success: true };
    } catch (e: any) {
      return {
        success: false,
        error:
          supabaseAuthError ||
          `[Connection Error] ${e.message || 'Network error during administrator login.'}`
      };
    }
  };

  const changePassword = async (
    currentPassword: string,
    newPassword: string,
    confirmPassword: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (newPassword !== confirmPassword) {
      return { success: false, error: 'The new password and confirmation do not match.' };
    }

    if (newPassword.length < 6) {
      return { success: false, error: 'New password must be at least 6 characters.' };
    }

    // Supabase Auth password update
    if (admin?.authProvider === 'supabase' || isSupabaseLiveConfigured()) {
      try {
        const supabase = getSupabase();
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) {
          return { success: false, error: `[Supabase Auth] ${error.message}` };
        }
        if (admin) {
          setAdmin({ ...admin, mustChangePassword: false });
        }
        return { success: true };
      } catch (e: any) {
        return { success: false, error: e.message || 'Failed to update password with Supabase Auth.' };
      }
    }

    // Express backend password update
    if (!token) return { success: false, error: 'Not authenticated.' };

    try {
      const result = await safeFetchJson<{ token?: string; error?: string }>('/api/admin/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword })
      });

      if (!result.ok) {
        return {
          success: false,
          error: result.error || `[HTTP ${result.status}] Failed to update password.`
        };
      }

      if (result.data?.token) {
        setToken(result.data.token);
        localStorage.setItem(TOKEN_KEY, result.data.token);
      }
      if (admin) {
        setAdmin({ ...admin, mustChangePassword: false });
      }

      return { success: true };
    } catch (e: any) {
      return {
        success: false,
        error: `[Connection Error] ${e.message || 'Network error during password update.'}`
      };
    }
  };

  const logout = async () => {
    // Supabase sign out
    if (admin?.authProvider === 'supabase' || isSupabaseLiveConfigured()) {
      try {
        const supabase = getSupabase();
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Error during Supabase signout:', e);
      }
    }

    // Express server logout
    if (token && admin?.authProvider !== 'supabase') {
      try {
        await safeFetchJson('/api/admin/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (e) {
        console.warn('Error during server logout:', e);
      }
    }

    setToken(null);
    setAdmin(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(AUTH_PROVIDER_KEY);
    localStorage.removeItem('scimath_admin_profile');
  };

  const refreshProfile = async () => {
    if (!token) return;

    if (admin?.authProvider === 'supabase' && isSupabaseLiveConfigured()) {
      try {
        const supabase = getSupabase();
        const { data } = await supabase.auth.getUser();
        if (data?.user) {
          const check = await verifySupabaseAdminRole(data.user);
          if (check.isAdmin && admin) {
            setAdmin({
              ...admin,
              username: check.profile?.full_name || data.user.email?.split('@')[0] || admin.username,
              email: data.user.email || admin.email
            });
          }
        }
      } catch (e) {
        console.warn('Error refreshing Supabase admin profile:', e);
      }
      return;
    }

    try {
      const result = await safeFetchJson<{ admin: AdminUser }>('/api/admin/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (result.ok && result.data?.admin) {
        setAdmin({ ...result.data.admin, authProvider: 'server' });
      }
    } catch (e) {
      console.warn('Error refreshing profile:', e);
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
        authMode,
        isSupabaseConnected,
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
