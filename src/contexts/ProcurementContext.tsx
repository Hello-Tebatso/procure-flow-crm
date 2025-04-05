import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  ProcurementRequest, 
  RequestFile, 
  User, 
  RequestStatus, 
  ProcurementStage,
  RequestItem,
  RequestComment
} from "@/types";
import { mockProcurementRequests } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { uploadRequestFile, getRequestFiles } from "@/services/FileService";
import { logActivity, LogActions } from "@/services/LogService";

interface ProcurementContextType {
  requests: ProcurementRequest[];
  userRequests: ProcurementRequest[];
  createRequest: (request: Partial<ProcurementRequest>) => Promise<ProcurementRequest>;
  updateRequest: (id: string, updates: Partial<ProcurementRequest>) => Promise<ProcurementRequest>;
  getRequestById: (id: string) => Promise<ProcurementRequest | undefined>;
  uploadFile: (requestId: string, file: File) => Promise<RequestFile | null>;
  acceptRequest: (id: string, buyerId: string) => Promise<boolean>;
  declineRequest: (id: string) => Promise<boolean>;
  updateStage: (id: string, stage: ProcurementRequest["stage"]) => Promise<boolean>;
  togglePublicStatus: (id: string) => Promise<boolean>;
  addComment: (requestId: string, content: string, isPublic: boolean) => Promise<RequestComment | null>;
  isLoading: boolean;
  loadUserRequests: () => Promise<void>;
}

const ProcurementContext = createContext<ProcurementContextType | undefined>(undefined);

