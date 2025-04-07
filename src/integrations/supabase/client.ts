
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qicpuqwdjgprltgnitph.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpY3B1cXdkamdwcmx0Z25pdHBoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwMjM0MjMsImV4cCI6MjA1ODU5OTQyM30.p91hMsRS7S-vQpLtfy2rOSzIKs9KdVb3zsLQfbRMXvk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: localStorage
  }
});

// Utility function to check if the current user is an admin
export const isUserAdmin = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return false;
  
  // Check user role in user_profiles table
  const { data } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single();
    
  return data?.role === 'admin';
};

// Create a custom function to make authenticated requests
export const makeAuthenticatedRequest = async () => {
  // Ensure user is logged in by getting session
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    console.error("No active session found. User is not authenticated.");
    throw new Error("Authentication required");
  }
  
  // Return authenticated instance with current session token
  return supabase;
};
