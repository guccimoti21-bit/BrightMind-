import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { StudentProfile, SupabaseConfigStatus } from '../types/studentAuth';
import { ClassLevel } from '../types/curriculum';

// Check environment variables or custom overrides in localStorage
const ENV_URL = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const ENV_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

const LOCAL_STORAGE_URL_KEY = 'scimath_custom_supabase_url';
const LOCAL_STORAGE_KEY_KEY = 'scimath_custom_supabase_key';

export function getStoredSupabaseConfig(): { url: string; anonKey: string } {
  const customUrl = typeof window !== 'undefined' ? localStorage.getItem(LOCAL_STORAGE_URL_KEY) || '' : '';
  const customKey = typeof window !== 'undefined' ? localStorage.getItem(LOCAL_STORAGE_KEY_KEY) || '' : '';
  return {
    url: customUrl || ENV_URL,
    anonKey: customKey || ENV_KEY
  };
}

export function saveCustomSupabaseConfig(url: string, anonKey: string): void {
  if (typeof window !== 'undefined') {
    if (url.trim()) {
      localStorage.setItem(LOCAL_STORAGE_URL_KEY, url.trim());
    } else {
      localStorage.removeItem(LOCAL_STORAGE_URL_KEY);
    }
    if (anonKey.trim()) {
      localStorage.setItem(LOCAL_STORAGE_KEY_KEY, anonKey.trim());
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY_KEY);
    }
  }
}

export function isSupabaseLiveConfigured(): boolean {
  const { url, anonKey } = getStoredSupabaseConfig();
  return Boolean(
    url &&
    anonKey &&
    !url.includes('your-project') &&
    url.startsWith('https://') &&
    anonKey.length > 20
  );
}

export function getSupabaseConfigStatus(): SupabaseConfigStatus {
  const { url, anonKey } = getStoredSupabaseConfig();
  const isConfigured = isSupabaseLiveConfigured();
  return {
    isConfigured,
    supabaseUrl: url || 'Not set (using simulated backend)',
    hasAnonKey: Boolean(anonKey),
    mode: isConfigured ? 'live' : 'simulated'
  };
}

// ==============================================================
// SIMULATED SUPABASE CLIENT (When live keys are not yet configured)
// Provides 100% functional auth and database queries locally
// ==============================================================

const SIMULATED_USERS_KEY = 'scimath_sim_supabase_users';
const SIMULATED_SESSION_KEY = 'scimath_sim_supabase_session';
const SIMULATED_PROGRESS_KEY = 'scimath_sim_supabase_progress';
const SIMULATED_STATS_KEY = 'scimath_sim_supabase_stats';

interface SimUser {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  classLevel: ClassLevel;
  role: 'student' | 'admin';
  emailConfirmed: boolean;
  createdAt: string;
}