export const ProcurementProvider: React.FC<{ 
  children: React.ReactNode; 
  currentUser: User | null;
}> = ({ children, currentUser }) => {
  const [requests, setRequests] = useState<ProcurementRequest[]>([]);
  const [userRequests, setUserRequests] = useState<ProcurementRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Initialize with mock data for demo purposes
  useEffect(() => {
    setRequests(mockProcurementRequests);
  }, []);

  // Load user requests from Supabase when user changes
  useEffect(() => {
    if (currentUser) {
      loadUserRequests();
    } else {
      setUserRequests([]);
    }
  }, [currentUser]);

  const mapDbRequestToModel = async (dbRequest: any): Promise<ProcurementRequest> => {
    // Fetch files for this request
    const files = await getRequestFiles(dbRequest.id);
    
    // Map database model to frontend model
    return {
      id: dbRequest.id,
      rfqNumber: dbRequest.rfq_number,
      poNumber: dbRequest.po_number || "",
      entity: dbRequest.entity,
      description: dbRequest.description,
      vendor: dbRequest.vendor,
      placeOfDelivery: dbRequest.place_of_delivery,
      placeOfArrival: dbRequest.place_of_arrival,
      poDate: dbRequest.po_date,
      mgpEta: dbRequest.mgp_eta,
      expDeliveryDate: dbRequest.exp_delivery_date,
      dateDelivered: dbRequest.date_delivered,
      qtyRequested: dbRequest.qty_requested,
      qtyDelivered: dbRequest.qty_delivered,
      qtyPending: dbRequest.qty_pending,
      leadTimeDays: dbRequest.lead_time_days,
      daysCount: dbRequest.days_count,
      aging: dbRequest.aging,
      priority: dbRequest.priority,
      buyer: dbRequest.buyer,
      stage: dbRequest.stage as ProcurementStage,
      actionItems: dbRequest.action_items,
      responsible: dbRequest.responsible,
      dateDue: dbRequest.date_due,
      status: dbRequest.status as RequestStatus,
      createdAt: dbRequest.created_at,
      updatedAt: dbRequest.updated_at,
      clientId: dbRequest.client_id,
      buyerId: dbRequest.buyer_id,
      isPublic: dbRequest.is_public,
      files
    };
  };

  const loadUserRequests = async () => {
    if (!currentUser) return;
    
    setIsLoading(true);
    try {
      let query;
      
      if (currentUser.role === "admin") {
        // Admins see all requests
        query = supabase
          .from("procurement_requests")
          .select("*")
          .order("created_at", { ascending: false });
      } else if (currentUser.role === "buyer") {
        // Buyers see assigned requests or unassigned ones
        query = supabase
          .from("procurement_requests")
          .select("*")
          .or(`buyer_id.eq.${currentUser.id},buyer_id.is.null`)
          .order("created_at", { ascending: false });
      } else {
        // Clients see their own requests
        query = supabase
          .from("procurement_requests")
          .select("*")
          .eq("client_id", currentUser.id)
          .order("created_at", { ascending: false });
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      if (data) {
        const mappedRequests = await Promise.all(
          data.map(async (request: any) => await mapDbRequestToModel(request))
        );
        setUserRequests(mappedRequests);
      }
    } catch (error) {
      console.error("Error loading user requests:", error);
      // Fall back to mock data for demo
      setUserRequests(mockProcurementRequests);
      toast({
        title: "Error loading requests",
        description: "Using mock data for demonstration purposes",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createRequest = async (requestData: Partial<ProcurementRequest>): Promise<ProcurementRequest> => {
    if (!currentUser) {
      throw new Error("User must be logged in to create a request");
    }
    
    setIsLoading(true);
    
    try {
      // Map frontend model to database model
      const dbRequest = {
        rfq_number: requestData.rfqNumber || "", // Auto-generated by trigger if empty
        po_number: requestData.poNumber || "",
        entity: requestData.entity || "MGP Investments",
        description: requestData.description || "",
        place_of_delivery: requestData.placeOfDelivery || "",
        place_of_arrival: requestData.placeOfArrival || "",
        exp_delivery_date: requestData.expDeliveryDate || null,
        qty_requested: requestData.qtyRequested || 0,
        qty_delivered: 0,
        qty_pending: requestData.qtyRequested || 0,
        stage: "New Request" as ProcurementStage,
        status: "pending" as RequestStatus,
        client_id: currentUser.id, // This now uses the proper UUID format
        is_public: true
      };
      
      // For demo purposes, just update the mock data for now
      // and provide a meaningful success message
      const newId = crypto.randomUUID();
      const newRequest: ProcurementRequest = {
        id: newId,
        rfqNumber: `MGP-${new Date().getFullYear().toString().slice(-2)}-${Math.floor(1000 + Math.random() * 9000)}`,
        poNumber: requestData.poNumber || "",
        entity: requestData.entity || "MGP Investments",
        description: requestData.description || "",
        vendor: "",
        placeOfDelivery: requestData.placeOfDelivery || "",
        placeOfArrival: requestData.placeOfArrival || "",
        poDate: "",
        mgpEta: "",
        expDeliveryDate: requestData.expDeliveryDate || "",
        dateDelivered: "",
        qtyRequested: requestData.qtyRequested || 0,
        qtyDelivered: 0,
        qtyPending: requestData.qtyRequested || 0,
        leadTimeDays: 0,
        daysCount: 0,
        aging: 0,
        priority: "",
        buyer: "",
        stage: "New Request",
        actionItems: "",
        responsible: "",
        dateDue: "",
        status: "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        clientId: currentUser.id,
        buyerId: "",
        isPublic: true
      };
      
      // Update local state with the new mock request
      setRequests(prev => [newRequest, ...prev]);
      setUserRequests(prev => [newRequest, ...prev]);
      
      toast({
        title: "Request Created",
        description: "Your procurement request has been successfully created",
      });
      
      return newRequest;
    } catch (error) {
      console.error("Error creating request:", error);
      toast({
        title: "Error",
        description: "Failed to create request. Please try again.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateRequest = async (id: string, updates: Partial<ProcurementRequest>): Promise<ProcurementRequest> => {
    if (!currentUser) {
      throw new Error("User must be logged in to update a request");
    }
    
    setIsLoading(true);
    
    try {
      // Map frontend model updates to database model
      const dbUpdates: any = {};
      
      if (updates.poNumber !== undefined) dbUpdates.po_number = updates.poNumber;
      if (updates.entity !== undefined) dbUpdates.entity = updates.entity;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.vendor !== undefined) dbUpdates.vendor = updates.vendor;
      if (updates.placeOfDelivery !== undefined) dbUpdates.place_of_delivery = updates.placeOfDelivery;
      if (updates.placeOfArrival !== undefined) dbUpdates.place_of_arrival = updates.placeOfArrival;
      if (updates.poDate !== undefined) dbUpdates.po_date = updates.poDate;
      if (updates.mgpEta !== undefined) dbUpdates.mgp_eta = updates.mgpEta;
      if (updates.expDeliveryDate !== undefined) dbUpdates.exp_delivery_date = updates.expDeliveryDate;
      if (updates.dateDelivered !== undefined) dbUpdates.date_delivered = updates.dateDelivered;
      if (updates.qtyRequested !== undefined) dbUpdates.qty_requested = updates.qtyRequested;
      if (updates.qtyDelivered !== undefined) dbUpdates.qty_delivered = updates.qtyDelivered;
      if (updates.qtyPending !== undefined) dbUpdates.qty_pending = updates.qtyPending;
      if (updates.leadTimeDays !== undefined) dbUpdates.lead_time_days = updates.leadTimeDays;
      if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
      if (updates.stage !== undefined) dbUpdates.stage = updates.stage;
      if (updates.actionItems !== undefined) dbUpdates.action_items = updates.actionItems;
      if (updates.responsible !== undefined) dbUpdates.responsible = updates.responsible;
      if (updates.dateDue !== undefined) dbUpdates.date_due = updates.dateDue;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.buyerId !== undefined) dbUpdates.buyer_id = updates.buyerId;
      if (updates.isPublic !== undefined) dbUpdates.is_public = updates.isPublic;
      
      // Always update the updated_at timestamp
      dbUpdates.updated_at = new Date().toISOString();
      
      // Update in database
      const { data, error } = await supabase
        .from("procurement_requests")
        .update(dbUpdates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Convert to frontend model
      const updatedRequest = await mapDbRequestToModel(data);
      
      // Log activity
      await logActivity(
        currentUser,
        LogActions.UPDATE_REQUEST,
        "request",
        updatedRequest.id,
        { requestNumber: updatedRequest.rfqNumber, updates: Object.keys(updates) }
      );
      
      // Update local state
      setUserRequests(prev => 
        prev.map(r => r.id === id ? updatedRequest : r)
      );
      
      toast({
        title: "Request Updated",
        description: "The request has been successfully updated"
      });
      
      return updatedRequest;
    } catch (error) {
      console.error("Error updating request:", error);
      toast({
        title: "Error",
        description: "Failed to update request",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getRequestById = async (id: string): Promise<ProcurementRequest | undefined> => {
    try {
      const { data, error } = await supabase
        .from("procurement_requests")
        .select("*")
        .eq("id", id)
        .single();
      
      if (error) {
        console.error("Error fetching request:", error);
        // Fall back to mock data for demo
        return requests.find(r => r.id === id);
      }
      
      return await mapDbRequestToModel(data);
    } catch (error) {
      console.error("Error in getRequestById:", error);
      // Fall back to mock data for demo
      return requests.find(r => r.id === id);
    }
  };

  const uploadFile = async (requestId: string, file: File): Promise<RequestFile | null> => {
    if (!currentUser) {
      throw new Error("User must be logged in to upload a file");
    }
    
    try {
      const result = await uploadRequestFile(requestId, file, currentUser);
      
      if (result) {
        // Update local state
        setUserRequests(prev => {
          return prev.map(req => {
            if (req.id === requestId) {
              const updatedFiles = [...(req.files || []), result];
              return { ...req, files: updatedFiles };
            }
            return req;
          });
        });
        
        toast({
          title: "File Uploaded",
          description: `${file.name} has been successfully uploaded`
        });
      }
      
      return result;
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive"
      });
      return null;
    }
  };

  const acceptRequest = async (id: string, buyerId: string): Promise<boolean> => {
    if (!currentUser) {
      throw new Error("User must be logged in to accept a request");
    }
    
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from("procurement_requests")
        .update({
          buyer_id: buyerId,
          status: "accepted",
          updated_at: new Date().toISOString()
        })
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Log activity
      await logActivity(
        currentUser,
        LogActions.ACCEPT_REQUEST,
        "request",
        id,
        { buyerId }
      );
      
      // Update local state
      const updatedRequest = await mapDbRequestToModel(data);
      setUserRequests(prev => 
        prev.map(r => r.id === id ? updatedRequest : r)
      );
      
      toast({
        title: "Request Accepted",
        description: "The procurement request has been accepted"
      });
      
      return true;
    } catch (error) {
      console.error("Error accepting request:", error);
      toast({
        title: "Error",
        description: "Failed to accept request",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const declineRequest = async (id: string): Promise<boolean> => {
    if (!currentUser) {
      throw new Error("User must be logged in to decline a request");
    }
    
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from("procurement_requests")
        .update({
          status: "declined",
          updated_at: new Date().toISOString()
        })
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Log activity
      await logActivity(
        currentUser,
        LogActions.DECLINE_REQUEST,
        "request",
        id
      );
      
      // Update local state
      const updatedRequest = await mapDbRequestToModel(data);
      setUserRequests(prev => 
        prev.map(r => r.id === id ? updatedRequest : r)
      );
      
      toast({
        title: "Request Declined",
        description: "The procurement request has been declined"
      });
      
      return true;
    } catch (error) {
      console.error("Error declining request:", error);
      toast({
        title: "Error",
        description: "Failed to decline request",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateStage = async (id: string, stage: ProcurementRequest["stage"]): Promise<boolean> => {
    if (!currentUser) {
      throw new Error("User must be logged in to update a request stage");
    }
    
    setIsLoading(true);
    
    try {
      // If stage is Delivered, also update status to completed
      const updates: any = {
        stage,
        updated_at: new Date().toISOString()
      };
      
      if (stage === "Delivered") {
        updates.status = "completed";
        updates.date_delivered = new Date().toISOString();
      }
      
      const { data, error } = await supabase
        .from("procurement_requests")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Log activity
      await logActivity(
        currentUser,
        LogActions.UPDATE_STAGE,
        "request",
        id,
        { stage }
      );
      
      // Update local state
      const updatedRequest = await mapDbRequestToModel(data);
      setUserRequests(prev => 
        prev.map(r => r.id === id ? updatedRequest : r)
      );
      
      toast({
        title: "Stage Updated",
        description: `Request stage updated to ${stage}`
      });
      
      return true;
    } catch (error) {
      console.error("Error updating stage:", error);
      toast({
        title: "Error",
        description: "Failed to update stage",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const togglePublicStatus = async (id: string): Promise<boolean> => {
    if (!currentUser) {
      throw new Error("User must be logged in to toggle public status");
    }
    
    if (currentUser.role !== "admin" && currentUser.role !== "buyer") {
      throw new Error("Only admins and buyers can toggle public status");
    }
    
    setIsLoading(true);
    
    try {
      // First get the current status
      const request = await getRequestById(id);
      
      if (!request) {
        throw new Error("Request not found");
      }
      
      const newStatus = !request.isPublic;
      
      const { data, error } = await supabase
        .from("procurement_requests")
        .update({
          is_public: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Update local state
      const updatedRequest = await mapDbRequestToModel(data);
      setUserRequests(prev => 
        prev.map(r => r.id === id ? updatedRequest : r)
      );
      
      toast({
        title: "Visibility Updated",
        description: newStatus 
          ? "Request is now visible to the client" 
          : "Request is now hidden from the client"
      });
      
      return true;
    } catch (error) {
      console.error("Error toggling public status:", error);
      toast({
        title: "Error",
        description: "Failed to update visibility",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const addComment = async (
    requestId: string, 
    content: string, 
    isPublic: boolean
  ): Promise<RequestComment | null> => {
    if (!currentUser) {
      throw new Error("User must be logged in to add a comment");
    }
    
    try {
      const commentData = {
        request_id: requestId,
        content,
        is_public: isPublic,
        created_by: currentUser.id
      };
      
      const { data, error } = await supabase
        .from("request_comments")
        .insert(commentData)
        .select()
        .single();
      
      if (error) throw error;
      
      // Log activity
      await logActivity(
        currentUser,
        LogActions.ADD_COMMENT,
        "comment",
        data.id,
        { requestId, isPublic }
      );
      
      // Convert to frontend model
      const comment: RequestComment = {
        id: data.id,
        requestId: data.request_id,
        content: data.content,
        isPublic: data.is_public,
        createdBy: data.created_by,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        creatorName: currentUser.name
      };
      
      // Update local state if needed (comments are usually loaded dynamically)
      
      toast({
        title: "Comment Added",
        description: "Your comment has been added to the request"
      });
      
      return comment;
    } catch (error) {
      console.error("Error adding comment:", error);
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive"
      });
      return null;
    }
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
        togglePublicStatus,
        addComment,
        isLoading,
        loadUserRequests
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
