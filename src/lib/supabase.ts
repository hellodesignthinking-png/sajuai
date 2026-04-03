import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Returns null if env vars are placeholders or missing (graceful fallback)
function isConfigured(): boolean {
  return (
    !!supabaseUrl &&
    !!supabaseAnonKey &&
    supabaseUrl !== 'https://your-project.supabase.co' &&
    supabaseAnonKey !== 'your-anon-key'
  );
}

export const supabase = isConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export { isConfigured };
