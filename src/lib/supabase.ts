import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'placeholder-key';

export const isSupabaseConfigured = () => {
  return (
    import.meta.env.VITE_SUPABASE_URL &&
    (import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY) &&
    import.meta.env.VITE_SUPABASE_URL !== 'https://placeholder.supabase.co'
  );
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Offline Storage Helper Utilities
export const saveOfflineCache = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(`jagx_cache_${key}`, JSON.stringify(data));
  } catch (err) {
    console.warn('Failed to save to localStorage:', err);
  }
};

export const loadOfflineCache = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(`jagx_cache_${key}`);
    return item ? JSON.parse(item) : defaultValue;
  } catch (err) {
    console.warn('Failed to load from localStorage:', err);
    return defaultValue;
  }
};