function getSimUsers(): SimUser[] {
  try {
    const raw = localStorage.getItem(SIMULATED_USERS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed reading sim users', e);
  }
  // Default demo student
  const defaultUsers: SimUser[] = [
    {
      id: 'demo-student-id-001',
      email: 'student@scimath.academy',
      passwordHash: btoa('Password123!'),
      fullName: 'Aarav Sharma',
      classLevel: 8,
      role: 'student',
      emailConfirmed: true,
      createdAt: new Date().toISOString()
    }
  ];
  saveSimUsers(defaultUsers);
  return defaultUsers;
}

function saveSimUsers(users: SimUser[]) {
  try {
    localStorage.setItem(SIMULATED_USERS_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Failed saving sim users', e);
  }
}

class SimulatedSupabaseAuth {
  private listeners: ((event: string, session: any) => void)[] = [];

  constructor() {
    // Ensure default users are initialized
    getSimUsers();
  }

  onAuthStateChange(callback: (event: string, session: any) => void) {
    this.listeners.push(callback);
    const session = this.getCurrentSession();
    if (session) {
      setTimeout(() => callback('INITIAL_SESSION', session), 10);
    }
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            this.listeners = this.listeners.filter((l) => l !== callback);
          }
        }
      }
    };
  }

  private notify(event: string, session: any) {
    this.listeners.forEach((l) => l(event, session));
  }

  getCurrentSession() {
    try {
      const raw = localStorage.getItem(SIMULATED_SESSION_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      // ignore
    }
    return null;
  }

  async getSession() {
    return { data: { session: this.getCurrentSession() }, error: null };
  }

  async getUser() {
    const session = this.getCurrentSession();
    return { data: { user: session?.user || null }, error: null };
  }

  async signUp({ email, password, options }: { email: string; password: string; options?: any }) {
    await new Promise((r) => setTimeout(r, 400));
    const normalizedEmail = email.trim().toLowerCase();
    const users = getSimUsers();

    if (users.some((u) => u.email === normalizedEmail)) {
      return { data: { user: null, session: null }, error: { message: 'A student account with this email already exists.' } };
    }

    const fullName = options?.data?.full_name || email.split('@')[0];
    const classLevel = (options?.data?.class_level as ClassLevel) || 8;

    const newUser: SimUser = {
      id: `student-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      email: normalizedEmail,
      passwordHash: btoa(password),
      fullName,
      classLevel,
      role: 'student',
      emailConfirmed: true, // auto-confirmed in simulated mode for instant UX
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveSimUsers(users);

    const session = {
      access_token: `sim-token-${Date.now()}`,
      token_type: 'bearer',
      expires_in: 3600 * 24,
      refresh_token: `sim-refresh-${Date.now()}`,
      user: {
        id: newUser.id,
        email: newUser.email,
        user_metadata: {
          full_name: newUser.fullName,
          class_level: newUser.classLevel,
          role: 'student'
        }
      }
    };

    localStorage.setItem(SIMULATED_SESSION_KEY, JSON.stringify(session));
    this.notify('SIGNED_IN', session);

    return { data: { user: session.user, session }, error: null };
  }

  async signInWithPassword({ email, password }: { email: string; password: string }) {
    await new Promise((r) => setTimeout(r, 400));
    const normalizedEmail = email.trim().toLowerCase();

    // Check if the user is an admin
    if (normalizedEmail.includes('admin') || normalizedEmail === 'admin@scimath.academy') {
      return {
        data: { user: null, session: null },
        error: {
          message: 'This account has administrator privileges. Please log in via the Administrator Portal at /admin/login.',
          isAdminAttempt: true
        }
      };
    }

    const users = getSimUsers();
    const user = users.find((u) => u.email === normalizedEmail);

    if (!user) {
      return {
        data: { user: null, session: null },
        error: { message: 'Invalid login credentials. Please check your email or create a new student account.' }
      };
    }

    if (user.passwordHash !== btoa(password)) {
      return {
        data: { user: null, session: null },
        error: { message: 'Incorrect password. Please try again or use the reset password link.' }
      };
    }

    const session = {
      access_token: `sim-token-${Date.now()}`,
      token_type: 'bearer',
      expires_in: 3600 * 24,
      refresh_token: `sim-refresh-${Date.now()}`,
      user: {
        id: user.id,
        email: user.email,
        user_metadata: {
          full_name: user.fullName,
          class_level: user.classLevel,
          role: user.role
        }
      }
    };

    localStorage.setItem(SIMULATED_SESSION_KEY, JSON.stringify(session));
    this.notify('SIGNED_IN', session);

    return { data: { user: session.user, session }, error: null };
  }

  async signOut() {
    await new Promise((r) => setTimeout(r, 200));
    localStorage.removeItem(SIMULATED_SESSION_KEY);
    this.notify('SIGNED_OUT', null);
    return { error: null };
  }

  async resetPasswordForEmail(email: string) {
    await new Promise((r) => setTimeout(r, 500));
    const users = getSimUsers();
    const exists = users.some((u) => u.email === email.trim().toLowerCase());
    if (!exists) {
      return { data: null, error: { message: 'No registered student account found with this email address.' } };
    }
    return { data: {}, error: null };
  }

  async updateUser(attributes: { password?: string; data?: any }) {
    await new Promise((r) => setTimeout(r, 300));
    const session = this.getCurrentSession();
    if (!session?.user?.id) {
      return { data: null, error: { message: 'User not authenticated' } };
    }

    const users = getSimUsers();
    const user = users.find((u) => u.id === session.user.id);
    if (!user) {
      return { data: null, error: { message: 'User not found' } };
    }

    if (attributes.password) {
      user.passwordHash = btoa(attributes.password);
    }
    if (attributes.data?.full_name) {
      user.fullName = attributes.data.full_name;
      session.user.user_metadata.full_name = attributes.data.full_name;
    }
    if (attributes.data?.class_level) {
      user.classLevel = attributes.data.class_level;
      session.user.user_metadata.class_level = attributes.data.class_level;
    }

    saveSimUsers(users);
    localStorage.setItem(SIMULATED_SESSION_KEY, JSON.stringify(session));
    this.notify('USER_UPDATED', session);

    return { data: { user: session.user }, error: null };
  }
}

class SimulatedSupabaseQuery {
  private tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  select(columns: string = '*') {
    return {
      eq: (column: string, value: any) => ({
        maybeSingle: async () => {
          const data = this.getTableData().find((item: any) => item[column] === value);
          return { data: data || null, error: null };
        },
        single: async () => {
          const data = this.getTableData().find((item: any) => item[column] === value);
          if (!data) return { data: null, error: { message: 'Row not found' } };
          return { data, error: null };
        },
        then: (resolve: any) => {
          const data = this.getTableData().filter((item: any) => item[column] === value);
          resolve({ data, error: null });
        }
      }),
      then: (resolve: any) => {
        resolve({ data: this.getTableData(), error: null });
      }
    };
  }

  upsert(records: any | any[], options?: any) {
    return {
      select: () => ({
        then: (resolve: any) => {
          const result = this.doUpsert(records);
          resolve({ data: result, error: null });
        }
      }),
      then: (resolve: any) => {
        const result = this.doUpsert(records);
        resolve({ data: result, error: null });
      }
    };
  }

  insert(records: any | any[]) {
    return {
      select: () => ({
        then: (resolve: any) => {
          const result = this.doUpsert(records);
          resolve({ data: result, error: null });
        }
      }),
      then: (resolve: any) => {
        const result = this.doUpsert(records);
        resolve({ data: result, error: null });
      }
    };
  }

  update(updates: any) {
    return {
      eq: (column: string, value: any) => ({
        then: (resolve: any) => {
          const items = this.getTableData();
          const target = items.find((i: any) => i[column] === value);
          if (target) {
            Object.assign(target, updates, { updated_at: new Date().toISOString() });
            this.saveTableData(items);
          }
          resolve({ data: target || null, error: null });
        }
      })
    };
  }

  private getTableStorageKey(): string {
    switch (this.tableName) {
      case 'profiles':
        return SIMULATED_USERS_KEY;
      case 'student_progress':
        return SIMULATED_PROGRESS_KEY;
      case 'student_stats':
        return SIMULATED_STATS_KEY;
      default:
        return `scimath_sim_supabase_${this.tableName}`;
    }
  }

  private getTableData(): any[] {
    try {
      const raw = localStorage.getItem(this.getTableStorageKey());
      if (raw) return JSON.parse(raw);
    } catch (e) {
      // ignore
    }
    return [];
  }

  private saveTableData(data: any[]): void {
    try {
      localStorage.setItem(this.getTableStorageKey(), JSON.stringify(data));
    } catch (e) {
      console.error('Failed saving table data', e);
    }
  }

  private doUpsert(input: any | any[]): any {
    const records = Array.isArray(input) ? input : [input];
    const items = this.getTableData();

    records.forEach((record) => {
      let index = -1;
      if (this.tableName === 'student_progress') {
        index = items.findIndex((i: any) => i.user_id === record.user_id && i.sub_concept_id === record.sub_concept_id);
      } else if (record.id) {
        index = items.findIndex((i: any) => i.id === record.id);
      } else if (record.user_id) {
        index = items.findIndex((i: any) => i.user_id === record.user_id);
      }

      if (index >= 0) {
        items[index] = { ...items[index], ...record, updated_at: new Date().toISOString() };
      } else {
        items.push({
          id: record.id || `rec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          ...record,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
    });

    this.saveTableData(items);
    return Array.isArray(input) ? records : records[0];
  }
}

class SimulatedSupabaseClient {
  auth = new SimulatedSupabaseAuth();

  from(tableName: string) {
    return new SimulatedSupabaseQuery(tableName);
  }
}

// ==============================================================
// SUPABASE CLIENT EXPORT
// ==============================================================

let clientInstance: SupabaseClient | any = null;

export function getSupabase(): SupabaseClient | any {
  if (clientInstance) return clientInstance;

  const { url, anonKey } = getStoredSupabaseConfig();
  if (isSupabaseLiveConfigured()) {
    try {
      clientInstance = createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      });
      return clientInstance;
    } catch (e) {
      console.warn('Could not initialize live Supabase client, falling back to simulated mode:', e);
    }
  }

  // Fallback to simulated client
  clientInstance = new SimulatedSupabaseClient();
  return clientInstance;
}

export function resetSupabaseClientInstance(): void {
  clientInstance = null;
}
