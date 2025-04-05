
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

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
        // Check if this user exists in our user_profiles table
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (profileError && profileError.code !== 'PGRST116') {
          console.error("Error fetching user profile:", profileError);
          throw profileError;
        }
        
        // If profile exists, use it
        if (profileData) {
          // Check if user is blocked
          if (profileData.is_blocked) {
            toast({
              title: "Access Denied",
              description: "Your account has been blocked. Please contact an administrator.",
              variant: "destructive"
            });
            await supabase.auth.signOut();
            return;
          }
          
          const userProfile: User = {
            id: profileData.id,
            name: profileData.name,
            email: profileData.email,
            role: profileData.role as UserRole,
            avatar: profileData.avatar
          };
          
          setUser(userProfile);
          localStorage.setItem("mgp-user", JSON.stringify(userProfile));
        } else {
          // Create default admin profile if not exists
          const userProfile: User = {
            id: user.id,
            name: user.user_metadata.name || user.email?.split('@')[0] || 'Admin User',
            email: user.email || '',
            role: 'admin',
            avatar: user.user_metadata.avatar_url
          };
          
          // Insert the profile
          const { error: insertError } = await supabase
            .from('user_profiles')
            .insert({
              id: userProfile.id,
              email: userProfile.email,
              name: userProfile.name,
              role: userProfile.role,
              avatar: userProfile.avatar
            });
            
          if (insertError) {
            console.error("Error creating user profile:", insertError);
          }
          
          setUser(userProfile);
          localStorage.setItem("mgp-user", JSON.stringify(userProfile));
        }
        
        // Log activity
        if (user) {
          await logActivity(
            user.id,
            user.email || '',
            'admin',
            LogActions.LOGIN,
            "auth",
            user.id
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
        // Check if this buyer is in the allowed buyers list
        const { data: buyerData, error: buyerError } = await supabase
          .from('allowed_buyers')
          .select('*')
          .eq('email', email)
          .single();
          
        if (buyerError || !buyerData) {
          toast({
            title: "Access Denied",
            description: "Buyer not in allowed list. Contact an admin to add you.",
            variant: "destructive"
          });
          setLoading(false);
          return false;
        }
      }
      
      // Check if user profile exists
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('email', email)
        .eq('role', role)
        .single();
        
      if (profileError && profileError.code !== 'PGRST116') {
        console.error("Error checking user profile:", profileError);
      }
      
      // If profile exists, check if blocked
      if (profileData) {
        if (profileData.is_blocked) {
          toast({
            title: "Access Denied",
            description: "Your account has been blocked. Please contact an administrator.",
            variant: "destructive"
          });
          setLoading(false);
          return false;
        }
        
        const userProfile: User = {
          id: profileData.id,
          name: profileData.name,
          email: profileData.email,
          role: profileData.role as UserRole,
          avatar: profileData.avatar
        };
        
        setUser(userProfile);
        localStorage.setItem("mgp-user", JSON.stringify(userProfile));
        
        // Log activity
        await logActivity(
          userProfile.id,
          userProfile.email,
          userProfile.role,
          LogActions.LOGIN,
          "auth",
          userProfile.id
        );
        
        return true;
      }
      
      // For clients, create a new profile if one doesn't exist
      if (role === 'client') {
        const newId = crypto.randomUUID();
        const userProfile: User = {
          id: newId,
          name: email.split('@')[0],
          email: email,
          role: role,
          avatar: '/placeholder.svg'
        };
        
        // Insert into user_profiles
        const { error: insertError } = await supabase
          .from('user_profiles')
          .insert({
            id: userProfile.id,
            email: userProfile.email,
            name: userProfile.name,
            role: userProfile.role,
            avatar: userProfile.avatar
          });
          
        if (insertError) {
          console.error("Error creating user profile:", insertError);
          toast({
            title: "Login Failed",
            description: "Could not create user profile",
            variant: "destructive"
          });
          setLoading(false);
          return false;
        }
        
        setUser(userProfile);
        localStorage.setItem("mgp-user", JSON.stringify(userProfile));
        
        // Log activity
        await logActivity(
          userProfile.id,
          userProfile.email,
          userProfile.role,
          LogActions.LOGIN,
          "auth",
          userProfile.id
        );
        
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
      await logActivity(
        user.id,
        user.email,
        user.role,
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
