
import MainLayout from "@/components/layout/MainLayout";
import NewRequestForm from "@/components/requests/NewRequestForm";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

const NewRequestPage = () => {
  const { user } = useAuth();
  
  // Only client and admin can create requests
  if (user?.role !== "client" && user?.role !== "admin") {
    return <Navigate to="/dashboard" />;
  }
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Create New Request
          </h2>
          <p className="text-muted-foreground">
            Submit a new procurement request
          </p>
        </div>

        <NewRequestForm />
      </div>
    </MainLayout>
  );
};

export default NewRequestPage;
