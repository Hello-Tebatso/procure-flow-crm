
import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "@/types";
import { mockUsers } from "@/lib/mock-data";

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

  // Check for saved user on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("procure-flow-user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    
    // Simulate API call with mock data
    return new Promise((resolve) => {
      setTimeout(() => {
        // For demo, just match email without password check
        const foundUser = mockUsers.find(user => user.email.toLowerCase() === email.toLowerCase());
        
        if (foundUser) {
          setUser(foundUser);
          localStorage.setItem("procure-flow-user", JSON.stringify(foundUser));
          resolve(true);
        } else {
          resolve(false);
        }
        setLoading(false);
      }, 800);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("procure-flow-user");
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
