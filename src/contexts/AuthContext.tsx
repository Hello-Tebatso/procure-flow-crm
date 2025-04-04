
import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "@/types";
import { mockUsers } from "@/lib/mock-data";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Check for saved user on mount and set up auth state listener
  useEffect(() => {
    // First, set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          // For demo purposes, map Supabase user to our custom User type using mock data
          // In a real app, you would fetch this from your profiles table
          const adminUser = mockUsers.find(u => u.role === "admin");
          if (adminUser) {
            setUser(adminUser);
            localStorage.setItem("procure-flow-user", JSON.stringify(adminUser));
          }
        } else {
          setUser(null);
          localStorage.removeItem("procure-flow-user");
        }
        setLoading(false);
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        // For demo purposes, map Supabase user to our custom User type
        const adminUser = mockUsers.find(u => u.role === "admin");
        if (adminUser) {
          setUser(adminUser);
          localStorage.setItem("procure-flow-user", JSON.stringify(adminUser));
        }
      }
      setLoading(false);
    });

    // Check for saved user in localStorage (fallback for demo)
    const savedUser = localStorage.getItem("procure-flow-user");
    if (savedUser && !user) {
      setUser(JSON.parse(savedUser));
    }

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    
    try {
      // For admin users only, use Supabase auth
      if (email.toLowerCase() === "admin@example.com") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (error) {
          console.error("Auth error:", error);
          toast({
            title: "Authentication Error",
            description: error.message,
            variant: "destructive"
          });
          setLoading(false);
          return false;
        }
        
        // Auth state change listener will handle setting the user
        return true;
      } else {
        // For other mock users (buyers/clients), use mock data
        const foundUser = mockUsers.find(user => user.email.toLowerCase() === email.toLowerCase());
        
        if (foundUser) {
          setUser(foundUser);
          localStorage.setItem("procure-flow-user", JSON.stringify(foundUser));
          setLoading(false);
          return true;
        } else {
          toast({
            title: "Authentication Error",
            description: "Invalid credentials",
            variant: "destructive"
          });
          setLoading(false);
          return false;
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
      setLoading(false);
      return false;
    }
  };

  const logout = async () => {
    // For all users, clear local state
    setUser(null);
    localStorage.removeItem("procure-flow-user");
    
    // For Supabase authenticated users, sign out properly
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  return context;
};
