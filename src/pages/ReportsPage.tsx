
import { useEffect, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { mockBuyerPerformance } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BuyerPerformance } from "@/types";
import BuyerPerformanceTable from "@/components/dashboard/BuyerPerformanceTable";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { PieChart, Pie, Cell } from 'recharts';
import { mockProcurementRequests } from "@/lib/mock-data";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

interface StageDistribution {
  name: string;
  value: number;
}

interface MonthlyData {
  name: string;
  completed: number;
  pending: number;
}

const ReportsPage = () => {
  const [performanceData, setPerformanceData] = useState<BuyerPerformance[]>([]);
  const [stageDistribution, setStageDistribution] = useState<StageDistribution[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);

  useEffect(() => {
    // Load buyer performance data
    setPerformanceData(mockBuyerPerformance);

    // Calculate stage distribution from mock requests
    const stageCount: {[key: string]: number} = {};
    mockProcurementRequests.forEach(request => {
      stageCount[request.stage] = (stageCount[request.stage] || 0) + 1;
    });

    const distribution = Object.keys(stageCount).map(stage => ({
      name: stage,
      value: stageCount[stage]
    }));
    setStageDistribution(distribution);

    // Generate monthly data
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const generatedMonthlyData = months.map(month => ({
      name: month,
      completed: Math.floor(Math.random() * 30) + 5,
      pending: Math.floor(Math.random() * 20) + 3
    }));
    setMonthlyData(generatedMonthlyData);

  }, []);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Reports</h2>
          <p className="text-muted-foreground">
            View performance reports and analytics
          </p>
        </div>

        <Tabs defaultValue="overview">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="buyers">Buyer Performance</TabsTrigger>
            <TabsTrigger value="monthly">Monthly Trends</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Request Stage Distribution</CardTitle>
                </CardHeader>
                <CardContent className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stageDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {stageDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name) => [`${value} requests`, name]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Procurement Volume by Category</CardTitle>
                </CardHeader>
                <CardContent className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: 'Equipment', value: 32 },
                        { name: 'Supplies', value: 27 },
                        { name: 'Services', value: 18 },
                        { name: 'Materials', value: 23 },
                        { name: 'Transport', value: 14 }
                      ]}
                      margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#0c4a6e" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="buyers">
            <Card>
              <CardHeader>
                <CardTitle>Buyer Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <BuyerPerformanceTable data={performanceData} />
              </CardContent>
            </Card>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Delivery Performance</CardTitle>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={performanceData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="buyerName" angle={-45} textAnchor="end" height={60} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar name="On-Time Delivery %" dataKey="deliveredOnTimePercentage" fill="#10b981" />
                    <Bar name="Total Delivery %" dataKey="totalDeliveredPercentage" fill="#0ea5e9" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="monthly">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Procurement Trends</CardTitle>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={monthlyData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar name="Completed Requests" dataKey="completed" stackId="a" fill="#10b981" />
                    <Bar name="Pending Requests" dataKey="pending" stackId="a" fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default ReportsPage;
