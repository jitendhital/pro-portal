import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// Support both variable names for compatibility
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Debug: Log environment variables (remove in production)
console.log('Supabase URL:', supabaseUrl ? '✓ Found' : '✗ Missing');
console.log('Supabase Key:', supabaseAnonKey ? '✓ Found' : '✗ Missing');

// Create a mock supabase client if environment variables are missing
// This allows the app to run without Supabase configured (for development)
let supabase;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Missing Supabase environment variables!');
  console.warn('Please check:');
  console.warn('1. .env file exists in the client folder');
  console.warn('2. Variables are named: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (or VITE_SUPABASE_PUBLISHABLE_KEY)');
  console.warn('3. No quotes around the values');
  console.warn('4. Dev server was restarted after adding variables');
  console.warn('⚠️ App will continue to run, but image uploads will not work.');
  
  // Create a mock client that will throw helpful errors if used
  supabase = {
    storage: {
      from: () => ({
        upload: async () => {
          throw new Error('Supabase is not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file');
        },
        getPublicUrl: () => ({ data: { publicUrl: '' } })
      })
    }
  };
} else {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export { supabase };

