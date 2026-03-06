export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      blocked_dates: {
        Row: {
          blocked_date: string
          created_at: string
          id: string
          reason: string | null
        }
        Insert: {
          blocked_date: string
          created_at?: string
          id?: string
          reason?: string | null
        }
        Update: {
          blocked_date?: string
          created_at?: string
          id?: string
          reason?: string | null
        }
        Relationships: []
      }
      brand_leads: {
        Row: {
          created_at: string
          email: string
          id: string
          interest: string
          name: string
          phone: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          interest: string
          name: string
          phone: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          interest?: string
          name?: string
          phone?: string
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          color: string | null
          created_at: string
          id: string
          product_id: string
          quantity: number
          session_id: string
          size: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          product_id: string
          quantity?: number
          session_id: string
          size?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          product_id?: string
          quantity?: number
          session_id?: string
          size?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      communication_log: {
        Row: {
          created_at: string
          customer_id: string
          id: string
          summary: string
          type: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          id?: string
          summary: string
          type?: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          id?: string
          summary?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "communication_log_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          notes: string | null
          phone: string
          preferences: Json | null
          source: string | null
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name: string
          notes?: string | null
          phone: string
          preferences?: Json | null
          source?: string | null
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          notes?: string | null
          phone?: string
          preferences?: Json | null
          source?: string | null
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      event_leads: {
        Row: {
          booking_type: string
          created_at: string
          customer_id: string | null
          email: string
          event_date: string | null
          event_type: string
          guests: number | null
          id: string
          location: string | null
          message: string | null
          name: string
          notes: string | null
          phone: string
          status: string
        }
        Insert: {
          booking_type?: string
          created_at?: string
          customer_id?: string | null
          email: string
          event_date?: string | null
          event_type: string
          guests?: number | null
          id?: string
          location?: string | null
          message?: string | null
          name: string
          notes?: string | null
          phone: string
          status?: string
        }
        Update: {
          booking_type?: string
          created_at?: string
          customer_id?: string | null
          email?: string
          event_date?: string | null
          event_type?: string
          guests?: number | null
          id?: string
          location?: string | null
          message?: string | null
          name?: string
          notes?: string | null
          phone?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_leads_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      instagram_posts: {
        Row: {
          cached_image_url: string | null
          caption: string | null
          created_at: string
          id: string
          instagram_id: string
          like_count: number | null
          media_type: string
          media_url: string
          permalink: string
          thumbnail_url: string | null
          timestamp: string
          updated_at: string
        }
        Insert: {
          cached_image_url?: string | null
          caption?: string | null
          created_at?: string
          id?: string
          instagram_id: string
          like_count?: number | null
          media_type?: string
          media_url: string
          permalink: string
          thumbnail_url?: string | null
          timestamp: string
          updated_at?: string
        }
        Update: {
          cached_image_url?: string | null
          caption?: string | null
          created_at?: string
          id?: string
          instagram_id?: string
          like_count?: number | null
          media_type?: string
          media_url?: string
          permalink?: string
          thumbnail_url?: string | null
          timestamp?: string
          updated_at?: string
        }
        Relationships: []
      }
      lookbook_looks: {
        Row: {
          created_at: string
          description: string | null
          description_en: string | null
          id: string
          image_url: string
          is_published: boolean | null
          product_ids: string[] | null
          season: string | null
          sort_order: number
          title: string
          title_en: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          description_en?: string | null
          id?: string
          image_url: string
          is_published?: boolean | null
          product_ids?: string[] | null
          season?: string | null
          sort_order?: number
          title: string
          title_en?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          description_en?: string | null
          id?: string
          image_url?: string
          is_published?: boolean | null
          product_ids?: string[] | null
          season?: string | null
          sort_order?: number
          title?: string
          title_en?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string | null
          colors: string[] | null
          compare_at_price: number | null
          created_at: string
          description: string | null
          description_en: string | null
          id: string
          images: string[] | null
          inventory: number
          is_published: boolean | null
          name: string
          name_en: string | null
          price: number
          sizes: string[] | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          colors?: string[] | null
          compare_at_price?: number | null
          created_at?: string
          description?: string | null
          description_en?: string | null
          id?: string
          images?: string[] | null
          inventory?: number
          is_published?: boolean | null
          name: string
          name_en?: string | null
          price?: number
          sizes?: string[] | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          colors?: string[] | null
          compare_at_price?: number | null
          created_at?: string
          description?: string | null
          description_en?: string | null
          id?: string
          images?: string[] | null
          inventory?: number
          is_published?: boolean | null
          name?: string
          name_en?: string | null
          price?: number
          sizes?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      wishlist_items: {
        Row: {
          created_at: string
          id: string
          product_id: string
          session_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          session_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
