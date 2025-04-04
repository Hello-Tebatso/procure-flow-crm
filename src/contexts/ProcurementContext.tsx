
import React, { createContext, useContext, useState, useEffect } from "react";
import { ProcurementRequest, RequestFile, User } from "@/types";
import { mockProcurementRequests } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";

interface ProcurementContextType {
  requests: ProcurementRequest[];
  userRequests: ProcurementRequest[];
  createRequest: (request: Partial<ProcurementRequest>) => Promise<ProcurementRequest>;
  updateRequest: (id: string, updates: Partial<ProcurementRequest>) => Promise<ProcurementRequest>;
  getRequestById: (id: string) => ProcurementRequest | undefined;
  uploadFile: (requestId: string, file: File) => Promise<RequestFile>;
  acceptRequest: (id: string, buyerId: string) => Promise<boolean>;
  declineRequest: (id: string) => Promise<boolean>;
  updateStage: (id: string, stage: ProcurementRequest["stage"]) => Promise<boolean>;
  togglePublicStatus: (id: string) => Promise<boolean>;
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
    setRequests(mockProcurementRequests);
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
      // Buyers see assigned requests or unassigned ones
      filtered = requests.filter(
        (req) => 
          req.buyerId === currentUser.id || 
          (req.status === "pending" && !req.buyerId)
      );
    } else {
      // Clients see their own requests plus public ones assigned to buyers
      filtered = requests.filter(
        (req) => 
          req.clientId === currentUser.id || 
          (req.isPublic && req.clientId === currentUser.id)
      );
    }
    
    setUserRequests(filtered);
  }, [requests, currentUser]);

  const createRequest = async (requestData: Partial<ProcurementRequest>): Promise<ProcurementRequest> => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const newRequest: ProcurementRequest = {
          id: `req${requests.length + 1}`,
          rfqNumber: requestData.rfqNumber || `REQ${Math.floor(Math.random() * 1000000)}`,
          poNumber: requestData.poNumber || "",
          entity: requestData.entity || "",
          description: requestData.description || "",
          placeOfDelivery: requestData.placeOfDelivery || "",
          placeOfArrival: requestData.placeOfArrival || "",
          qtyRequested: requestData.qtyRequested || 0,
          qtyDelivered: 0,
          qtyPending: requestData.qtyRequested || 0,
          stage: "New Request",
          status: "pending",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          clientId: currentUser?.id || "",
          isPublic: false,
          files: requestData.files || []
        };
        
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

  const uploadFile = async (requestId: string, file: File): Promise<RequestFile> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newFile: RequestFile = {
          id: `file${Math.random().toString(36).slice(2, 11)}`,
          name: file.name,
          url: URL.createObjectURL(file),
          size: file.size,
          type: file.type,
          uploadedAt: new Date().toISOString()
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

  const acceptRequest = async (id: string, buyerId: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = requests.findIndex(r => r.id === id);
        
        if (index !== -1) {
          const updatedRequest = {
            ...requests[index],
            status: "accepted" as const,
            buyerId,
            updatedAt: new Date().toISOString()
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

  const togglePublicStatus = async (id: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = requests.findIndex(r => r.id === id);
        
        if (index !== -1) {
          const currentStatus = requests[index].isPublic;
          const updatedRequest = {
            ...requests[index],
            isPublic: !currentStatus,
            updatedAt: new Date().toISOString()
          };
          
          const updatedRequests = [...requests];
          updatedRequests[index] = updatedRequest;
          setRequests(updatedRequests);
          
          toast({
            title: "Visibility Updated",
            description: updatedRequest.isPublic 
              ? "Request is now visible to the client" 
              : "Request is now hidden from the client"
          });
          
          resolve(true);
        } else {
          toast({
            title: "Error",
            description: "Failed to update visibility",
            variant: "destructive"
          });
          
          resolve(false);
        }
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
        togglePublicStatus
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
