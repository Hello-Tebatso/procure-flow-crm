
import { useProcurement } from "@/contexts/ProcurementContext";
import { useAuth } from "@/contexts/AuthContext";
import { ProcurementRequest, ProcurementStage, RequestFile, RequestItem, User } from "@/types";
import { mockUsers } from "@/lib/mock-data";
import { useState } from "react";
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
  Eye,
  EyeOff, 
  FileText, 
  Pencil,
  Plus,
  Trash2,
  Upload, 
  X 
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

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
    toggleFileVisibility,
    uploadFile,
    addRequestItem,
    updateRequestItem,
    deleteRequestItem
  } = useProcurement();
  const { toast } = useToast();

  const [stage, setStage] = useState<ProcurementStage>(request.stage);
  const [loading, setLoading] = useState(false);
  const [actionComment, setActionComment] = useState("");
  const [selectedBuyer, setSelectedBuyer] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [newItemDialogOpen, setNewItemDialogOpen] = useState(false);
  const [newItem, setNewItem] = useState<Partial<RequestItem>>({
    description: "",
    qtyRequested: 1
  });
  const [editingItem, setEditingItem] = useState<RequestItem | null>(null);
  const [editItemDialogOpen, setEditItemDialogOpen] = useState(false);
  const [acceptDialogOpen, setAcceptDialogOpen] = useState(false);
  const [acceptFormData, setAcceptFormData] = useState({
    entity: request.entity || "MGP Investments",
    placeOfDelivery: request.placeOfDelivery || "",
    placeOfArrival: request.placeOfArrival || "",
  });
  
  const buyers = mockUsers.filter(u => u.role === "buyer");
  const requestBuyer = request.buyerId 
    ? mockUsers.find(u => u.id === request.buyerId) 
    : null;

  const isAdmin = user?.role === "admin";
  const isBuyer = user?.role === "buyer";
  const isClient = user?.role === "client";
  const isAssignedBuyer = user?.id === request.buyerId;
  const canManageRequest = isAdmin || isAssignedBuyer;
  
  const handleAcceptRequest = async () => {
    if (isAdmin && !selectedBuyer) {
      toast({
        title: "Error",
        description: "Please select a buyer to assign the request",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    const success = await acceptRequest(
      request.id, 
      selectedBuyer,
      isAdmin ? {
        entity: acceptFormData.entity,
        placeOfDelivery: acceptFormData.placeOfDelivery,
        placeOfArrival: acceptFormData.placeOfArrival
      } : undefined
    );
    setLoading(false);
    setAcceptDialogOpen(false);
    
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
  
  const handleToggleFileVisibility = async (fileId: string) => {
    setLoading(true);
    const success = await toggleFileVisibility(request.id, fileId);
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

  const handleAddItem = async () => {
    if (!newItem.description) {
      toast({
        title: "Error",
        description: "Item description is required",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      await addRequestItem(request.id, newItem);
      setNewItem({ description: "", qtyRequested: 1 });
      setNewItemDialogOpen(false);
      onUpdate();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateItem = async () => {
    if (!editingItem || !editingItem.description) {
      toast({
        title: "Error",
        description: "Item description is required",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      await updateRequestItem(request.id, editingItem.id, editingItem);
      setEditingItem(null);
      setEditItemDialogOpen(false);
      onUpdate();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update item",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (request.items.length <= 1) {
      toast({
        title: "Error",
        description: "Cannot delete the only item in a request",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      await deleteRequestItem(request.id, itemId);
      onUpdate();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete item",
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
                  <p className="text-sm text-muted-foreground">Total Quantity Requested</p>
                  <p className="font-medium">{request.qtyRequested}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total Quantity Delivered</p>
                  <p className="font-medium">{request.qtyDelivered}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total Quantity Pending</p>
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
        
        <TabsContent value="items" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>Request Items</CardTitle>
              {canManageRequest && request.status === "accepted" && (
                <Dialog open={newItemDialogOpen} onOpenChange={setNewItemDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Item</DialogTitle>
                      <DialogDescription>
                        Add a new item to this procurement request
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <label htmlFor="item-description" className="text-sm font-medium">
                          Description
                        </label>
                        <Textarea
                          id="item-description"
                          value={newItem.description}
                          onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                          placeholder="Item description"
                          rows={3}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="item-qty" className="text-sm font-medium">
                          Quantity Requested
                        </label>
                        <Input
                          id="item-qty"
                          type="number"
                          min="1"
                          value={newItem.qtyRequested}
                          onChange={(e) => setNewItem({...newItem, qtyRequested: Number(e.target.value)})}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="item-number" className="text-sm font-medium">
                          Item Number (Optional)
                        </label>
                        <Input
                          id="item-number"
                          value={newItem.itemNumber || ""}
                          onChange={(e) => setNewItem({...newItem, itemNumber: e.target.value})}
                          placeholder="Item or part number"
                        />
                      </div>
                    </div>
                    
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setNewItemDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="button" onClick={handleAddItem} disabled={loading}>
                        {loading ? "Adding..." : "Add Item"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Line</TableHead>
                    <TableHead>Item #</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Qty Requested</TableHead>
                    <TableHead className="text-right">Qty Delivered</TableHead>
                    <TableHead className="text-right">Qty Pending</TableHead>
                    {canManageRequest && request.status === "accepted" && (
                      <TableHead className="text-right">Actions</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {request.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.line}</TableCell>
                      <TableCell>{item.itemNumber || "—"}</TableCell>
                      <TableCell className="max-w-xs truncate">{item.description}</TableCell>
                      <TableCell className="text-right">{item.qtyRequested}</TableCell>
                      <TableCell className="text-right">{item.qtyDelivered}</TableCell>
                      <TableCell className="text-right">{item.qtyPending}</TableCell>
                      {canManageRequest && request.status === "accepted" && (
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Dialog open={editItemDialogOpen && editingItem?.id === item.id} onOpenChange={(open) => {
                              if (!open) setEditingItem(null);
                              setEditItemDialogOpen(open);
                            }}>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setEditingItem({...item})}
                                >
                                  <Pencil className="h-4 w-4" />
                                  <span className="sr-only">Edit</span>
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Edit Item</DialogTitle>
                                  <DialogDescription>
                                    Update item details
                                  </DialogDescription>
                                </DialogHeader>
                                
                                {editingItem && (
                                  <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                      <label htmlFor="edit-description" className="text-sm font-medium">
                                        Description
                                      </label>
                                      <Textarea
                                        id="edit-description"
                                        value={editingItem.description}
                                        onChange={(e) => setEditingItem({...editingItem, description: e.target.value})}
                                        rows={3}
                                      />
                                    </div>
                                    
                                    <div className="space-y-2">
                                      <label htmlFor="edit-item-number" className="text-sm font-medium">
                                        Item Number
                                      </label>
                                      <Input
                                        id="edit-item-number"
                                        value={editingItem.itemNumber || ""}
                                        onChange={(e) => setEditingItem({...editingItem, itemNumber: e.target.value})}
                                      />
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="space-y-2">
                                        <label htmlFor="edit-qty-requested" className="text-sm font-medium">
                                          Quantity Requested
                                        </label>
                                        <Input
                                          id="edit-qty-requested"
                                          type="number"
                                          min="1"
                                          value={editingItem.qtyRequested}
                                          onChange={(e) => setEditingItem({
                                            ...editingItem, 
                                            qtyRequested: Number(e.target.value),
                                            qtyPending: Number(e.target.value) - editingItem.qtyDelivered
                                          })}
                                        />
                                      </div>
                                      
                                      <div className="space-y-2">
                                        <label htmlFor="edit-qty-delivered" className="text-sm font-medium">
                                          Quantity Delivered
                                        </label>
                                        <Input
                                          id="edit-qty-delivered"
                                          type="number"
                                          min="0"
                                          max={editingItem.qtyRequested}
                                          value={editingItem.qtyDelivered}
                                          onChange={(e) => setEditingItem({
                                            ...editingItem, 
                                            qtyDelivered: Number(e.target.value),
                                            qtyPending: editingItem.qtyRequested - Number(e.target.value)
                                          })}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                )}
                                
                                <DialogFooter>
                                  <Button type="button" variant="outline" onClick={() => {
                                    setEditingItem(null);
                                    setEditItemDialogOpen(false);
                                  }}>
                                    Cancel
                                  </Button>
                                  <Button type="button" onClick={handleUpdateItem} disabled={loading}>
                                    {loading ? "Updating..." : "Update Item"}
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDeleteItem(item.id)}
                              disabled={loading || request.items.length <= 1}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
                      <div className="flex items-center space-x-2">
                        {canManageRequest && (
                          <Button 
                            size="sm"
                            variant="ghost"
                            className={file.isPublic ? "text-green-600" : "text-amber-600"}
                            onClick={() => handleToggleFileVisibility(file.id)}
                          >
                            {file.isPublic ? (
                              <>
                                <Eye className="h-4 w-4 mr-2" />
                                Public
                              </>
                            ) : (
                              <>
                                <EyeOff className="h-4 w-4 mr-2" />
                                Private
                              </>
                            )}
                          </Button>
                        )}
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
                    {isAdmin ? "Assign to a buyer and accept this request" : "Accept or decline this procurement request"}
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
                    {isAdmin ? (
                      <Dialog open={acceptDialogOpen} onOpenChange={setAcceptDialogOpen}>
                        <DialogTrigger asChild>
                          <Button 
                            disabled={!selectedBuyer}
                          >
                            <Check className="h-4 w-4 mr-2" />
                            Accept & Configure
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Accept Request</DialogTitle>
                            <DialogDescription>
                              Configure additional details before accepting the request
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <label htmlFor="entity" className="text-sm font-medium">
                                Entity
                              </label>
                              <Input
                                id="entity"
                                value={acceptFormData.entity}
                                onChange={(e) => setAcceptFormData({...acceptFormData, entity: e.target.value})}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <label htmlFor="placeOfDelivery" className="text-sm font-medium">
                                Place of Delivery
                              </label>
                              <Input
                                id="placeOfDelivery"
                                value={acceptFormData.placeOfDelivery}
                                onChange={(e) => setAcceptFormData({...acceptFormData, placeOfDelivery: e.target.value})}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <label htmlFor="placeOfArrival" className="text-sm font-medium">
                                Place of Arrival (Optional)
                              </label>
                              <Input
                                id="placeOfArrival"
                                value={acceptFormData.placeOfArrival}
                                onChange={(e) => setAcceptFormData({...acceptFormData, placeOfArrival: e.target.value})}
                              />
                            </div>
                          </div>
                          
                          <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setAcceptDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button 
                              type="button" 
                              onClick={handleAcceptRequest} 
                              disabled={loading || !acceptFormData.entity || !acceptFormData.placeOfDelivery}
                            >
                              {loading ? "Accepting..." : "Accept Request"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    ) : (
                      <Button 
                        onClick={handleAcceptRequest}
                        disabled={loading}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Accept Request
                      </Button>
                    )}
                    
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
