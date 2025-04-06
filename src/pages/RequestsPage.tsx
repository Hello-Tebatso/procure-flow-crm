
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useProcurement } from "@/contexts/ProcurementContext";
import { useAuth } from "@/contexts/AuthContext";
import RequestsTable from "@/components/requests/RequestsTable";
import { Button } from "@/components/ui/button";
import { Plus, Loader } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const RequestsPage = () => {
  const { userRequests, loadUserRequests, isLoading, acceptRequest, declineRequest, deleteRequest } = useProcurement();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState<string | null>(null);

  // Memoize loadUserRequests to prevent infinite re-renders
  const memoizedLoadUserRequests = useCallback(loadUserRequests, []);

  useEffect(() => {
    memoizedLoadUserRequests();
  }, [memoizedLoadUserRequests]);

  const handleAccept = async (id: string) => {
    if (!user) return;
    
    setProcessingId(id);
    
    // Get buyer ID from the parameter - in a real scenario, you'd pick from a list
    const success = await acceptRequest(id, "e8fd159b-57c4-4d36-9bd7-a59ca13057ef");
    
    setProcessingId(null);
    
    if (success) {
      navigate(`/requests/${id}`);
    }
  };

  const handleDecline = async (id: string) => {
    setProcessingId(id);
    
    const success = await declineRequest(id);
    
    setProcessingId(null);
    
    if (success) {
      navigate(`/requests/${id}`);
    }
  };

  const handleDeleteRequest = (id: string) => {
    setRequestToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (requestToDelete) {
      setProcessingId(requestToDelete);
      const success = await deleteRequest(requestToDelete);
      setProcessingId(null);
      
      if (success) {
        memoizedLoadUserRequests();
      }
    }
    setDeleteDialogOpen(false);
    setRequestToDelete(null);
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Procurement Requests</h1>
          
          {/* Only clients and admins can create new requests, not buyers */}
          {(user?.role === "client" || user?.role === "admin") && (
            <Button onClick={() => navigate("/requests/new")} className="mt-4 md:mt-0">
              <Plus className="mr-2 h-4 w-4" />
              New Request
            </Button>
          )}
        </div>

        {isLoading && !processingId ? (
          <div className="flex justify-center my-8">
            <Loader className="h-8 w-8 animate-spin text-procurement-primary" />
          </div>
        ) : (
          <RequestsTable 
            requests={userRequests} 
            showActions={user?.role === "admin"} 
            onAccept={handleAccept}
            onDecline={handleDecline}
            onDelete={handleDeleteRequest}
          />
        )}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Request Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this request? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-500 hover:bg-red-600">
              {processingId === requestToDelete ? (
                <Loader className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
};

export default RequestsPage;
