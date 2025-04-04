
import { ProcurementRequest, ProcurementStage } from "@/types";
import { useMemo, useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RequestsTableProps {
  requests: ProcurementRequest[];
  showActions?: boolean;
  onAccept?: (id: string) => void;
  onDecline?: (id: string) => void;
}

const RequestsTable: React.FC<RequestsTableProps> = ({ 
  requests, 
  showActions = false,
  onAccept,
  onDecline
}) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");

  const getStageBadgeClass = (stage: ProcurementRequest["stage"]) => {
    switch (stage) {
      case "New Request":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case "Resourcing":
        return "bg-purple-100 text-purple-800 hover:bg-purple-100";
      case "CO/CE":
        return "bg-amber-100 text-amber-800 hover:bg-amber-100";
      case "Customs":
        return "bg-indigo-100 text-indigo-800 hover:bg-indigo-100";
      case "Logistics":
        return "bg-cyan-100 text-cyan-800 hover:bg-cyan-100";
      case "Delivered":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  const getStatusBadgeClass = (status: ProcurementRequest["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      case "accepted":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "declined":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      case "completed":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  const uniqueStages = useMemo(() => {
    const stages = new Set<ProcurementStage>();
    requests.forEach(request => {
      stages.add(request.stage);
    });
    return Array.from(stages);
  }, [requests]);

  const filteredRequests = useMemo(() => {
    return requests.filter(request => {
      const searchMatch = 
        request.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.poNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.rfqNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.vendor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.entity?.toLowerCase().includes(searchTerm.toLowerCase());
        
      const stageMatch = stageFilter === "all" || request.stage === stageFilter;
      
      return searchMatch && stageMatch;
    });
  }, [requests, searchTerm, stageFilter]);

  const handleViewDetails = (id: string) => {
    navigate(`/requests/${id}`);
  };

  return (
    <div>
      <div className="mb-4 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search requests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>
        <div className="w-full md:w-[200px]">
          <Select value={stageFilter} onValueChange={setStageFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by stage" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All Stages</SelectItem>
                {uniqueStages.map((stage) => (
                  <SelectItem key={stage} value={stage}>
                    {stage}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-procurement-primary text-white">
              <TableHead className="text-white">PO/RFQ Number</TableHead>
              <TableHead className="text-white">Description</TableHead>
              <TableHead className="text-white">Stage</TableHead>
              <TableHead className="text-white">Status</TableHead>
              <TableHead className="text-white">Qty</TableHead>
              <TableHead className="text-white">Delivery Place</TableHead>
              <TableHead className="text-white">Assigned To</TableHead>
              <TableHead className="text-white text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRequests.length > 0 ? (
              filteredRequests.map((request) => (
                <TableRow key={request.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">
                    {request.poNumber || request.rfqNumber || "N/A"}
                  </TableCell>
                  <TableCell>{request.description || "N/A"}</TableCell>
                  <TableCell>
                    <Badge className={getStageBadgeClass(request.stage)}>
                      {request.stage}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusBadgeClass(request.status)}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>{request.qtyRequested}</TableCell>
                  <TableCell>{request.placeOfDelivery}</TableCell>
                  <TableCell>{request.buyer || "Unassigned"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      {showActions && request.status === "pending" ? (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onAccept?.(request.id)}
                          >
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                            onClick={() => onDecline?.(request.id)}
                          >
                            Decline
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleViewDetails(request.id)}
                        >
                          View
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No requests found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default RequestsTable;
