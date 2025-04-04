
import MainLayout from "@/components/layout/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useProcurement } from "@/contexts/ProcurementContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const ClientViewPage = () => {
  const { user } = useAuth();
  const { userRequests } = useProcurement();
  const navigate = useNavigate();

  // Filter to only show public requests for this client
  const publicRequests = userRequests.filter(
    (req) => req.isPublic && req.clientId === user?.id
  );

  const getStageBadgeClass = (stage: string) => {
    switch (stage) {
      case "New Request":
        return "bg-blue-100 text-blue-800";
      case "Resourcing":
        return "bg-purple-100 text-purple-800";
      case "CO/CE":
        return "bg-amber-100 text-amber-800";
      case "Customs":
        return "bg-indigo-100 text-indigo-800";
      case "Logistics":
        return "bg-cyan-100 text-cyan-800";
      case "Delivered":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              My Requests
            </h2>
            <p className="text-muted-foreground">
              Track the status of your procurement requests
            </p>
          </div>
          <Button onClick={() => navigate("/requests/new")}>
            New Request
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Request Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="bg-procurement-primary text-white">
                  <TableHead className="text-white">Reference</TableHead>
                  <TableHead className="text-white">Description</TableHead>
                  <TableHead className="text-white">Status</TableHead>
                  <TableHead className="text-white">Quantity</TableHead>
                  <TableHead className="text-white">Delivery Location</TableHead>
                  <TableHead className="text-white">Expected Delivery</TableHead>
                  <TableHead className="text-white text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {publicRequests.length > 0 ? (
                  publicRequests.map((request) => (
                    <TableRow key={request.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">
                        {request.poNumber || request.rfqNumber || "N/A"}
                      </TableCell>
                      <TableCell>{request.description}</TableCell>
                      <TableCell>
                        <Badge className={getStageBadgeClass(request.stage)}>
                          {request.stage}
                        </Badge>
                      </TableCell>
                      <TableCell>{request.qtyRequested}</TableCell>
                      <TableCell>{request.placeOfDelivery}</TableCell>
                      <TableCell>
                        {request.expDeliveryDate 
                          ? new Date(request.expDeliveryDate).toLocaleDateString() 
                          : "N/A"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/requests/${request.id}`)}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No requests found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default ClientViewPage;
