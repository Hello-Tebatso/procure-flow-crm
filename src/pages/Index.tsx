
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Auto-redirect if user is already logged in
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-gray-100">
      {/* Hero Section */}
      <header className="bg-procurement-primary text-white">
        <div className="container mx-auto py-6 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img
                src="/lovable-uploads/0e327c2e-74bc-454a-8543-770c4d91ee88.png"
                alt="ProcureFlow Logo"
                className="h-10 w-10"
              />
              <h1 className="ml-3 text-2xl font-bold">ProcureFlow CRM</h1>
            </div>
            <Button
              variant="outline"
              className="bg-white text-procurement-primary hover:bg-procurement-primary hover:text-white"
              onClick={() => navigate("/login")}
            >
              Login
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 md:py-24 container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-procurement-primary mb-6">
                Streamlined Procurement Management
              </h2>
              <p className="text-lg text-gray-700 mb-8">
                ProcureFlow helps you manage your procurement process from request to delivery,
                with powerful tracking, approval workflows, and analytics.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button
                  size="lg"
                  className="bg-procurement-primary hover:bg-procurement-primary/90"
                  onClick={() => navigate("/login")}
                >
                  Get Started
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-procurement-primary text-procurement-primary hover:bg-procurement-primary/10"
                >
                  Learn More
                </Button>
              </div>
            </div>
            <div className="hidden md:block">
              <img
                src="/placeholder.svg"
                alt="Procurement Management"
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-procurement-primary">
              Key Features
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="h-12 w-12 bg-procurement-primary/10 text-procurement-primary rounded-lg flex items-center justify-center mb-4">
                  1
                </div>
                <h3 className="text-xl font-semibold mb-2">Request Creation</h3>
                <p className="text-gray-600">
                  Create and submit procurement requests with file attachments
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="h-12 w-12 bg-procurement-primary/10 text-procurement-primary rounded-lg flex items-center justify-center mb-4">
                  2
                </div>
                <h3 className="text-xl font-semibold mb-2">Buyer Assignment</h3>
                <p className="text-gray-600">
                  Accept, assign, and manage requests through the procurement process
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="h-12 w-12 bg-procurement-primary/10 text-procurement-primary rounded-lg flex items-center justify-center mb-4">
                  3
                </div>
                <h3 className="text-xl font-semibold mb-2">Stage Tracking</h3>
                <p className="text-gray-600">
                  Track requests through different stages with detailed updates
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="h-12 w-12 bg-procurement-primary/10 text-procurement-primary rounded-lg flex items-center justify-center mb-4">
                  4
                </div>
                <h3 className="text-xl font-semibold mb-2">Performance Analytics</h3>
                <p className="text-gray-600">
                  View comprehensive dashboards and reports on procurement metrics
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-procurement-primary text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Optimize Your Procurement Process?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Join organizations that have streamlined their procurement operations with ProcureFlow.
            </p>
            <Button
              size="lg"
              variant="outline"
              className="bg-white text-procurement-primary hover:bg-gray-100"
              onClick={() => navigate("/login")}
            >
              Get Started Now
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <img
                src="/lovable-uploads/0e327c2e-74bc-454a-8543-770c4d91ee88.png"
                alt="ProcureFlow Logo"
                className="h-8 w-8"
              />
              <span className="ml-2 text-gray-600 font-medium">ProcureFlow</span>
            </div>
            <div className="text-gray-600 text-sm">
              &copy; {new Date().getFullYear()} ProcureFlow. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
