
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col justify-center items-center px-4 text-center">
        <div className="mb-6">
          <img
            src="/lovable-uploads/0e327c2e-74bc-454a-8543-770c4d91ee88.png"
            alt="MGP Logo"
            className="h-20 w-20 mx-auto"
          />
        </div>
        <h1 className="text-3xl md:text-5xl font-bold text-procurement-primary mb-4">
          MGP Procurement Management
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mb-8">
          Streamline your procurement process with our powerful management system.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild size="lg" className="px-8">
            <Link to="/login">Login</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="px-8"
          >
            <Link to="/signup">Sign Up</Link>
          </Button>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            Why Choose MGP Procurement?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-3 text-procurement-primary">
                Streamlined Requests
              </h3>
              <p className="text-gray-600">
                Create, track, and manage procurement requests with ease from anywhere.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-3 text-procurement-primary">
                Detailed Analytics
              </h3>
              <p className="text-gray-600">
                Get insights into procurement performance with comprehensive reports and dashboards.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-3 text-procurement-primary">
                Collaborative Workflow
              </h3>
              <p className="text-gray-600">
                Enable seamless collaboration between clients, buyers, and administrators.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <img
              src="/lovable-uploads/0e327c2e-74bc-454a-8543-770c4d91ee88.png"
              alt="MGP Logo"
              className="h-8 w-8 mr-2"
            />
            <span className="text-white font-medium">MGP Procurement</span>
          </div>
          <div className="text-sm">
            &copy; {new Date().getFullYear()} MGP Procurement. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
