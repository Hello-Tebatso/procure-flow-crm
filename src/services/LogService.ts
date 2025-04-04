
import { ActivityLog, UserRole } from "@/types";
import { supabase } from "@/integrations/supabase/client";

export class LogService {
  static async logActivity(
    userId: string,
    userName: string,
    userRole: UserRole,
    action: string,
    details: string,
    requestId?: string
  ): Promise<ActivityLog | null> {
    try {
      const log: Omit<ActivityLog, 'id'> = {
        userId,
        userName,
        userRole,
        action,
        details,
        requestId,
        timestamp: new Date().toISOString()
      };
      
      // Save to Supabase
      const { data, error } = await supabase
        .from('activity_logs')
        .insert(log)
        .select()
        .single();
        
      if (error) {
        console.error("Error logging activity:", error);
        return null;
      }
      
      return data as ActivityLog;
    } catch (error) {
      console.error("Error in logActivity:", error);
      return null;
    }
  }
  
  static async getActivityLogs(
    limit: number = 100,
    requestId?: string
  ): Promise<ActivityLog[]> {
    try {
      let query = supabase
        .from('activity_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(limit);
        
      if (requestId) {
        query = query.eq('requestId', requestId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching activity logs:", error);
        return [];
      }
      
      return data as ActivityLog[];
    } catch (error) {
      console.error("Error in getActivityLogs:", error);
      return [];
    }
  }
}
