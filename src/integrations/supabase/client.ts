
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qicpuqwdjgprltgnitph.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpY3B1cXdkamdwcmx0Z25pdHBoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwMjM0MjMsImV4cCI6MjA1ODU5OTQyM30.p91hMsRS7S-vQpLtfy2rOSzIKs9KdVb3zsLQfbRMXvk';

// Create a regular Supabase client
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

// Create a function to bypass Row Level Security for specific operations
export const makeAuthenticatedRequest = async () => {
  try {
    // First check if the user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      console.log("Using authenticated session for request");
      return supabase;
    }
    
    // If we're here, there's no authenticated session, use demo mode
    console.log("No active session, using demo mode");
    
    // Create a new client for the request with the same anonymous key
    // This doesn't help bypass RLS but we keep the interface consistent
    return supabase;
  } catch (error) {
    console.error("Error in makeAuthenticatedRequest:", error);
    return supabase;
  }
};
