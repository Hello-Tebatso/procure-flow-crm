
import MainLayout from "@/components/layout/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useProcurement } from "@/contexts/ProcurementContext";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import RequestsTable from "@/components/requests/RequestsTable";
import RequestCard from "@/components/requests/RequestCard";
import { mockUsers } from "@/lib/mock-data";

const RequestsPage = () => {
  const { user } = useAuth();
  const { userRequests, acceptRequest, declineRequest } = useProcurement();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  const pendingRequests = userRequests.filter(
    (req) => req.status === "pending"
  );
  
  const activeRequests = userRequests.filter(
    (req) => req.status === "accepted" && req.stage !== "Delivered"
  );
  
  const completedRequests = userRequests.filter(
    (req) => req.status === "completed" || req.stage === "Delivered"
  );
  
  const handleAcceptRequest = async (requestId: string) => {
    // For simplicity, we'll assign to the current user if they're a buyer
    // In a real app, admin would have a dropdown to select buyer
    if (user?.role === "buyer") {
      await acceptRequest(requestId, user.id);
    } else if (user?.role === "admin") {
      // For demo purposes, just assign to the first buyer
      const firstBuyer = mockUsers.find(u => u.role === "buyer");
      if (firstBuyer) {
        await acceptRequest(requestId, firstBuyer.id);
      }
    }
  };
  
  const handleDeclineRequest = async (requestId: string) => {
    await declineRequest(requestId);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Requests</h2>
            <p className="text-muted-foreground">
              Manage procurement requests
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-1 border rounded-md">
              <Button
                variant={viewMode === "table" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("table")}
                className="rounded-r-none"
              >
                Table
              </Button>
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="rounded-l-none"
              >
                Grid
              </Button>
            </div>
            
            {/* Allow only clients and admins to create new requests */}
            {(user?.role === "client" || user?.role === "admin") && (
              <Button onClick={() => navigate("/requests/new")}>
                New Request
              </Button>
            )}
          </div>
        </div>

        <Tabs defaultValue="active">
          <TabsList>
            <TabsTrigger value="active">
              Active ({activeRequests.length})
            </TabsTrigger>
            {/* Only show pending tab for admin and buyers */}
            {(user?.role === "admin" || user?.role === "buyer") && (
              <TabsTrigger value="pending">
                Pending ({pendingRequests.length})
              </TabsTrigger>
            )}
            <TabsTrigger value="completed">
              Completed ({completedRequests.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="active" className="mt-6">
            {viewMode === "table" ? (
              <RequestsTable requests={activeRequests} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeRequests.map(request => (
                  <RequestCard 
                    key={request.id} 
                    request={request}
                  />
                ))}
                {activeRequests.length === 0 && (
                  <div className="col-span-full py-8 text-center text-muted-foreground">
                    No active requests found.
                  </div>
                )}
              </div>
            )}
          </TabsContent>
          
          {/* Only show pending tab content for admin and buyers */}
          {(user?.role === "admin" || user?.role === "buyer") && (
            <TabsContent value="pending" className="mt-6">
              {viewMode === "table" ? (
                <RequestsTable 
                  requests={pendingRequests} 
                  showActions
                  onAccept={handleAcceptRequest}
                  onDecline={handleDeclineRequest}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pendingRequests.map(request => (
                    <RequestCard 
                      key={request.id} 
                      request={request} 
                      showActions={true}
                      onAccept={handleAcceptRequest}
                      onDecline={handleDeclineRequest}
                    />
                  ))}
                  {pendingRequests.length === 0 && (
                    <div className="col-span-full py-8 text-center text-muted-foreground">
                      No pending requests found.
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          )}
          
          <TabsContent value="completed" className="mt-6">
            {viewMode === "table" ? (
              <RequestsTable requests={completedRequests} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedRequests.map(request => (
                  <RequestCard 
                    key={request.id} 
                    request={request}
                  />
                ))}
                {completedRequests.length === 0 && (
                  <div className="col-span-full py-8 text-center text-muted-foreground">
                    No completed requests found.
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default RequestsPage;
