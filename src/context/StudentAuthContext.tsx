import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { getSupabase, getSupabaseConfigStatus, resetSupabaseClientInstance } from '../lib/supabase';
import { StudentProfile, SupabaseConfigStatus } from '../types/studentAuth';
import { ClassLevel } from '../types/curriculum';

interface StudentAuthContextType {
  student: StudentProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  session: any | null;
  configStatus: SupabaseConfigStatus;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; isAdminAttempt?: boolean }>;
  register: (
    name: string,
    email: string,
    password: string,
    classLevel: ClassLevel
  ) => Promise<{ success: boolean; error?: string; requiresEmailConfirmation?: boolean }>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  updateStudentProfile: (updates: { fullName?: string; classLevel?: ClassLevel }) => Promise<{ success: boolean; error?: string }>;
  reloadConfig: () => void;
}

const StudentAuthContext = createContext<StudentAuthContextType | undefined>(undefined);

export function StudentAuthProvider({ children }: { children: ReactNode }) {
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [configStatus, setConfigStatus] = useState<SupabaseConfigStatus>(getSupabaseConfigStatus());

  const reloadConfig = useCallback(() => {
    resetSupabaseClientInstance();
    setConfigStatus(getSupabaseConfigStatus());
  }, []);

  // Helper to sync user profile from Supabase Auth + profiles table
  const syncProfileFromAuthUser = useCallback(async (authUser: any) => {
    if (!authUser) {
      setStudent(null);
      return;
    }

    try {
      const supabase = getSupabase();
      // Try to fetch profile from 'profiles' table
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      const profile: StudentProfile = {
        id: authUser.id,
        email: authUser.email || '',
        fullName:
          profileData?.full_name ||
          authUser.user_metadata?.full_name ||
          authUser.email?.split('@')[0] ||
          'Student',
        classLevel: (profileData?.class_level || authUser.user_metadata?.class_level || 8) as ClassLevel,
        role: profileData?.role || authUser.user_metadata?.role || 'student',
        createdAt: profileData?.created_at || authUser.created_at || new Date().toISOString()
      };

      setStudent(profile);
    } catch (e) {
      console.error('Error fetching student profile from Supabase', e);
      // Fallback from authUser metadata
      setStudent({
        id: authUser.id,
        email: authUser.email || '',
        fullName: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Student',
        classLevel: (authUser.user_metadata?.class_level || 8) as ClassLevel,
        role: 'student',
        createdAt: new Date().toISOString()
      });
    }
  }, []);

  // Initialize session on mount & subscribe to auth changes
  useEffect(() => {
    const supabase = getSupabase();
    let mounted = true;

    async function initAuth() {
      try {
        const { data } = await supabase.auth.getSession();
        if (mounted) {
          if (data?.session) {
            setSession(data.session);
            await syncProfileFromAuthUser(data.session.user);
          } else {
            setSession(null);
            setStudent(null);
          }
        }
      } catch (err) {
        console.warn('Error loading Supabase auth session:', err);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    initAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event: string, newSession: any) => {
        if (!mounted) return;
        setSession(newSession);
        if (newSession?.user) {
          await syncProfileFromAuthUser(newSession.user);
        } else {
          setStudent(null);
        }
        setIsLoading(false);
      }
    );

    return () => {
      mounted = false;
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [syncProfileFromAuthUser]);

  // LOGIN
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const supabase = getSupabase();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });

      if (error) {
        const isAdm = (error as any).isAdminAttempt || email.toLowerCase().includes('admin');
        return {
          success: false,
          error: error.message || 'Login failed. Please verify credentials.',
          isAdminAttempt: isAdm
        };
      }

      if (data?.user) {
        // Enforce student role
        const role = data.user.user_metadata?.role || 'student';
        if (role === 'admin' || role === 'super_admin') {
          await supabase.auth.signOut();
          return {
            success: false,
            error: 'Administrator credentials detected. Please log in via the Administrator Portal at /admin/login.',
            isAdminAttempt: true
          };
        }

        setSession(data.session);
        await syncProfileFromAuthUser(data.user);
        return { success: true };
      }

      return { success: false, error: 'Authentication failed. Please check credentials.' };
    } catch (e: any) {
      return { success: false, error: e?.message || 'An unexpected error occurred during login.' };
    } finally {
      setIsLoading(false);
    }
  };

  // REGISTER
  const register = async (
    name: string,
    email: string,
    password: string,
    classLevel: ClassLevel
  ) => {
    try {
      setIsLoading(true);
      const supabase = getSupabase();
      const normalizedEmail = email.trim().toLowerCase();

      // Block registration with admin keywords
      if (normalizedEmail.includes('admin@') || normalizedEmail === 'admin@scimath.academy') {
        return {
          success: false,
          error: 'Administrator accounts cannot be registered through student portal.'
        };
      }

      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: {
            full_name: name.trim(),
            class_level: classLevel,
            role: 'student' // Strictly assign student role
          }
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // If user created, try to save profile into profiles table as well
      if (data?.user) {
        try {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            email: normalizedEmail,
            full_name: name.trim(),
            class_level: classLevel,
            role: 'student'
          });
        } catch (dbErr) {
          console.log('Profile upsert note:', dbErr);
        }

        if (data.session) {
          setSession(data.session);
          await syncProfileFromAuthUser(data.user);
          return { success: true, requiresEmailConfirmation: false };
        } else {
          // Supabase configured with email verification required
          return { success: true, requiresEmailConfirmation: true };
        }
      }

      return { success: false, error: 'Could not complete student registration.' };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Registration failed.' };
    } finally {
      setIsLoading(false);
    }
  };

  // LOGOUT
  const logout = async () => {
    try {
      setIsLoading(true);
      const supabase = getSupabase();
      await supabase.auth.signOut();
    } catch (e) {
      console.error('Logout error', e);
    } finally {
      setSession(null);
      setStudent(null);
      setIsLoading(false);
    }
  };

  // FORGOT PASSWORD
  const forgotPassword = async (email: string) => {
    try {
      const supabase = getSupabase();
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Could not send reset password email.' };
    }
  };

  // RESET PASSWORD
  const resetPassword = async (newPassword: string) => {
    try {
      const supabase = getSupabase();
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Could not update password.' };
    }
  };

  // UPDATE PROFILE
  const updateStudentProfile = async (updates: { fullName?: string; classLevel?: ClassLevel }) => {
    if (!student) return { success: false, error: 'No active student session' };

    try {
      const supabase = getSupabase();

      // Update auth user metadata
      await supabase.auth.updateUser({
        data: {
          full_name: updates.fullName || student.fullName,
          class_level: updates.classLevel || student.classLevel
        }
      });

      // Update profiles table
      await supabase
        .from('profiles')
        .update({
          full_name: updates.fullName || student.fullName,
          class_level: updates.classLevel || student.classLevel
        })
        .eq('id', student.id);

      setStudent((prev) =>
        prev
          ? {
              ...prev,
              fullName: updates.fullName || prev.fullName,
              classLevel: updates.classLevel || prev.classLevel
            }
          : null
      );

      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Failed to update profile.' };
    }
  };

  return (
    <StudentAuthContext.Provider
      value={{
        student,
        isAuthenticated: Boolean(student && session),
        isLoading,
        session,
        configStatus,
        login,
        register,
        logout,
        forgotPassword,
        resetPassword,
        updateStudentProfile,
        reloadConfig
      }}
    >
      {children}
    </StudentAuthContext.Provider>
  );
}

export function useStudentAuth() {
  const context = useContext(StudentAuthContext);
  if (!context) {
    throw new Error('useStudentAuth must be used within a StudentAuthProvider');
  }
  return context;
}
