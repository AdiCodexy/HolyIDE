import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if credentials are real (not placeholder values)
const isConfigured =
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith("http") &&
  supabaseAnonKey.length > 20;

// Only create a real client if properly configured
// Otherwise create a dummy that won't crash the app
export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const isSupabaseConfigured = isConfigured;

if (!isConfigured) {
  console.warn(
    "⚠️  Supabase not configured. " +
    "Add valid VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local"
  );
}
