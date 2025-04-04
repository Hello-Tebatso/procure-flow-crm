
import { supabase } from "@/integrations/supabase/client";
import { ActivityLog, User } from "@/types";

export const LogActions = {
  CREATE_REQUEST: "Created request",
  UPDATE_REQUEST: "Updated request",
  ACCEPT_REQUEST: "Accepted request",
  DECLINE_REQUEST: "Declined request",
  UPDATE_STAGE: "Updated request stage",
  UPLOAD_FILE: "Uploaded file",
  ADD_COMMENT: "Added comment",
  LOGIN: "Logged in",
  LOGOUT: "Logged out"
};

export type EntityType = "request" | "file" | "comment" | "auth";

export async function logActivity(
  user: User,
  action: string,
  entityType: EntityType,
  entityId: string,
  details?: any
): Promise<void> {
  try {
    const logEntry: Omit<ActivityLog, "id"> = {
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action,
      entityType,
      entityId,
      details,
      createdAt: new Date().toISOString(),
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

    return (data || []) as unknown as ActivityLog[];
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

    return (data || []) as unknown as ActivityLog[];
  } catch (error) {
    console.error("Error fetching user activity logs:", error);
    return [];
  }
}
