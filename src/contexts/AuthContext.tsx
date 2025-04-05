
import React, { createContext, useContext, useState, useEffect } from "react";
import { User, UserRole } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { logActivity, LogActions } from "@/services/LogService";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  loginAsBuyerOrClient: (email: string, role: UserRole) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock data for bypassing Supabase table issues during development
const MOCK_ADMIN_USER: User = {
  id: '17c41064-d414-45cc-afed-33ec430d9485',
  name: 'Admin User',
  email: 'admin@example.com',
  role: 'admin',
  avatar: '/placeholder.svg'
};

const MOCK_BUYERS = [
  {
    id: 'e8fd159b-57c4-4d36-9bd7-a59ca13057ef',
    name: 'Gabriel Zau',
    email: 'gabriel@example.com',
    role: 'buyer' as UserRole,
    avatar: '/placeholder.svg'
  },
  {
    id: '1d23342a-82a3-4ac8-a73f-4c800d22b2ac',
    name: 'Bernado Buela',
    email: 'bernado@example.com',
    role: 'buyer' as UserRole,
    avatar: '/placeholder.svg'
  },
  {
    id: 'c4e125c3-4964-4a8b-b903-18f764b22rte',
    name: 'Magreth Smith',
    email: 'magreth@example.com',
    role: 'buyer' as UserRole,
    avatar: '/placeholder.svg'
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Check for saved user on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("mgp-user");
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
      } catch (e) {
        console.error("Error parsing saved user:", e);
        localStorage.removeItem("mgp-user");
      }
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
        // Use admin mock data for now to handle missing tables
        const userProfile = MOCK_ADMIN_USER;
        setUser(userProfile);
        localStorage.setItem("mgp-user", JSON.stringify(userProfile));
        
        try {
          // Try to log activity, but don't block on failure
          await logActivity(
            userProfile.id,
            userProfile.email,
            userProfile.role,
            LogActions.LOGIN,
            "auth",
            userProfile.id
          );
        } catch (error) {
          console.warn("Could not log activity, but continuing login:", error);
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
      // Mock admin login to bypass Supabase auth during development
      if (email === 'admin@example.com') {
        setUser(MOCK_ADMIN_USER);
        localStorage.setItem("mgp-user", JSON.stringify(MOCK_ADMIN_USER));
        
        try {
          await logActivity(
            MOCK_ADMIN_USER.id,
            MOCK_ADMIN_USER.email,
            MOCK_ADMIN_USER.role,
            LogActions.LOGIN,
            "auth",
            MOCK_ADMIN_USER.id
          );
        } catch (error) {
          console.warn("Could not log activity, but continuing login:", error);
        }
        
        setLoading(false);
        return true;
      }
      
      // Attempt actual Supabase auth if not using mock
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

  // Login for buyers and clients without authentication
  const loginAsBuyerOrClient = async (email: string, role: UserRole): Promise<boolean> => {
    if (role !== 'buyer' && role !== 'client') {
      toast({
        title: "Invalid Role",
        description: "Only buyers and clients can use this login method",
        variant: "destructive"
      });
      return false;
    }

    setLoading(true);
    
    try {
      if (role === 'buyer') {
        // Use mock buyer data during development
        const mockBuyer = MOCK_BUYERS.find(b => b.email === email);
        
        if (!mockBuyer) {
          toast({
            title: "Access Denied",
            description: "Buyer not in allowed list. Contact an admin to add you.",
            variant: "destructive"
          });
          setLoading(false);
          return false;
        }
        
        // Set user and save to localStorage
        setUser(mockBuyer);
        localStorage.setItem("mgp-user", JSON.stringify(mockBuyer));
        
        try {
          // Try to log activity
          await logActivity(
            mockBuyer.id,
            mockBuyer.email,
            mockBuyer.role,
            LogActions.LOGIN,
            "auth",
            mockBuyer.id
          );
        } catch (error) {
          console.warn("Could not log activity, but continuing login:", error);
        }
        
        setLoading(false);
        return true;
      }
      
      // Handle client login
      if (role === 'client') {
        // Use mock client or create new one
        const clientUser: User = {
          id: '754e86c9-afed-45e6-bcae-f2799beb9060',
          name: email.split('@')[0],
          email: email,
          role: role,
          avatar: '/placeholder.svg'
        };
        
        setUser(clientUser);
        localStorage.setItem("mgp-user", JSON.stringify(clientUser));
        
        try {
          // Try to log activity
          await logActivity(
            clientUser.id,
            clientUser.email,
            clientUser.role,
            LogActions.LOGIN,
            "auth",
            clientUser.id
          );
        } catch (error) {
          console.warn("Could not log activity, but continuing login:", error);
        }
        
        setLoading(false);
        return true;
      }
      
      // If we get here, login failed
      toast({
        title: "Login Failed",
        description: "Invalid credentials or user not found",
        variant: "destructive"
      });
      return false;
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login Failed",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    // Log activity before logging out
    if (user) {
      try {
        await logActivity(
          user.id,
          user.email,
          user.role,
          LogActions.LOGOUT,
          "auth",
          user.id
        );
      } catch (error) {
        console.warn("Could not log logout activity, but continuing logout:", error);
      }
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
