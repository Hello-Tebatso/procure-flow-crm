
import DashboardCard from "./DashboardCard";
import { BarChart3, Clock, CheckCircle2, AlertCircle } from "lucide-react";

interface StatisticsGridProps {
  stats: {
    totalRequests: number;
    pendingRequests: number;
    completedRequests: number;
    onTimeDelivery: number;
    lateDelivery: number;
    priorityItems: number;
  }
}

const StatisticsGrid: React.FC<StatisticsGridProps> = ({ stats }) => {
  const deliveryRate = stats.completedRequests > 0 
    ? Math.round((stats.onTimeDelivery / stats.completedRequests) * 100) 
    : 0;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <DashboardCard
        title="Total Requests"
        value={stats.totalRequests}
        icon={<BarChart3 className="h-4 w-4" />}
      />
      
      <DashboardCard
        title="Pending Requests"
        value={stats.pendingRequests}
        icon={<Clock className="h-4 w-4" />}
      />
      
      <DashboardCard
        title="Completed Requests"
        value={stats.completedRequests}
        icon={<CheckCircle2 className="h-4 w-4" />}
      />
      
      <DashboardCard
        title="On-Time Delivery"
        value={`${deliveryRate}%`}
        icon={<AlertCircle className="h-4 w-4" />}
        trend={deliveryRate >= 90 ? "up" : deliveryRate >= 70 ? "neutral" : "down"}
        trendValue={`${stats.onTimeDelivery}/${stats.completedRequests} deliveries`}
      />
    </div>
  );
};

export default StatisticsGrid;
