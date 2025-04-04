
import React from 'react';
import { mockDashboardStats, mockBuyerPerformance } from "@/lib/mock-data";
import StatisticsGrid from '@/components/dashboard/StatisticsGrid';
import StageDistributionChart from '@/components/dashboard/StageDistributionChart';
import BuyerPerformanceTable from '@/components/dashboard/BuyerPerformanceTable';

const DashboardPage: React.FC = () => {
  const stats = mockDashboardStats;
  const stageData = {
    'New Request': 5,
    'Resourcing': 3,
    'CO/CE': 2,
    'Customs': 1,
    'Logistics': 1,
    'Delivered': 2
  };
  // Use the mockBuyerPerformance data directly since stats.performanceData doesn't exist
  const performanceData = mockBuyerPerformance;

  return (
    <div className="p-6 space-y-6">
      <StatisticsGrid stats={stats} />
      <div className="grid md:grid-cols-2 gap-6">
        <StageDistributionChart data={stageData} />
        <BuyerPerformanceTable data={performanceData} />
      </div>
    </div>
  );
};

export default DashboardPage;
