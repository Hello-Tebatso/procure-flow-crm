
import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
import { ActivityLog } from "@/types";
import { getActivityLogs } from "@/services/LogService";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";

const ActivityLogsPage = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      if (user) {
        setLoading(true);
        const data = await getActivityLogs(100);
        setLogs(data);
        setLoading(false);
      }
    };

    fetchLogs();
  }, [user]);

  // Only admin can access this page
  if (user?.role !== "admin") {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <p className="text-lg text-muted-foreground">
            You don't have permission to view this page.
          </p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Activity Logs</h2>
          <p className="text-muted-foreground">
            View recent system activity
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <p>Loading logs...</p>
              </div>
            ) : (
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-procurement-primary text-white">
                      <TableHead className="text-white">Time</TableHead>
                      <TableHead className="text-white">User</TableHead>
                      <TableHead className="text-white">Role</TableHead>
                      <TableHead className="text-white">Action</TableHead>
                      <TableHead className="text-white">Entity</TableHead>
                      <TableHead className="text-white">Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.length > 0 ? (
                      logs.map((log) => (
                        <TableRow key={log.id} className="hover:bg-muted/50">
                          <TableCell>
                            {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                          </TableCell>
                          <TableCell>{log.userName}</TableCell>
                          <TableCell className="capitalize">{log.userRole}</TableCell>
                          <TableCell>{log.action}</TableCell>
                          <TableCell className="capitalize">{log.entityType}</TableCell>
                          <TableCell>
                            {log.details && typeof log.details === 'object' 
                              ? Object.entries(log.details)
                                  .map(([key, value]) => `${key}: ${value}`)
                                  .join(", ")
                              : log.details || '-'}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          No activity logs found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default ActivityLogsPage;
