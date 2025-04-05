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
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { uploadRequestFile, getRequestFiles } from "@/services/FileService";
import { logActivity, LogActions } from "@/services/LogService";

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
        description: "Failed to load your requests",
        variant: "destructive"
      });
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
        client_id: currentUser.id,
        is_public: true
      };
      
      const { data, error } = await supabase
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
      toast({
        title: "Error",
        description: "Failed to create request. Please try again.",
        variant: "destructive"
      });
      return null;
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

  const addOrUpdateRequestItem = async (
    requestId: string,
    itemData: Partial<RequestItem>
  ): Promise<RequestItem | null> => {
    if (!currentUser) {
      toast({
        title: "Error",
        description: "User must be logged in to add or update items",
        variant: "destructive"
      });
      return null;
    }
    
    try {
      const dbItem: any = {
        request_id: requestId,
        item_number: itemData.itemNumber || `ITEM-${Date.now()}`,
        description: itemData.description || "No description",
        qty_requested: itemData.qtyRequested || 0,
        qty_delivered: itemData.qtyDelivered || 0,
        unit_price: itemData.unitPrice || null,
        total_price: itemData.totalPrice || null,
      };
      
      let result;
      
      if (itemData.id) {
        const { data, error } = await supabase
          .from("request_items")
          .update(dbItem)
          .eq("id", itemData.id)
          .select()
          .single();
          
        if (error) throw error;
        result = data;
      } else {
        const { data, error } = await supabase
          .from("request_items")
          .insert(dbItem)
          .select()
          .single();
          
        if (error) throw error;
        result = data;
      }
      
      const item: RequestItem = {
        id: result.id,
        requestId: result.request_id,
        itemNumber: result.item_number,
        description: result.description,
        qtyRequested: result.qty_requested,
        qtyDelivered: result.qty_delivered,
        unitPrice: result.unit_price,
        totalPrice: result.total_price,
        createdAt: result.created_at,
        updatedAt: result.updated_at
      };
      
      return item;
    } catch (error) {
      console.error("Error adding/updating request item:", error);
      return null;
    }
  };

  const getRequestItems = async (requestId: string): Promise<RequestItem[]> => {
    try {
      const { data, error } = await supabase
        .from("request_items")
        .select("*")
        .eq("request_id", requestId);
        
      if (error) throw error;
      
      return (data || []).map(item => ({
        id: item.id,
        requestId: item.request_id,
        itemNumber: item.item_number,
        description: item.description,
        qtyRequested: item.qty_requested,
        qtyDelivered: item.qty_delivered,
        unitPrice: item.unit_price,
        totalPrice: item.total_price,
        createdAt: item.created_at,
        updatedAt: item.updated_at
      }));
    } catch (error) {
      console.error("Error fetching request items:", error);
      return [];
    }
  };

  return (
    <ProcurementContext.Provider 
      value={{ 
        requests,
        userRequests,
        createRequest,
        updateRequest,
        deleteRequest,
        getRequestById,
        uploadFile,
        acceptRequest,
        declineRequest,
        updateStage,
        togglePublicStatus,
        addComment,
        addOrUpdateRequestItem,
        getRequestItems,
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
