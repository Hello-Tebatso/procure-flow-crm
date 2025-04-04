
import { useEffect, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
import StatisticsGrid from "@/components/dashboard/StatisticsGrid";
import BuyerPerformanceTable from "@/components/dashboard/BuyerPerformanceTable";
import StageDistributionChart from "@/components/dashboard/StageDistributionChart";
import RequestCard from "@/components/requests/RequestCard";
import { useProcurement } from "@/contexts/ProcurementContext";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { mockBuyerPerformance } from "@/lib/mock-data";
import { getMockDashboardStats } from "@/lib/mock-data";

const DashboardPage = () => {
  const { user } = useAuth();
  const { userRequests } = useProcurement();
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [recentRequests, setRecentRequests] = useState<any[]>([]);

  useEffect(() => {
    // Get dashboard stats based on user role
    setStats(getMockDashboardStats(user?.id));
    
    // Get recent requests (limited to 4)
    const recent = userRequests
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 4);
    
    setRecentRequests(recent);
  }, [user, userRequests]);

  if (!stats) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <p>Loading dashboard...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Welcome, {user?.name}
            </h2>
            <p className="text-muted-foreground">
              Your procurement management dashboard
            </p>
          </div>
          
          {user?.role !== "admin" && (
            <Button onClick={() => navigate("/requests/new")}>
              New Request
            </Button>
          )}
        </div>

        <StatisticsGrid stats={stats} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Request Stage Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <StageDistributionChart data={stats.stageDistribution} />
            </CardContent>
          </Card>
          
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Requests</CardTitle>
              <Button variant="link" onClick={() => navigate("/requests")}>
                View All
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentRequests.length > 0 ? (
                  recentRequests.map((request) => (
                    <div key={request.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">
                            {request.poNumber || request.rfqNumber || "New Request"}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {request.description?.substring(0, 60)}
                            {request.description?.length > 60 ? "..." : ""}
                          </p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => navigate(`/requests/${request.id}`)}
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-6 text-muted-foreground">
                    No recent requests found
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {user?.role === "admin" && (
          <Card>
            <CardHeader>
              <CardTitle>Buyer Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <BuyerPerformanceTable data={mockBuyerPerformance} />
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default DashboardPage;
