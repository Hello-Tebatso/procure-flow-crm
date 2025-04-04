
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import { Navigate } from "react-router-dom";
import { Loader } from "lucide-react";

interface MainLayoutProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, requireAuth = true }) => {
  const { user, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-2">
          <Loader className="h-8 w-8 animate-spin text-procurement-primary" />
          <p className="text-procurement-primary">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if auth is required but user is not logged in
  if (requireAuth && !user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="h-screen flex flex-col md:flex-row bg-gray-50">
      {user && <Sidebar />}
      <div className="flex flex-col flex-1 overflow-hidden">
        {user && <TopBar />}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
