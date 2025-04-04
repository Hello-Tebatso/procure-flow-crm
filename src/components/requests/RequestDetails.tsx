
import { useProcurement } from "@/contexts/ProcurementContext";
import { useAuth } from "@/contexts/AuthContext";
import { ProcurementRequest, ProcurementStage, RequestFile, User } from "@/types";
import { mockUsers } from "@/lib/mock-data";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Check, 
  Clock, 
  Download,
  Eye,
  EyeOff, 
  FileText, 
  Upload, 
  X 
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface RequestDetailsProps {
  request: ProcurementRequest;
  onUpdate: () => void;
}

const statusIcons = {
  pending: <Clock className="h-4 w-4 text-yellow-500" />,
  accepted: <Check className="h-4 w-4 text-green-500" />,
  declined: <X className="h-4 w-4 text-red-500" />,
  completed: <Check className="h-4 w-4 text-blue-500" />,
};

const procurementStages: ProcurementStage[] = [
  "New Request",
  "Resourcing",
  "CO/CE",
  "Customs",
  "Logistics",
  "Delivered"
];

const RequestDetails: React.FC<RequestDetailsProps> = ({ request, onUpdate }) => {
  const { user } = useAuth();
  const { 
    acceptRequest, 
    declineRequest,
    updateStage,
    updateRequest,
    togglePublicStatus,
    uploadFile
  } = useProcurement();
  const { toast } = useToast();

  const [stage, setStage] = useState<ProcurementStage>(request.stage);
  const [loading, setLoading] = useState(false);
  const [actionComment, setActionComment] = useState("");
  const [selectedBuyer, setSelectedBuyer] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  
  const buyers = mockUsers.filter(u => u.role === "buyer");
  const requestBuyer = request.buyerId 
    ? mockUsers.find(u => u.id === request.buyerId) 
    : null;

  const isAdmin = user?.role === "admin";
  const isBuyer = user?.role === "buyer";
  const isAssignedBuyer = user?.id === request.buyerId;
  const canManageRequest = isAdmin || isAssignedBuyer;
  
  const handleAcceptRequest = async () => {
    if (!selectedBuyer) {
      toast({
        title: "Error",
        description: "Please select a buyer to assign the request",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    const success = await acceptRequest(request.id, selectedBuyer);
    setLoading(false);
    
    if (success) {
      onUpdate();
    }
  };
  
  const handleDeclineRequest = async () => {
    setLoading(true);
    const success = await declineRequest(request.id);
    setLoading(false);
    
    if (success) {
      onUpdate();
    }
  };
  
  const handleUpdateStage = async () => {
    setLoading(true);
    const success = await updateStage(request.id, stage);
    setLoading(false);
    
    if (success) {
      onUpdate();
    }
  };
  
  const handleAddComment = async () => {
    if (!actionComment.trim()) {
      toast({
        title: "Error",
        description: "Please enter an action item or comment",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    await updateRequest(request.id, {
      actionItems: actionComment,
      responsible: user?.name,
      updatedAt: new Date().toISOString()
    });
    setLoading(false);
    setActionComment("");
    onUpdate();
  };
  
  const handleTogglePublic = async () => {
    setLoading(true);
    const success = await togglePublicStatus(request.id);
    setLoading(false);
    
    if (success) {
      onUpdate();
    }
  };
  
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setUploading(true);
      
      try {
        const file = event.target.files[0];
        await uploadFile(request.id, file);
        onUpdate();
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to upload file",
          variant: "destructive"
        });
      } finally {
        setUploading(false);
      }
    }
  };
  
  const getStageBadgeClass = (stageValue: ProcurementStage) => {
    switch (stageValue) {
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
  
  const getStatusBadgeClass = (status: ProcurementRequest["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "accepted":
        return "bg-green-100 text-green-800";
      case "declined":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Request Details
          </h2>
          <p className="text-muted-foreground">
            {request.poNumber || request.rfqNumber || "New Request"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge
            className={`text-xs ${getStageBadgeClass(request.stage)}`}
          >
            {request.stage}
          </Badge>
          
          <Badge
            className={`text-xs flex items-center gap-1 ${getStatusBadgeClass(request.status)}`}
          >
            {statusIcons[request.status]}
            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
          </Badge>

          {request.priority === "Over" && (
            <Badge variant="outline" className="text-xs bg-red-50 text-red-600 border-red-200">
              Priority: Over
            </Badge>
          )}
          
          {canManageRequest && request.status === "accepted" && (
            <Button 
              size="sm"
              variant="outline"
              className={request.isPublic ? "bg-green-50" : "bg-gray-100"}
              onClick={handleTogglePublic}
            >
              {request.isPublic ? (
                <>
                  <Eye className="h-3.5 w-3.5 mr-1" />
                  Public
                </>
              ) : (
                <>
                  <EyeOff className="h-3.5 w-3.5 mr-1" />
                  Private
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="details" className="w-full">
        <TabsList className="w-full md:w-auto">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Request Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">RFQ Number</p>
                  <p className="font-medium">{request.rfqNumber || "N/A"}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">PO Number</p>
                  <p className="font-medium">{request.poNumber || "N/A"}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Entity</p>
                  <p className="font-medium">{request.entity}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="font-medium">{request.description}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Vendor</p>
                  <p className="font-medium">{request.vendor || "Not assigned"}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Delivery Location</p>
                  <p className="font-medium">{request.placeOfDelivery}</p>
                </div>

                {request.placeOfArrival && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Arrival Location</p>
                    <p className="font-medium">{request.placeOfArrival}</p>
                  </div>
                )}

                {request.poDate && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">PO Date</p>
                    <p className="font-medium">
                      {new Date(request.poDate).toLocaleDateString()}
                    </p>
                  </div>
                )}

                {request.expDeliveryDate && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Expected Delivery</p>
                    <p className="font-medium">
                      {new Date(request.expDeliveryDate).toLocaleDateString()}
                    </p>
                  </div>
                )}

                {request.dateDelivered && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Date Delivered</p>
                    <p className="font-medium">
                      {new Date(request.dateDelivered).toLocaleDateString()}
                    </p>
                  </div>
                )}

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Quantity Requested</p>
                  <p className="font-medium">{request.qtyRequested}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Quantity Delivered</p>
                  <p className="font-medium">{request.qtyDelivered}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Quantity Pending</p>
                  <p className="font-medium">{request.qtyPending}</p>
                </div>

                {request.leadTimeDays && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Lead Time (Days)</p>
                    <p className="font-medium">{request.leadTimeDays}</p>
                  </div>
                )}

                {request.buyer && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">MGP Buyer</p>
                    <p className="font-medium">{request.buyer}</p>
                  </div>
                )}

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="font-medium">
                    {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Last Updated</p>
                  <p className="font-medium">
                    {formatDistanceToNow(new Date(request.updatedAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {requestBuyer && (
            <Card>
              <CardHeader>
                <CardTitle>Assigned Buyer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={requestBuyer.avatar} />
                    <AvatarFallback>
                      {requestBuyer.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{requestBuyer.name}</p>
                    <p className="text-sm text-muted-foreground">{requestBuyer.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {request.actionItems && (
            <Card>
              <CardHeader>
                <CardTitle>Latest Action Item</CardTitle>
              </CardHeader>
              <CardContent>
                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertTitle>{request.responsible || "System"}</AlertTitle>
                  <AlertDescription>{request.actionItems}</AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="files">
          <Card>
            <CardHeader>
              <CardTitle>Attached Files</CardTitle>
              <CardDescription>
                Documents and files related to this request
              </CardDescription>
            </CardHeader>
            <CardContent>
              {canManageRequest && (
                <div className="mb-6">
                  <Input
                    id="file-upload"
                    type="file"
                    onChange={handleFileUpload}
                    disabled={uploading}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Upload additional documents
                  </p>
                </div>
              )}

              {request.files && request.files.length > 0 ? (
                <div className="space-y-2">
                  {request.files.map((file: RequestFile) => (
                    <div 
                      key={file.id}
                      className="flex items-center justify-between p-3 bg-muted/40 rounded-md"
                    >
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(file.size / 1024).toFixed(0)} KB · Uploaded {
                              formatDistanceToNow(new Date(file.uploadedAt), { addSuffix: true })
                            }
                          </p>
                        </div>
                      </div>
                      <Button 
                        size="sm"
                        variant="ghost"
                        className="text-procurement-primary"
                        asChild
                      >
                        <a href={file.url} download={file.name}>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <FileText className="h-10 w-10 mx-auto text-muted-foreground/60" />
                  <p className="mt-2 text-muted-foreground">No files attached to this request</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions">
          <div className="space-y-4">
            {request.status === "pending" && (isAdmin || isBuyer) && (
              <Card>
                <CardHeader>
                  <CardTitle>Process Request</CardTitle>
                  <CardDescription>
                    Accept or decline this procurement request
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isAdmin && (
                    <div>
                      <Select
                        value={selectedBuyer}
                        onValueChange={setSelectedBuyer}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Assign to buyer" />
                        </SelectTrigger>
                        <SelectContent>
                          {buyers.map((buyer: User) => (
                            <SelectItem key={buyer.id} value={buyer.id}>
                              {buyer.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  <div className="flex space-x-4">
                    <Button 
                      onClick={handleAcceptRequest} 
                      disabled={loading || (!selectedBuyer && isAdmin)}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Accept Request
                    </Button>
                    <Button 
                      variant="outline"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={handleDeclineRequest}
                      disabled={loading}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Decline Request
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {request.status === "accepted" && canManageRequest && (
              <Card>
                <CardHeader>
                  <CardTitle>Update Stage</CardTitle>
                  <CardDescription>
                    Move this request to the next stage in the procurement process
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Select value={stage} onValueChange={(value) => setStage(value as ProcurementStage)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select stage" />
                    </SelectTrigger>
                    <SelectContent>
                      {procurementStages.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Button 
                    onClick={handleUpdateStage} 
                    disabled={loading || stage === request.stage}
                  >
                    Update Stage
                  </Button>
                </CardContent>
              </Card>
            )}

            {request.status !== "declined" && canManageRequest && (
              <Card>
                <CardHeader>
                  <CardTitle>Add Comment</CardTitle>
                  <CardDescription>
                    Add an action item or comment to this request
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Enter action item or comment..."
                    value={actionComment}
                    onChange={(e) => setActionComment(e.target.value)}
                    rows={3}
                  />
                  <Button 
                    onClick={handleAddComment} 
                    disabled={loading || !actionComment.trim()}
                  >
                    Add Comment
                  </Button>
                </CardContent>
              </Card>
            )}

            {request.status === "declined" && (
              <Card>
                <CardHeader>
                  <CardTitle>Request Declined</CardTitle>
                </CardHeader>
                <CardContent>
                  <Alert variant="destructive">
                    <X className="h-4 w-4" />
                    <AlertTitle>This request has been declined</AlertTitle>
                    <AlertDescription>
                      No further actions can be taken on this request.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RequestDetails;
