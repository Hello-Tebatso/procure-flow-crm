
import React, { createContext, useContext, useState, useEffect } from "react";
import { User, UserRole } from "@/types";
import { mockUsers } from "@/lib/mock-data";
import { supabase } from "@/integrations/supabase/client";
import { logActivity, LogActions } from "@/services/LogService";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  loginWithMock: (role: UserRole) => void; // For development only
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for saved user on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("procure-flow-user");
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
    }
    setLoading(false);
  }, []);

  // Setup Supabase auth listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN" && session) {
          fetchUserProfile(session.user.id);
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          localStorage.removeItem("procure-flow-user");
        }
      }
    );

    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    setLoading(true);
    try {
      // For admin login only - in a full implementation, we'd have a profiles table
      // with user roles, but for this demo, we're using a simplified approach
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const userProfile: User = {
          id: user.id,
          name: user.user_metadata.name || user.email?.split('@')[0] || 'Admin User',
          email: user.email || '',
          role: 'admin', // Only admins use Supabase auth
          avatar: user.user_metadata.avatar_url
        };
        
        setUser(userProfile);
        localStorage.setItem("procure-flow-user", JSON.stringify(userProfile));
        
        // Log activity
        if (userProfile) {
          logActivity(
            userProfile,
            LogActions.LOGIN,
            "auth",
            userProfile.id
          );
        }
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      return !!data.user;
    } catch (error) {
      console.error("Login error:", error);
      setLoading(false);
      return false;
    }
  };

  const logout = async () => {
    // Log activity before logging out
    if (user) {
      await logActivity(
        user,
        LogActions.LOGOUT,
        "auth",
        user.id
      );
    }
    
    await supabase.auth.signOut();
    setUser(null);
    localStorage.removeItem("procure-flow-user");
  };

  // For development only - to easily switch between user roles
  const loginWithMock = (role: UserRole) => {
    const mockUser = mockUsers.find(u => u.role === role);
    if (mockUser) {
      setUser(mockUser);
      localStorage.setItem("procure-flow-user", JSON.stringify(mockUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, loginWithMock }}>
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
