
import { supabase } from "@/integrations/supabase/client";
import { ActivityLog } from "@/types";

export const LogActions = {
  CREATE_REQUEST: "Created request",
  UPDATE_REQUEST: "Updated request",
  ACCEPT_REQUEST: "Accepted request",
  DECLINE_REQUEST: "Declined request",
  UPDATE_STAGE: "Updated request stage",
  UPLOAD_FILE: "Uploaded file",
  ADD_COMMENT: "Added comment",
  LOGIN: "Logged in",
  LOGOUT: "Logged out",
  DELETE_REQUEST: "Deleted request"
};

export type EntityType = "request" | "file" | "comment" | "auth";

export async function logActivity(
  userId: string,
  userName: string,
  userRole: string,
  action: string,
  entityType: EntityType,
  entityId: string,
  details?: any
): Promise<void> {
  try {
    const logEntry = {
      user_id: userId,
      user_name: userName,
      user_role: userRole,
      action,
      entity_type: entityType,
      entity_id: entityId,
      details,
      created_at: new Date().toISOString(),
    };

    await supabase.from("activity_logs").insert(logEntry);
  } catch (error) {
    console.error("Error logging activity:", error);
  }
}

export async function getActivityLogs(limit = 50): Promise<ActivityLog[]> {
  try {
    const { data, error } = await supabase
      .from("activity_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (data || []).map(log => ({
      id: log.id,
      userId: log.user_id,
      userName: log.user_name,
      userRole: log.user_role,
      action: log.action,
      entityType: log.entity_type,
      entityId: log.entity_id,
      details: log.details,
      createdAt: log.created_at
    }));
  } catch (error) {
    console.error("Error fetching activity logs:", error);
    return [];
  }
}

export async function getUserActivityLogs(userId: string, limit = 50): Promise<ActivityLog[]> {
  try {
    const { data, error } = await supabase
      .from("activity_logs")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (data || []).map(log => ({
      id: log.id,
      userId: log.user_id,
      userName: log.user_name,
      userRole: log.user_role,
      action: log.action,
      entityType: log.entity_type,
      entityId: log.entity_id,
      details: log.details,
      createdAt: log.created_at
    }));
  } catch (error) {
    console.error("Error fetching user activity logs:", error);
    return [];
  }
}
