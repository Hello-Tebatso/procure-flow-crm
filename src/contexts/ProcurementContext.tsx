
import React, { createContext, useContext, useState, useEffect } from "react";
import { ProcurementRequest, RequestFile, RequestItem, User, PerformancePeriod } from "@/types";
import { mockProcurementRequests } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";

interface ProcurementContextType {
  requests: ProcurementRequest[];
  userRequests: ProcurementRequest[];
  createRequest: (request: Partial<ProcurementRequest>) => Promise<ProcurementRequest>;
  updateRequest: (id: string, updates: Partial<ProcurementRequest>) => Promise<ProcurementRequest>;
  getRequestById: (id: string) => ProcurementRequest | undefined;
  uploadFile: (requestId: string, file: File, isPublic?: boolean) => Promise<RequestFile>;
  acceptRequest: (id: string, buyerId: string, updates?: Partial<ProcurementRequest>) => Promise<boolean>;
  declineRequest: (id: string) => Promise<boolean>;
  updateStage: (id: string, stage: ProcurementRequest["stage"]) => Promise<boolean>;
  toggleFileVisibility: (requestId: string, fileId: string) => Promise<boolean>;
  addRequestItem: (requestId: string, item: Partial<RequestItem>) => Promise<RequestItem>;
  updateRequestItem: (requestId: string, itemId: string, updates: Partial<RequestItem>) => Promise<RequestItem>;
  deleteRequestItem: (requestId: string, itemId: string) => Promise<boolean>;
}

const ProcurementContext = createContext<ProcurementContextType | undefined>(undefined);

