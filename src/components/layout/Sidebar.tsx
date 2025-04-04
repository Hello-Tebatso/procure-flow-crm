
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  PackageSearch, 
  Users, 
  FileText, 
  Settings,
  Menu,
  X,
  ClipboardList
} from "lucide-react";

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Only show sidebar if user is logged in
  if (!user) {
    return null;
  }

  const navItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      roles: ["admin", "buyer", "client"]
    },
    {
      name: "Requests",
      path: "/requests",
      icon: <PackageSearch className="h-5 w-5" />,
      roles: ["admin", "buyer", "client"]
    },
    {
      name: "Users",
      path: "/users",
      icon: <Users className="h-5 w-5" />,
      roles: ["admin"]
    },
    {
      name: "Reports",
      path: "/reports",
      icon: <FileText className="h-5 w-5" />,
      roles: ["admin", "buyer"]
    },
    {
      name: "Activity Logs",
      path: "/logs",
      icon: <ClipboardList className="h-5 w-5" />,
      roles: ["admin"]
    },
    {
      name: "Settings",
      path: "/settings",
      icon: <Settings className="h-5 w-5" />,
      roles: ["admin"]
    }
  ].filter(item => item.roles.includes(user.role));

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  return (
    <>
      {/* Mobile hamburger menu */}
      <div className="md:hidden fixed top-0 left-0 z-30 p-4">
        <button 
          onClick={toggleMobileSidebar}
          className="p-2 rounded-md text-white bg-procurement-primary"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleMobileSidebar}
        />
      )}

      {/* Sidebar for mobile and desktop */}
      <div 
        className={cn(
          "fixed md:relative z-50 flex flex-col h-full bg-procurement-primary text-white transition-all duration-300",
          isCollapsed ? "w-16" : "w-64",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-procurement-primary/20">
          <div className="flex items-center">
            <img
              src="https://static.wixstatic.com/media/bda159_4c1aeb4ff1664028a8d67ea7ce0ac8fd~mv2.png"
              alt="MGP Logo"
              className="h-8 w-8"
            />
            {!isCollapsed && <span className="ml-3 font-bold text-lg">MGP</span>}
          </div>
          <div className="flex items-center">
            <button 
              onClick={toggleSidebar} 
              className="hidden md:block p-1 rounded-md hover:bg-procurement-primary/20"
            >
              {isCollapsed ? (
                <Menu className="h-5 w-5" />
              ) : (
                <X className="h-5 w-5" />
              )}
            </button>
            <button 
              onClick={toggleMobileSidebar} 
              className="md:hidden p-1 rounded-md hover:bg-procurement-primary/20"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center px-4 py-3 mx-2 rounded-md transition-colors",
                    location.pathname === item.path
                      ? "bg-sidebar-accent text-white"
                      : "text-gray-200 hover:bg-procurement-primary/20"
                  )}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  {!isCollapsed && <span className="ml-3">{item.name}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-procurement-primary/20">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                {user.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.name} 
                    className="h-8 w-8 rounded-full" 
                  />
                ) : (
                  <span className="text-gray-700 text-sm font-medium">
                    {user.name.charAt(0)}
                  </span>
                )}
              </div>
            </div>
            {!isCollapsed && (
              <div className="ml-3">
                <p className="text-sm font-medium text-white truncate">
                  {user.name}
                </p>
                <p className="text-xs text-gray-300 capitalize">
                  {user.role}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
