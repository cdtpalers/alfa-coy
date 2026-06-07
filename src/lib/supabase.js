import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase credentials missing! Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env.local file.");
}

// Create the client (will just be a dummy if credentials are empty to prevent immediate crashes, but will fail gracefully on requests)
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : {
      from: () => ({
        select: () => ({ order: () => Promise.resolve({ data: null, error: new Error('Missing Supabase credentials') }) }),
        insert: () => ({ select: () => Promise.resolve({ data: null, error: new Error('Missing Supabase credentials') }) })
      })
    };
