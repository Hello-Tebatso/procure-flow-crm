
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
  loginAsBuyerOrClient: (email: string, role: UserRole) => void; // For buyer/client login
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for saved user on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("mgp-user");
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
    }
    setLoading(false);
  }, []);

  // Setup Supabase auth listener (for admin only)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN" && session) {
          fetchUserProfile(session.user.id);
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          localStorage.removeItem("mgp-user");
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
        localStorage.setItem("mgp-user", JSON.stringify(userProfile));
        
        // Log activity
        if (userProfile) {
          await logActivity(
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

  // Simplified login for buyers and clients without authentication
  const loginAsBuyerOrClient = (email: string, role: UserRole) => {
    if (role !== 'buyer' && role !== 'client') {
      return; // Only allow buyer and client roles
    }

    // For buyers, we need to check if they're in the allowed list (from mockUsers for demo)
    if (role === 'buyer') {
      const allowedBuyer = mockUsers.find(u => u.email === email && u.role === 'buyer');
      if (!allowedBuyer) {
        throw new Error("Buyer not in allowed list. Contact an admin to add you.");
      }
      
      setUser(allowedBuyer);
      localStorage.setItem("mgp-user", JSON.stringify(allowedBuyer));
      
      // Log activity
      logActivity(
        allowedBuyer,
        LogActions.LOGIN,
        "auth",
        allowedBuyer.id
      );
      
      return;
    }

    // For clients, create a new user if they don't exist
    const userExists = mockUsers.find(u => u.email === email && u.role === 'client');
    let userProfile: User;

    if (userExists) {
      userProfile = userExists;
    } else {
      // Create a new user with a proper UUID format (not a string like "user5")
      userProfile = {
        id: crypto.randomUUID(), // Generate a proper UUID
        name: email.split('@')[0],
        email: email,
        role: role,
        avatar: '/placeholder.svg'
      };
    }

    setUser(userProfile);
    localStorage.setItem("mgp-user", JSON.stringify(userProfile));

    // Log activity
    logActivity(
      userProfile,
      LogActions.LOGIN,
      "auth",
      userProfile.id
    );
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
    
    // If admin, sign out from Supabase
    if (user?.role === 'admin') {
      await supabase.auth.signOut();
    }
    
    setUser(null);
    localStorage.removeItem("mgp-user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, loginAsBuyerOrClient }}>
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
