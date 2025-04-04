export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          entity_id: string
          entity_type: string
          id: string
          user_id: string
          user_name: string
          user_role: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          entity_id: string
          entity_type: string
          id?: string
          user_id: string
          user_name: string
          user_role: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          entity_id?: string
          entity_type?: string
          id?: string
          user_id?: string
          user_name?: string
          user_role?: string
        }
        Relationships: []
      }
      api_keys: {
        Row: {
          api_key: string
          created_at: string
          id: string
          is_active: boolean | null
          last_used_at: string | null
          name: string
          rate_limit: number | null
          user_id: string
        }
        Insert: {
          api_key: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          name: string
          rate_limit?: number | null
          user_id: string
        }
        Update: {
          api_key?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          name?: string
          rate_limit?: number | null
          user_id?: string
        }
        Relationships: []
      }
      api_usage: {
        Row: {
          api_key_id: string
          date: string
          endpoint: string
          id: string
          request_count: number | null
        }
        Insert: {
          api_key_id: string
          date?: string
          endpoint: string
          id?: string
          request_count?: number | null
        }
        Update: {
          api_key_id?: string
          date?: string
          endpoint?: string
          id?: string
          request_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "api_usage_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "api_keys"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      image_categories: {
        Row: {
          category_id: string
          image_id: string
        }
        Insert: {
          category_id: string
          image_id: string
        }
        Update: {
          category_id?: string
          image_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "image_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "image_categories_image_id_fkey"
            columns: ["image_id"]
            isOneToOne: false
            referencedRelation: "images"
            referencedColumns: ["id"]
          },
        ]
      }
      images: {
        Row: {
          created_at: string
          description: string | null
          downloads: number | null
          height: number | null
          id: string
          is_featured: boolean | null
          likes: number | null
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          url: string
          user_id: string
          views: number | null
          width: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          downloads?: number | null
          height?: number | null
          id?: string
          is_featured?: boolean | null
          likes?: number | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          url: string
          user_id: string
          views?: number | null
          width?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          downloads?: number | null
          height?: number | null
          id?: string
          is_featured?: boolean | null
          likes?: number | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          url?: string
          user_id?: string
          views?: number | null
          width?: number | null
        }
        Relationships: []
      }
      likes: {
        Row: {
          created_at: string
          image_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          image_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          image_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "likes_image_id_fkey"
            columns: ["image_id"]
            isOneToOne: false
            referencedRelation: "images"
            referencedColumns: ["id"]
          },
        ]
      }
      procurement_requests: {
        Row: {
          action_items: string | null
          aging: number | null
          buyer_id: string | null
          client_id: string
          created_at: string
          date_delivered: string | null
          date_due: string | null
          days_count: number | null
          description: string
          entity: string
          exp_delivery_date: string | null
          id: string
          is_public: boolean
          lead_time_days: number | null
          mgp_eta: string | null
          place_of_arrival: string | null
          place_of_delivery: string
          po_date: string | null
          po_number: string | null
          priority: string | null
          qty_delivered: number
          qty_pending: number
          qty_requested: number
          responsible: string | null
          rfq_number: string
          stage: string
          status: string
          updated_at: string
          vendor: string | null
        }
        Insert: {
          action_items?: string | null
          aging?: number | null
          buyer_id?: string | null
          client_id: string
          created_at?: string
          date_delivered?: string | null
          date_due?: string | null
          days_count?: number | null
          description: string
          entity: string
          exp_delivery_date?: string | null
          id?: string
          is_public?: boolean
          lead_time_days?: number | null
          mgp_eta?: string | null
          place_of_arrival?: string | null
          place_of_delivery: string
          po_date?: string | null
          po_number?: string | null
          priority?: string | null
          qty_delivered?: number
          qty_pending: number
          qty_requested: number
          responsible?: string | null
          rfq_number: string
          stage: string
          status: string
          updated_at?: string
          vendor?: string | null
        }
        Update: {
          action_items?: string | null
          aging?: number | null
          buyer_id?: string | null
          client_id?: string
          created_at?: string
          date_delivered?: string | null
          date_due?: string | null
          days_count?: number | null
          description?: string
          entity?: string
          exp_delivery_date?: string | null
          id?: string
          is_public?: boolean
          lead_time_days?: number | null
          mgp_eta?: string | null
          place_of_arrival?: string | null
          place_of_delivery?: string
          po_date?: string | null
          po_number?: string | null
          priority?: string | null
          qty_delivered?: number
          qty_pending?: number
          qty_requested?: number
          responsible?: string | null
          rfq_number?: string
          stage?: string
          status?: string
          updated_at?: string
          vendor?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          full_name: string | null
          id: string
          location: string | null
          updated_at: string
          username: string
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          location?: string | null
          updated_at?: string
          username: string
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          location?: string | null
          updated_at?: string
          username?: string
          website?: string | null
        }
        Relationships: []
      }
      request_comments: {
        Row: {
          content: string
          created_at: string
          created_by: string
          id: string
          is_public: boolean
          request_id: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by: string
          id?: string
          is_public?: boolean
          request_id: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string
          id?: string
          is_public?: boolean
          request_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "request_comments_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "procurement_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      request_files: {
        Row: {
          id: string
          is_public: boolean
          name: string
          request_id: string
          size: number
          type: string
          uploaded_at: string
          uploaded_by: string
          url: string
        }
        Insert: {
          id?: string
          is_public?: boolean
          name: string
          request_id: string
          size: number
          type: string
          uploaded_at?: string
          uploaded_by: string
          url: string
        }
        Update: {
          id?: string
          is_public?: boolean
          name?: string
          request_id?: string
          size?: number
          type?: string
          uploaded_at?: string
          uploaded_by?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "request_files_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "procurement_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      request_items: {
        Row: {
          created_at: string
          description: string
          id: string
          item_number: string
          qty_delivered: number
          qty_requested: number
          request_id: string
          total_price: number | null
          unit_price: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          item_number: string
          qty_delivered?: number
          qty_requested: number
          request_id: string
          total_price?: number | null
          unit_price?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          item_number?: string
          qty_delivered?: number
          qty_requested?: number
          request_id?: string
          total_price?: number | null
          unit_price?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "request_items_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "procurement_requests"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_rfq_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_role: {
        Args: {
          user_id: string
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
