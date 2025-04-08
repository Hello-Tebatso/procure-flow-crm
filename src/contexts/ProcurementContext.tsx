import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  ProcurementRequest, 
  RequestFile, 
  User, 
  RequestStatus, 
  ProcurementStage,
  RequestItem,
  RequestComment,
  BuyerPerformance
} from "@/types";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { uploadRequestFile, getRequestFiles } from "@/services/FileService";
import { logActivity, LogActions } from "@/services/LogService";

const MOCK_REQUESTS: ProcurementRequest[] = [
  {
    id: "1234-5678-9012-3456",
    rfqNumber: "MGP-25-0001",
    poNumber: "PO123456",
    entity: "MGP Investments",
    description: "Office Equipment for Luanda Branch",
    placeOfDelivery: "Luanda, Angola",
    qtyRequested: 10,
    qtyDelivered: 0,
    qtyPending: 10,
    stage: "New Request",
    status: "pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    clientId: "754e86c9-afed-45e6-bcae-f2799beb9060",
    isPublic: true,
    files: []
  },
  {
    id: "2345-6789-0123-4567",
    rfqNumber: "MGP-25-0002",
    poNumber: "PO234567",
    entity: "MGP Investments",
    description: "IT Supplies for Head Office",
    placeOfDelivery: "Johannesburg, South Africa",
    qtyRequested: 5,
    qtyDelivered: 2,
    qtyPending: 3,
    stage: "Resourcing",
    status: "accepted",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    clientId: "754e86c9-afed-45e6-bcae-f2799beb9060",
    buyerId: "e8fd159b-57c4-4d36-9bd7-a59ca13057ef",
    buyer: "Gabriel Zau",
    isPublic: true,
    files: []
  },
  {
    id: "3456-7890-1234-5678",
    rfqNumber: "MGP-25-0003",
    poNumber: "PO345678",
    entity: "MGP Investments",
    description: "Construction Materials",
    placeOfDelivery: "Maputo, Mozambique",
    qtyRequested: 100,
    qtyDelivered: 0,
    qtyPending: 100,
    stage: "CO/CE",
    status: "accepted",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    clientId: "754e86c9-afed-45e6-bcae-f2799beb9060",
    buyerId: "1d23342a-82a3-4ac8-a73f-4c800d22b2ac",
    buyer: "Bernado Buela",
    isPublic: true,
    files: []
  }
];

const MOCK_BUYER_PERFORMANCE: BuyerPerformance[] = [
  {
    buyerId: "e8fd159b-57c4-4d36-9bd7-a59ca13057ef",
    buyerName: "Gabriel Zau",
    totalLines: 45,
    pendingLines: 12,
    deliveredOnTime: 30,
    deliveredLate: 3,
    deliveredOnTimePercentage: 91
  },
  {
    buyerId: "1d23342a-82a3-4ac8-a73f-4c800d22b2ac",
    buyerName: "Bernado Buela",
    totalLines: 38,
    pendingLines: 8,
    deliveredOnTime: 25,
    deliveredLate: 5,
    deliveredOnTimePercentage: 83
  },
  {
    buyerId: "c4e125c3-4964-4a8b-b903-18f764b22rte",
    buyerName: "Magreth Smith",
    totalLines: 29,
    pendingLines: 9,
    deliveredOnTime: 18,
    deliveredLate: 2,
    deliveredOnTimePercentage: 90
  }
];

interface ProcurementContextType {
  requests: ProcurementRequest[];
  userRequests: ProcurementRequest[];
  createRequest: (request: Partial<ProcurementRequest>, items?: Partial<RequestItem>[]) => Promise<ProcurementRequest | null>;
  updateRequest: (id: string, updates: Partial<ProcurementRequest>, items?: Partial<RequestItem>[]) => Promise<ProcurementRequest | null>;
  deleteRequest: (id: string) => Promise<boolean>;
  getRequestById: (id: string) => Promise<ProcurementRequest | undefined>;
  uploadFile: (requestId: string, file: File) => Promise<RequestFile | null>;
  acceptRequest: (id: string, buyerId: string) => Promise<boolean>;
  declineRequest: (id: string) => Promise<boolean>;
  updateStage: (id: string, stage: ProcurementRequest["stage"]) => Promise<boolean>;
  togglePublicStatus: (id: string) => Promise<boolean>;
  addComment: (requestId: string, content: string, isPublic: boolean) => Promise<RequestComment | null>;
  addOrUpdateRequestItem: (requestId: string, item: Partial<RequestItem>) => Promise<RequestItem | null>;
  getRequestItems: (requestId: string) => Promise<RequestItem[]>;
  getBuyerPerformance: (buyerId?: string) => Promise<BuyerPerformance[]>;
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

