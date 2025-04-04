
import { ProcurementRequest } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface RequestCardProps {
  request: ProcurementRequest;
  showActions?: boolean;
  onAccept?: (id: string) => void;
  onDecline?: (id: string) => void;
}

const RequestCard: React.FC<RequestCardProps> = ({ 
  request, 
  showActions = false, 
  onAccept, 
  onDecline 
}) => {
  const navigate = useNavigate();
  
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
  
  const handleViewDetails = () => {
    navigate(`/requests/${request.id}`);
  };
  
  return (
    <Card className={cn("h-full transition-shadow hover:shadow-md")}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg text-procurement-primary">
              {request.poNumber || request.rfqNumber || "New Request"}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {request.entity}
            </p>
          </div>
          <div className="flex space-x-2">
            <Badge className={getStageBadgeClass(request.stage)}>
              {request.stage}
            </Badge>
            <Badge className={getStatusBadgeClass(request.status)}>
              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium">Description</p>
            <p className="text-sm text-muted-foreground">
              {request.description || "No description"}
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="font-medium">Quantity</p>
              <p className="text-muted-foreground">
                {request.qtyRequested}
              </p>
            </div>
            <div>
              <p className="font-medium">Delivery Location</p>
              <p className="text-muted-foreground">
                {request.placeOfDelivery}
              </p>
            </div>
            {request.expDeliveryDate && (
              <div>
                <p className="font-medium">Expected Delivery</p>
                <p className="text-muted-foreground">
                  {new Date(request.expDeliveryDate).toLocaleDateString()}
                </p>
              </div>
            )}
            {request.buyer && (
              <div>
                <p className="font-medium">Assigned To</p>
                <p className="text-muted-foreground">{request.buyer}</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-2 border-t">
        <p className="text-xs text-muted-foreground">
          Created {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
        </p>
        <div className="flex space-x-2">
          {showActions && request.status === "pending" ? (
            <>
              <Button 
                size="sm" 
                onClick={() => onAccept?.(request.id)}
                variant="outline"
              >
                Accept
              </Button>
              <Button 
                size="sm" 
                onClick={() => onDecline?.(request.id)}
                variant="outline"
                className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
              >
                Decline
              </Button>
            </>
          ) : (
            <Button 
              size="sm"
              onClick={handleViewDetails}
            >
              View Details
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default RequestCard;