export const ProcurementProvider: React.FC<{ 
  children: React.ReactNode; 
  currentUser: User | null;
}> = ({ children, currentUser }) => {
  const [requests, setRequests] = useState<ProcurementRequest[]>([]);
  const [userRequests, setUserRequests] = useState<ProcurementRequest[]>([]);
  const { toast } = useToast();

  // Initialize with mock data
  useEffect(() => {
    // Make sure mock data has items array
    const updatedMockData = mockProcurementRequests.map(req => {
      if (!req.items) {
        // Convert the mock data to include items array
        return {
          ...req,
          items: [
            {
              id: `item${Math.random().toString(36).substring(2, 11)}`,
              description: req.description,
              qtyRequested: req.qtyRequested,
              qtyDelivered: req.qtyDelivered,
              qtyPending: req.qtyPending,
              line: 1
            }
          ]
        };
      }
      return req;
    });
    
    setRequests(updatedMockData);
  }, []);

  // Filter requests for current user
  useEffect(() => {
    if (!currentUser) {
      setUserRequests([]);
      return;
    }

    let filtered: ProcurementRequest[];
    
    if (currentUser.role === "admin") {
      // Admins see all requests
      filtered = requests;
    } else if (currentUser.role === "buyer") {
      // Buyers see only assigned requests
      filtered = requests.filter(req => req.buyerId === currentUser.id);
    } else {
      // Clients see their own requests plus public ones assigned to buyers
      filtered = requests.filter(
        (req) => 
          req.clientId === currentUser.id
      );
    }
    
    setUserRequests(filtered);
  }, [requests, currentUser]);

  const createRequest = async (requestData: Partial<ProcurementRequest>): Promise<ProcurementRequest> => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        // If admin is creating a request, use the provided entity
        // For client, use entity from their profile or default
        const entity = currentUser?.role === "admin" 
          ? (requestData.entity || "MGP Investments")
          : "MGP Investments";
          
        // Generate RFQ number if admin, otherwise use default naming
        const rfqNumber = currentUser?.role === "admin" 
          ? (requestData.rfqNumber || `REQ${Math.floor(Math.random() * 1000000)}`)
          : `REQ${Math.floor(Math.random() * 1000000)}`;

        const newRequest: ProcurementRequest = {
          id: `req${requests.length + 1}`,
          rfqNumber,
          poNumber: requestData.poNumber || "",
          entity,
          description: requestData.description || "",
          placeOfDelivery: requestData.placeOfDelivery || "",
          placeOfArrival: currentUser?.role === "admin" ? requestData.placeOfArrival || "" : "",
          qtyRequested: 0, // This is now calculated from items
          qtyDelivered: 0, // This is now calculated from items
          qtyPending: 0, // This is now calculated from items
          stage: "New Request",
          status: "pending",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          clientId: currentUser?.role === "admin" 
            ? (requestData.clientId || currentUser.id) 
            : (currentUser?.id || ""),
          isPublic: false,
          files: requestData.files || [],
          items: requestData.items || [
            {
              id: `item${Math.random().toString(36).substring(2, 11)}`,
              description: requestData.description || "",
              qtyRequested: requestData.qtyRequested || 1,
              qtyDelivered: 0,
              qtyPending: requestData.qtyRequested || 1,
              line: 1
            }
          ]
        };
        
        // Calculate totals from items
        newRequest.qtyRequested = newRequest.items.reduce((total, item) => total + item.qtyRequested, 0);
        newRequest.qtyDelivered = newRequest.items.reduce((total, item) => total + item.qtyDelivered, 0);
        newRequest.qtyPending = newRequest.items.reduce((total, item) => total + item.qtyPending, 0);
        
        const updatedRequests = [...requests, newRequest];
        setRequests(updatedRequests);
        
        toast({
          title: "Request Created",
          description: "Your procurement request has been successfully created",
        });
        
        resolve(newRequest);
      }, 1000);
    });
  };

  const updateRequest = async (id: string, updates: Partial<ProcurementRequest>): Promise<ProcurementRequest> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = requests.findIndex(r => r.id === id);
        
        if (index === -1) {
          toast({
            title: "Error",
            description: "Request not found",
            variant: "destructive"
          });
          reject(new Error("Request not found"));
          return;
        }
        
        const updatedRequest = {
          ...requests[index],
          ...updates,
          updatedAt: new Date().toISOString()
        };
        
        // Recalculate totals if items have changed
        if (updatedRequest.items) {
          updatedRequest.qtyRequested = updatedRequest.items.reduce((total, item) => total + item.qtyRequested, 0);
          updatedRequest.qtyDelivered = updatedRequest.items.reduce((total, item) => total + item.qtyDelivered, 0);
          updatedRequest.qtyPending = updatedRequest.items.reduce((total, item) => total + item.qtyPending, 0);
        }
        
        const updatedRequests = [...requests];
        updatedRequests[index] = updatedRequest;
        setRequests(updatedRequests);
        
        toast({
          title: "Request Updated",
          description: "The request has been successfully updated"
        });
        
        resolve(updatedRequest);
      }, 800);
    });
  };

  const getRequestById = (id: string): ProcurementRequest | undefined => {
    return requests.find(r => r.id === id);
  };

  const uploadFile = async (requestId: string, file: File, isPublic: boolean = false): Promise<RequestFile> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newFile: RequestFile = {
          id: `file${Math.random().toString(36).slice(2, 11)}`,
          name: file.name,
          url: URL.createObjectURL(file),
          size: file.size,
          type: file.type,
          uploadedAt: new Date().toISOString(),
          isPublic // New field to control file visibility
        };
        
        const index = requests.findIndex(r => r.id === requestId);
        
        if (index !== -1) {
          const request = requests[index];
          const files = request.files ? [...request.files, newFile] : [newFile];
          
          const updatedRequest = { ...request, files };
          const updatedRequests = [...requests];
          updatedRequests[index] = updatedRequest;
          setRequests(updatedRequests);
        }
        
        toast({
          title: "File Uploaded",
          description: `${file.name} has been successfully uploaded`
        });
        
        resolve(newFile);
      }, 1500);
    });
  };

  const acceptRequest = async (id: string, buyerId: string, updates?: Partial<ProcurementRequest>): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = requests.findIndex(r => r.id === id);
        
        if (index !== -1) {
          const updatedRequest = {
            ...requests[index],
            status: "accepted" as const,
            buyerId,
            updatedAt: new Date().toISOString(),
            ...updates // Admin can provide additional updates when accepting
          };
          
          const updatedRequests = [...requests];
          updatedRequests[index] = updatedRequest;
          setRequests(updatedRequests);
          
          toast({
            title: "Request Accepted",
            description: "The procurement request has been accepted"
          });
          
          resolve(true);
        } else {
          toast({
            title: "Error",
            description: "Failed to accept request",
            variant: "destructive"
          });
          
          resolve(false);
        }
      }, 800);
    });
  };

  const declineRequest = async (id: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = requests.findIndex(r => r.id === id);
        
        if (index !== -1) {
          const updatedRequest = {
            ...requests[index],
            status: "declined" as const,
            updatedAt: new Date().toISOString()
          };
          
          const updatedRequests = [...requests];
          updatedRequests[index] = updatedRequest;
          setRequests(updatedRequests);
          
          toast({
            title: "Request Declined",
            description: "The procurement request has been declined"
          });
          
          resolve(true);
        } else {
          toast({
            title: "Error",
            description: "Failed to decline request",
            variant: "destructive"
          });
          
          resolve(false);
        }
      }, 800);
    });
  };

  const updateStage = async (id: string, stage: ProcurementRequest["stage"]): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = requests.findIndex(r => r.id === id);
        
        if (index !== -1) {
          const updatedRequest = {
            ...requests[index],
            stage,
            status: stage === "Delivered" ? "completed" as const : requests[index].status,
            updatedAt: new Date().toISOString()
          };
          
          const updatedRequests = [...requests];
          updatedRequests[index] = updatedRequest;
          setRequests(updatedRequests);
          
          toast({
            title: "Stage Updated",
            description: `Request stage updated to ${stage}`
          });
          
          resolve(true);
        } else {
          toast({
            title: "Error",
            description: "Failed to update stage",
            variant: "destructive"
          });
          
          resolve(false);
        }
      }, 800);
    });
  };

  const toggleFileVisibility = async (requestId: string, fileId: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const requestIndex = requests.findIndex(r => r.id === requestId);
        
        if (requestIndex === -1 || !requests[requestIndex].files) {
          toast({
            title: "Error",
            description: "File not found",
            variant: "destructive"
          });
          resolve(false);
          return;
        }
        
        const fileIndex = requests[requestIndex].files!.findIndex(f => f.id === fileId);
        
        if (fileIndex === -1) {
          toast({
            title: "Error",
            description: "File not found",
            variant: "destructive"
          });
          resolve(false);
          return;
        }
        
        // Clone the request and files array
        const updatedRequest = { ...requests[requestIndex] };
        const updatedFiles = [...updatedRequest.files!];
        
        // Toggle the isPublic property of the file
        updatedFiles[fileIndex] = {
          ...updatedFiles[fileIndex],
          isPublic: !updatedFiles[fileIndex].isPublic
        };
        
        // Update the request with the modified files array
        updatedRequest.files = updatedFiles;
        updatedRequest.updatedAt = new Date().toISOString();
        
        // Update the requests array
        const updatedRequests = [...requests];
        updatedRequests[requestIndex] = updatedRequest;
        setRequests(updatedRequests);
        
        toast({
          title: "File Visibility Updated",
          description: updatedFiles[fileIndex].isPublic 
            ? "File is now visible to the client" 
            : "File is now hidden from the client"
        });
        
        resolve(true);
      }, 800);
    });
  };

  const addRequestItem = async (requestId: string, item: Partial<RequestItem>): Promise<RequestItem> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const requestIndex = requests.findIndex(r => r.id === requestId);
        
        if (requestIndex === -1) {
          toast({
            title: "Error",
            description: "Request not found",
            variant: "destructive"
          });
          reject(new Error("Request not found"));
          return;
        }
        
        // Create new item
        const newItem: RequestItem = {
          id: `item${Math.random().toString(36).substring(2, 11)}`,
          description: item.description || "",
          qtyRequested: item.qtyRequested || 1,
          qtyDelivered: item.qtyDelivered || 0,
          qtyPending: (item.qtyRequested || 1) - (item.qtyDelivered || 0),
          line: requests[requestIndex].items.length + 1,
          ...item
        };
        
        // Add item to request
        const updatedRequest = { ...requests[requestIndex] };
        updatedRequest.items = [...updatedRequest.items, newItem];
        updatedRequest.updatedAt = new Date().toISOString();
        
        // Recalculate request totals
        updatedRequest.qtyRequested = updatedRequest.items.reduce((total, item) => total + item.qtyRequested, 0);
        updatedRequest.qtyDelivered = updatedRequest.items.reduce((total, item) => total + item.qtyDelivered, 0);
        updatedRequest.qtyPending = updatedRequest.items.reduce((total, item) => total + item.qtyPending, 0);
        
        // Update requests array
        const updatedRequests = [...requests];
        updatedRequests[requestIndex] = updatedRequest;
        setRequests(updatedRequests);
        
        toast({
          title: "Item Added",
          description: "New item has been added to the request"
        });
        
        resolve(newItem);
      }, 800);
    });
  };

  const updateRequestItem = async (requestId: string, itemId: string, updates: Partial<RequestItem>): Promise<RequestItem> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const requestIndex = requests.findIndex(r => r.id === requestId);
        
        if (requestIndex === -1) {
          toast({
            title: "Error",
            description: "Request not found",
            variant: "destructive"
          });
          reject(new Error("Request not found"));
          return;
        }
        
        const itemIndex = requests[requestIndex].items.findIndex(i => i.id === itemId);
        
        if (itemIndex === -1) {
          toast({
            title: "Error",
            description: "Item not found",
            variant: "destructive"
          });
          reject(new Error("Item not found"));
          return;
        }
        
        // Update item
        const updatedItem = {
          ...requests[requestIndex].items[itemIndex],
          ...updates
        };
        
        // Recalculate pending quantity
        if (updates.qtyRequested !== undefined || updates.qtyDelivered !== undefined) {
          updatedItem.qtyPending = updatedItem.qtyRequested - updatedItem.qtyDelivered;
        }
        
        // Update request with modified item
        const updatedRequest = { ...requests[requestIndex] };
        const updatedItems = [...updatedRequest.items];
        updatedItems[itemIndex] = updatedItem;
        updatedRequest.items = updatedItems;
        updatedRequest.updatedAt = new Date().toISOString();
        
        // Recalculate request totals
        updatedRequest.qtyRequested = updatedItems.reduce((total, item) => total + item.qtyRequested, 0);
        updatedRequest.qtyDelivered = updatedItems.reduce((total, item) => total + item.qtyDelivered, 0);
        updatedRequest.qtyPending = updatedItems.reduce((total, item) => total + item.qtyPending, 0);
        
        // Update requests array
        const updatedRequests = [...requests];
        updatedRequests[requestIndex] = updatedRequest;
        setRequests(updatedRequests);
        
        toast({
          title: "Item Updated",
          description: "Item has been successfully updated"
        });
        
        resolve(updatedItem);
      }, 800);
    });
  };

  const deleteRequestItem = async (requestId: string, itemId: string): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const requestIndex = requests.findIndex(r => r.id === requestId);
        
        if (requestIndex === -1) {
          toast({
            title: "Error",
            description: "Request not found",
            variant: "destructive"
          });
          reject(new Error("Request not found"));
          return;
        }
        
        // Don't allow deleting the only item
        if (requests[requestIndex].items.length <= 1) {
          toast({
            title: "Error",
            description: "Cannot delete the only item in a request",
            variant: "destructive"
          });
          resolve(false);
          return;
        }
        
        // Remove item from request
        const updatedRequest = { ...requests[requestIndex] };
        updatedRequest.items = updatedRequest.items.filter(i => i.id !== itemId);
        updatedRequest.updatedAt = new Date().toISOString();
        
        // Recalculate request totals
        updatedRequest.qtyRequested = updatedRequest.items.reduce((total, item) => total + item.qtyRequested, 0);
        updatedRequest.qtyDelivered = updatedRequest.items.reduce((total, item) => total + item.qtyDelivered, 0);
        updatedRequest.qtyPending = updatedRequest.items.reduce((total, item) => total + item.qtyPending, 0);
        
        // Update line numbers
        updatedRequest.items = updatedRequest.items.map((item, index) => ({
          ...item,
          line: index + 1
        }));
        
        // Update requests array
        const updatedRequests = [...requests];
        updatedRequests[requestIndex] = updatedRequest;
        setRequests(updatedRequests);
        
        toast({
          title: "Item Deleted",
          description: "Item has been removed from the request"
        });
        
        resolve(true);
      }, 800);
    });
  };

  return (
    <ProcurementContext.Provider 
      value={{ 
        requests,
        userRequests,
        createRequest,
        updateRequest,
        getRequestById,
        uploadFile,
        acceptRequest,
        declineRequest,
        updateStage,
        toggleFileVisibility,
        addRequestItem,
        updateRequestItem,
        deleteRequestItem
      }}
    >
      {children}
    </ProcurementContext.Provider>
  );
};

export const useProcurement = () => {
  const context = useContext(ProcurementContext);
  
  if (context === undefined) {
    throw new Error("useProcurement must be used within a ProcurementProvider");
  }
  
  return context;
};