  useEffect(() => {
    if (currentUser) {
      loadUserRequests();
    } else {
      setUserRequests([]);
    }
  }, [currentUser]);

  const mapDbRequestToModel = async (dbRequest: any): Promise<ProcurementRequest> => {
    const files = await getRequestFiles(dbRequest.id);
    const items = await getRequestItems(dbRequest.id);
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
      files,
      items
    };
  };

  const loadUserRequests = async () => {
    if (!currentUser) return;
    
    setIsLoading(true);
    try {
      const { error: tableCheckError } = await supabase
        .from("procurement_requests")
        .select("id")
        .limit(1);
      
      if (tableCheckError) {
        console.warn("Using mock data because procurement_requests table doesn't exist:", tableCheckError.message);
        
        let filteredRequests;
        if (currentUser.role === "admin") {
          filteredRequests = MOCK_REQUESTS;
        } else if (currentUser.role === "buyer") {
          filteredRequests = MOCK_REQUESTS.filter(req => req.buyerId === currentUser.id);
        } else {
          filteredRequests = MOCK_REQUESTS.filter(req => req.clientId === currentUser.id);
        }
        
        setUserRequests(filteredRequests);
        setRequests(filteredRequests);
        setIsLoading(false);
        return;
      }
      
      let query;
      if (currentUser.role === "admin") {
        query = supabase
          .from("procurement_requests")
          .select("*")
          .order("created_at", { ascending: false });
      } else if (currentUser.role === "buyer") {
        query = supabase
          .from("procurement_requests")
          .select("*")
          .eq("buyer_id", currentUser.id)
          .order("created_at", { ascending: false });
      } else {
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
        setRequests(mappedRequests);
      }
    } catch (error) {
      console.error("Error loading user requests:", error);
      toast({
        title: "Error loading requests",
        description: "Failed to load your requests. Using mock data instead.",
        variant: "destructive"
      });
      
      let filteredRequests;
      if (currentUser.role === "admin") {
        filteredRequests = MOCK_REQUESTS;
      } else if (currentUser.role === "buyer") {
        filteredRequests = MOCK_REQUESTS.filter(req => req.buyerId === currentUser.id);
      } else {
        filteredRequests = MOCK_REQUESTS.filter(req => req.clientId === currentUser.id);
      }
      
      setUserRequests(filteredRequests);
      setRequests(filteredRequests);
    } finally {
      setIsLoading(false);
    }
  };

  const createRequest = async (
    requestData: Partial<ProcurementRequest>,
    items?: Partial<RequestItem>[]
  ): Promise<ProcurementRequest | null> => {
    if (!currentUser) {
      toast({
        title: "Error",
        description: "User must be logged in to create a request",
        variant: "destructive"
      });
      return null;
    }
    
    if (currentUser.role !== 'client' && currentUser.role !== 'admin') {
      toast({
        title: "Error",
        description: "Only clients and admins can create requests",
        variant: "destructive"
      });
      return null;
    }
    
    setIsLoading(true);
    
    try {
      const dbRequest = {
        rfq_number: requestData.rfqNumber || "",
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
        client_id: requestData.clientId,
        is_public: true
      };
      
      // Use the makeAuthenticatedRequest to get a client that can handle RLS properly
      const authClient = await makeAuthenticatedRequest();
      const { data, error } = await authClient
        .from("procurement_requests")
        .insert(dbRequest)
        .select()
        .single();
      
      if (error) throw error;
      
      if (items && items.length > 0 && data) {
        for (const item of items) {
          await addOrUpdateRequestItem(data.id, {
            ...item,
            requestId: data.id
          });
        }
      }
      
      await logActivity(
        currentUser.id,
        currentUser.name,
        currentUser.role,
        LogActions.CREATE_REQUEST,
        "request",
        data.id,
        { description: data.description }
      );
      
      const newRequest = await mapDbRequestToModel(data);
      
      setUserRequests(prev => [newRequest, ...prev]);
      setRequests(prev => [newRequest, ...prev]);
      
      toast({
        title: "Request Created",
        description: "Your procurement request has been successfully created",
      });
      
      return newRequest;
    } catch (error) {
      console.error("Error creating request:", error);
      throw error; // Re-throw to allow fallback in useRequestForm
    } finally {
      setIsLoading(false);
    }
  };

  const updateRequest = async (
    id: string, 
    updates: Partial<ProcurementRequest>,
    items?: Partial<RequestItem>[]
  ): Promise<ProcurementRequest | null> => {
    if (!currentUser) {
      toast({
        title: "Error",
        description: "User must be logged in to update a request",
        variant: "destructive"
      });
      return null;
    }
    
    if (currentUser.role === 'client') {
      const { data, error } = await supabase
        .from("procurement_requests")
        .select("*")
        .eq("id", id)
        .eq("client_id", currentUser.id)
        .eq("status", "pending")
        .is("buyer_id", null)
        .single();
        
      if (error || !data) {
        toast({
          title: "Access Denied",
          description: "You can only edit your own pending requests that have not been assigned to a buyer",
          variant: "destructive"
        });
        return null;
      }
    }
    
    setIsLoading(true);
    
    try {
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
      
      dbUpdates.updated_at = new Date().toISOString();
      
      const { data, error } = await supabase
        .from("procurement_requests")
        .update(dbUpdates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      
      if (items && items.length > 0) {
        for (const item of items) {
          await addOrUpdateRequestItem(id, {
            ...item,
            requestId: id
          });
        }
      }
      
      await logActivity(
        currentUser.id,
        currentUser.name,
        currentUser.role,
        LogActions.UPDATE_REQUEST,
        "request",
        id,
        { updates: Object.keys(updates) }
      );
      
      const updatedRequest = await mapDbRequestToModel(data);
      
      setUserRequests(prev => 
        prev.map(r => r.id === id ? updatedRequest : r)
      );
      setRequests(prev => 
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
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteRequest = async (id: string): Promise<boolean> => {
    if (!currentUser) {
      toast({
        title: "Error",
        description: "User must be logged in to delete a request",
        variant: "destructive"
      });
      return false;
    }
    
    if (currentUser.role === 'client') {
      const { data, error } = await supabase
        .from("procurement_requests")
        .select("*")
        .eq("id", id)
        .eq("client_id", currentUser.id)
        .eq("status", "pending")
        .is("buyer_id", null)
        .single();
        
      if (error || !data) {
        toast({
          title: "Access Denied",
          description: "You can only delete your own pending requests that have not been assigned to a buyer",
          variant: "destructive"
        });
        return false;
      }
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from("procurement_requests")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      
      await logActivity(
        currentUser.id,
        currentUser.name,
        currentUser.role,
        LogActions.DELETE_REQUEST,
        "request",
        id
      );
      
      setUserRequests(prev => prev.filter(r => r.id !== id));
      setRequests(prev => prev.filter(r => r.id !== id));
      
      toast({
        title: "Request Deleted",
        description: "The request has been successfully deleted"
      });
      
      return true;
    } catch (error) {
      console.error("Error deleting request:", error);
      toast({
        title: "Error",
        description: "Failed to delete request",
        variant: "destructive"
      });
      return false;
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
        return undefined;
      }
      
      return await mapDbRequestToModel(data);
    } catch (error) {
      console.error("Error in getRequestById:", error);
      return undefined;
    }
  };

  const uploadFile = async (requestId: string, file: File): Promise<RequestFile | null> => {
    if (!currentUser) {
      throw new Error("User must be logged in to upload a file");
    }
    
    try {
      const result = await uploadRequestFile(requestId, file, currentUser);
      
      if (result) {
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
      toast({
        title: "Error",
        description: "User must be logged in to accept a request",
        variant: "destructive"
      });
      return false;
    }
    
    if (currentUser.role !== 'admin') {
      toast({
        title: "Access Denied",
        description: "Only admins can accept requests",
        variant: "destructive"
      });
      return false;
    }
    
    setIsLoading(true);
    
    try {
      const { data: buyerData, error: buyerError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", buyerId)
        .single();
        
      if (buyerError || !buyerData) {
        toast({
          title: "Error",
          description: "Buyer not found",
          variant: "destructive"
        });
        return false;
      }
      
      const { data, error } = await supabase
        .from("procurement_requests")
        .update({
          buyer_id: buyerId,
          buyer: buyerData.name,
          status: "accepted",
          updated_at: new Date().toISOString()
        })
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      
      await logActivity(
        currentUser.id,
        currentUser.name,
        currentUser.role,
        LogActions.ACCEPT_REQUEST,
        "request",
        id,
        { buyerId, buyerName: buyerData.name }
      );
      
      const updatedRequest = await mapDbRequestToModel(data);
      
      setUserRequests(prev => 
        prev.map(r => r.id === id ? updatedRequest : r)
      );
      setRequests(prev => 
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
      toast({
        title: "Error",
        description: "User must be logged in to decline a request",
        variant: "destructive"
      });
      return false;
    }
    
    if (currentUser.role !== 'admin') {
      toast({
        title: "Access Denied",
        description: "Only admins can decline requests",
        variant: "destructive"
      });
      return false;
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
      
      await logActivity(
        currentUser.id,
        currentUser.name,
        currentUser.role,
        LogActions.DECLINE_REQUEST,
        "request",
        id
      );
      
      const updatedRequest = await mapDbRequestToModel(data);
      
      setUserRequests(prev => 
        prev.map(r => r.id === id ? updatedRequest : r)
      );
      setRequests(prev => 
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
      toast({
        title: "Error",
        description: "User must be logged in to update a request stage",
        variant: "destructive"
      });
      return false;
    }
    
    if (currentUser.role !== 'admin' && currentUser.role !== 'buyer') {
      toast({
        title: "Access Denied",
        description: "Only admins and assigned buyers can update request stages",
        variant: "destructive"
      });
      return false;
    }
    
    if (currentUser.role === 'buyer') {
      const { data, error } = await supabase
        .from("procurement_requests")
        .select("buyer_id")
        .eq("id", id)
        .single();
        
      if (error || !data || data.buyer_id !== currentUser.id) {
        toast({
          title: "Access Denied",
          description: "You can only update stages for requests assigned to you",
          variant: "destructive"
        });
        return false;
      }
    }
    
    setIsLoading(true);
    
    try {
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
      
      await logActivity(
        currentUser.id,
        currentUser.name,
        currentUser.role,
        LogActions.UPDATE_STAGE,
        "request",
        id,
        { stage }
      );
      
      const updatedRequest = await mapDbRequestToModel(data);
      
      setUserRequests(prev => 
        prev.map(r => r.id === id ? updatedRequest : r)
      );
      setRequests(prev => 
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
      toast({
        title: "Error",
        description: "User must be logged in to toggle public status",
        variant: "destructive"
      });
      return false;
    }
    
    if (currentUser.role !== "admin" && currentUser.role !== "buyer") {
      toast({
        title: "Access Denied",
        description: "Only admins and buyers can toggle public status",
        variant: "destructive"
      });
      return false;
    }
    
    if (currentUser.role === 'buyer') {
      const { data, error } = await supabase
        .from("procurement_requests")
        .select("buyer_id")
        .eq("id", id)
        .single();
        
      if (error || !data || data.buyer_id !== currentUser.id) {
        toast({
          title: "Access Denied",
          description: "You can only update visibility for requests assigned to you",
          variant: "destructive"
        });
        return false;
      }
    }
    
    setIsLoading(true);
    
    try {
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
      
      const updatedRequest = await mapDbRequestToModel(data);
      
      setUserRequests(prev => 
        prev.map(r => r.id === id ? updatedRequest : r)
      );
      setRequests(prev => 
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
      toast({
        title: "Error",
        description: "User must be logged in to add a comment",
        variant: "destructive"
      });
      return null;
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
      
      await logActivity(
        currentUser.id,
        currentUser.name,
        currentUser.role,
        LogActions.ADD_COMMENT,
        "comment",
        data.id,
        { requestId, isPublic }
      );
      
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
