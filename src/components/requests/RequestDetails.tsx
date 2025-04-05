
import { useProcurement } from "@/contexts/ProcurementContext";
import { useAuth } from "@/contexts/AuthContext";
import { ProcurementRequest, ProcurementStage, RequestFile, User, RequestItem } from "@/types";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
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
  Edit,
  Eye,
  EyeOff, 
  FileText, 
  Upload, 
  X,
  Loader,
  Plus,
  Trash 
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Define schemas for forms
const requestEditSchema = z.object({
  description: z.string().min(5, "Description must be at least 5 characters"),
  entity: z.string().min(2, "Entity must be at least 2 characters"),
  placeOfDelivery: z.string().min(2, "Place of delivery is required"),
  placeOfArrival: z.string().optional(),
  expDeliveryDate: z.string().optional(),
  poNumber: z.string().optional(),
});

const requestItemSchema = z.object({
  itemNumber: z.string().min(1, "Item number is required"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  qtyRequested: z.coerce.number().positive("Quantity must be positive"),
  unitPrice: z.coerce.number().positive("Unit price must be positive").optional(),
});

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
    uploadFile,
    addOrUpdateRequestItem,
    getRequestItems
  } = useProcurement();
  const { toast } = useToast();

  const [stage, setStage] = useState<ProcurementStage>(request.stage);
  const [loading, setLoading] = useState(false);
  const [actionComment, setActionComment] = useState("");
  const [selectedBuyer, setSelectedBuyer] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [requestItems, setRequestItems] = useState<RequestItem[]>(request.items || []);
  const [selectedItem, setSelectedItem] = useState<RequestItem | null>(null);
  
  // Initialize forms
  const editForm = useForm<z.infer<typeof requestEditSchema>>({
    resolver: zodResolver(requestEditSchema),
    defaultValues: {
      description: request.description,
      entity: request.entity,
      placeOfDelivery: request.placeOfDelivery,
      placeOfArrival: request.placeOfArrival || "",
      expDeliveryDate: request.expDeliveryDate ? new Date(request.expDeliveryDate).toISOString().split("T")[0] : "",
      poNumber: request.poNumber || "",
    }
  });

  const itemForm = useForm<z.infer<typeof requestItemSchema>>({
    resolver: zodResolver(requestItemSchema),
    defaultValues: {
      itemNumber: "",
      description: "",
      qtyRequested: 1,
      unitPrice: undefined,
    }
  });
  
  // Fetch items
  useEffect(() => {
    if (request.id) {
      const fetchItems = async () => {
        const items = await getRequestItems(request.id);
        setRequestItems(items);
      };
      
      fetchItems();
    }
  }, [request.id, getRequestItems]);
  
  const isAdmin = user?.role === "admin";
  const isBuyer = user?.role === "buyer";
  const isClient = user?.role === "client";
  const isAssignedBuyer = user?.id === request.buyerId;
  const canManageRequest = isAdmin || isAssignedBuyer;
  
  // Check if client can edit this request (pending and not assigned to a buyer)
  const canClientEditRequest = isClient && 
    user?.id === request.clientId && 
    request.status === 'pending' && 
    !request.buyerId;
  
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
  
  const handleSaveRequestEdit = async (data: z.infer<typeof requestEditSchema>) => {
    setLoading(true);
    
    try {
      const updatedRequest = await updateRequest(request.id, {
        description: data.description,
        entity: data.entity,
        placeOfDelivery: data.placeOfDelivery,
        placeOfArrival: data.placeOfArrival,
        expDeliveryDate: data.expDeliveryDate,
        poNumber: data.poNumber,
      });
      
      if (updatedRequest) {
        toast({
          title: "Request Updated",
          description: "Your changes have been saved successfully"
        });
        
        setEditDialogOpen(false);
        onUpdate();
      }
    } catch (error) {
      console.error("Error updating request:", error);
      toast({
        title: "Error",
        description: "Failed to update the request",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const openAddItemDialog = () => {
    setSelectedItem(null);
    itemForm.reset({
      itemNumber: "",
      description: "",
      qtyRequested: 1,
      unitPrice: undefined,
    });
    setItemDialogOpen(true);
  };
  
  const openEditItemDialog = (item: RequestItem) => {
    setSelectedItem(item);
    itemForm.reset({
      itemNumber: item.itemNumber,
      description: item.description,
      qtyRequested: item.qtyRequested,
      unitPrice: item.unitPrice,
    });
    setItemDialogOpen(true);
  };
  
  const handleSaveItem = async (data: z.infer<typeof requestItemSchema>) => {
    setLoading(true);
    
    try {
      const totalPrice = data.unitPrice ? data.unitPrice * data.qtyRequested : undefined;
      
      const itemData: Partial<RequestItem> = {
        ...data,
        totalPrice,
        requestId: request.id,
      };
      
      if (selectedItem) {
        itemData.id = selectedItem.id;
      }
      
      const savedItem = await addOrUpdateRequestItem(request.id, itemData);
      
      if (savedItem) {
        // Update the items list
        if (selectedItem) {
          setRequestItems(prev => prev.map(item => 
            item.id === savedItem.id ? savedItem : item
          ));
        } else {
          setRequestItems(prev => [...prev, savedItem]);
        }
        
        toast({
          title: selectedItem ? "Item Updated" : "Item Added",
          description: `Item has been ${selectedItem ? "updated" : "added"} successfully`
        });
        
        setItemDialogOpen(false);
        // Refresh request data
        onUpdate();
      }
    } catch (error) {
      console.error("Error saving item:", error);
      toast({
        title: "Error",
        description: "Failed to save the item",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
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
          
          {/* Edit button for clients with pending unassigned requests */}
          {canClientEditRequest && (
            <Button 
              size="sm"
              variant="outline"
              onClick={() => setEditDialogOpen(true)}
            >
              <Edit className="h-3.5 w-3.5 mr-1" />
              Edit
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="details" className="w-full">
        <TabsList className="w-full md:w-auto">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="items">Items</TabsTrigger>
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
            
            {canClientEditRequest && (
              <CardFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setEditDialogOpen(true)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Request
                </Button>
              </CardFooter>
            )}
          </Card>

          {request.buyerId && (
            <Card>
              <CardHeader>
                <CardTitle>Assigned Buyer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback>
                      {request.buyer?.[0] || "B"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{request.buyer}</p>
                    <p className="text-sm text-muted-foreground">MGP Procurement</p>
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

        <TabsContent value="items">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Request Items</CardTitle>
                {(canManageRequest || canClientEditRequest) && (
                  <Button size="sm" onClick={openAddItemDialog}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                )}
              </div>
              <CardDescription>
                Products and materials requested
              </CardDescription>
            </CardHeader>
            <CardContent>
              {requestItems.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item #</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead className="text-right">Unit Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        {(canManageRequest || canClientEditRequest) && (
                          <TableHead className="text-right">Actions</TableHead>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {requestItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.itemNumber}</TableCell>
                          <TableCell>{item.description}</TableCell>
                          <TableCell className="text-right">{item.qtyRequested}</TableCell>
                          <TableCell className="text-right">
                            {item.unitPrice 
                              ? `$${item.unitPrice.toFixed(2)}` 
                              : "-"}
                          </TableCell>
                          <TableCell className="text-right">
                            {item.totalPrice 
                              ? `$${item.totalPrice.toFixed(2)}` 
                              : "-"}
                          </TableCell>
                          {(canManageRequest || canClientEditRequest) && (
                            <TableCell className="text-right">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => openEditItemDialog(item)}
                              >
                                <Edit className="h-4 w-4 text-blue-500" />
                              </Button>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground">No items added to this request</p>
                  {(canManageRequest || canClientEditRequest) && (
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={openAddItemDialog}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Item
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
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
              {(canManageRequest || canClientEditRequest) && (
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
            {request.status === "pending" && isAdmin && (
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
                          <SelectItem value="e8fd159b-57c4-4d36-9bd7-a59ca13057ef">Gabriel Zau</SelectItem>
                          <SelectItem value="1d23342a-82a3-4ac8-a73f-4c800d22b2ac">Bernado Buela</SelectItem>
                          <SelectItem value="c4e125c3-4964-4a8b-b903-18f764b22rte">Magreth Smith</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  <div className="flex space-x-4">
                    <Button 
                      onClick={handleAcceptRequest} 
                      disabled={loading || !selectedBuyer}
                    >
                      {loading ? <Loader className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
                      Accept Request
                    </Button>
                    <Button 
                      variant="outline"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={handleDeclineRequest}
                      disabled={loading}
                    >
                      {loading ? <Loader className="h-4 w-4 mr-2 animate-spin" /> : <X className="h-4 w-4 mr-2" />}
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
                    {loading ? <Loader className="h-4 w-4 mr-2 animate-spin" /> : null}
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
                    {loading ? <Loader className="h-4 w-4 mr-2 animate-spin" /> : null}
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
      
      {/* Edit Request Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Request</DialogTitle>
            <DialogDescription>
              Update the details of your procurement request
            </DialogDescription>
          </DialogHeader>
          
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleSaveRequestEdit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="entity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Entity</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="poNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PO Number (optional)</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="placeOfDelivery"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Place of Delivery</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="placeOfArrival"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Place of Arrival (optional)</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={editForm.control}
                name="expDeliveryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expected Delivery Date (optional)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="submit" disabled={loading}>
                  {loading ? <Loader className="h-4 w-4 mr-2 animate-spin" /> : null}
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Add/Edit Item Dialog */}
      <Dialog open={itemDialogOpen} onOpenChange={setItemDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedItem ? "Edit Item" : "Add New Item"}</DialogTitle>
            <DialogDescription>
              {selectedItem 
                ? "Update the details of this item" 
                : "Add a new item to this procurement request"}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...itemForm}>
            <form onSubmit={itemForm.handleSubmit(handleSaveItem)} className="space-y-4">
              <FormField
                control={itemForm.control}
                name="itemNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Item Number</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={itemForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea rows={2} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={itemForm.control}
                  name="qtyRequested"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={itemForm.control}
                  name="unitPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit Price (optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter>
                <Button type="submit" disabled={loading}>
                  {loading ? <Loader className="h-4 w-4 mr-2 animate-spin" /> : null}
                  {selectedItem ? "Update Item" : "Add Item"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RequestDetails;
