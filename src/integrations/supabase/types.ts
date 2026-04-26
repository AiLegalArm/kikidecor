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
      admin_actions: {
        Row: {
          action: string
          created_at: string
          details: Json
          entity_id: string | null
          entity_type: string | null
          id: string
          source: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          source?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          source?: string
          user_id?: string | null
        }
        Relationships: []
      }
      agent_canned_replies: {
        Row: {
          category: string | null
          created_at: string
          id: string
          key: string
          language: string
          text: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          key: string
          language?: string
          text: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          key?: string
          language?: string
          text?: string
          updated_at?: string
        }
        Relationships: []
      }
      agent_policies: {
        Row: {
          ai_globally_paused: boolean
          allowed_topics: string[]
          blocked_topics: string[]
          business_hours: Json
          confidence_threshold: number
          escalation_keywords: string[]
          handoff_template_en: string
          handoff_template_ru: string
          id: number
          max_repeated_clarifications: number
          qualification_questions: Json
          refusal_template_en: string
          refusal_template_ru: string
          tone_voice: string
          updated_at: string
        }
        Insert: {
          ai_globally_paused?: boolean
          allowed_topics?: string[]
          blocked_topics?: string[]
          business_hours?: Json
          confidence_threshold?: number
          escalation_keywords?: string[]
          handoff_template_en?: string
          handoff_template_ru?: string
          id: number
          max_repeated_clarifications?: number
          qualification_questions?: Json
          refusal_template_en?: string
          refusal_template_ru?: string
          tone_voice?: string
          updated_at?: string
        }
        Update: {
          ai_globally_paused?: boolean
          allowed_topics?: string[]
          blocked_topics?: string[]
          business_hours?: Json
          confidence_threshold?: number
          escalation_keywords?: string[]
          handoff_template_en?: string
          handoff_template_ru?: string
          id?: number
          max_repeated_clarifications?: number
          qualification_questions?: Json
          refusal_template_en?: string
          refusal_template_ru?: string
          tone_voice?: string
          updated_at?: string
        }
        Relationships: []
      }
      ai_interactions: {
        Row: {
          created_at: string
          customer_id: string | null
          id: string
          input_data: Json | null
          interaction_type: string
          output_data: Json | null
          photo_url: string | null
          selected_product_ids: string[] | null
          session_id: string
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          id?: string
          input_data?: Json | null
          interaction_type: string
          output_data?: Json | null
          photo_url?: string | null
          selected_product_ids?: string[] | null
          session_id: string
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          id?: string
          input_data?: Json | null
          interaction_type?: string
          output_data?: Json | null
          photo_url?: string | null
          selected_product_ids?: string[] | null
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_interactions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_provider_settings: {
        Row: {
          id: string
          is_active: boolean
          model_fast: string | null
          model_image: string | null
          model_reasoning: string | null
          model_vision: string | null
          notes: string | null
          provider: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          id?: string
          is_active?: boolean
          model_fast?: string | null
          model_image?: string | null
          model_reasoning?: string | null
          model_vision?: string | null
          notes?: string | null
          provider?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          id?: string
          is_active?: boolean
          model_fast?: string | null
          model_image?: string | null
          model_reasoning?: string | null
          model_vision?: string | null
          notes?: string | null
          provider?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
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
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          name_en: string | null
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          name_en?: string | null
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          name_en?: string | null
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
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
      generator_runs: {
        Row: {
          completed_at: string | null
          created_at: string
          error_message: string | null
          generator_type: string
          id: string
          initiated_by: string | null
          input_data: Json
          output_data: Json
          prompt: string | null
          source: string
          started_at: string | null
          status: Database["public"]["Enums"]["gen_status"]
          telegram_chat_id: number | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          generator_type: string
          id?: string
          initiated_by?: string | null
          input_data?: Json
          output_data?: Json
          prompt?: string | null
          source?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["gen_status"]
          telegram_chat_id?: number | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          generator_type?: string
          id?: string
          initiated_by?: string | null
          input_data?: Json
          output_data?: Json
          prompt?: string | null
          source?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["gen_status"]
          telegram_chat_id?: number | null
        }
        Relationships: []
      }
      instagram_clicks: {
        Row: {
          click_type: string
          created_at: string
          id: string
          instagram_post_id: string
          session_id: string
          target_id: string | null
          target_type: string | null
        }
        Insert: {
          click_type?: string
          created_at?: string
          id?: string
          instagram_post_id: string
          session_id: string
          target_id?: string | null
          target_type?: string | null
        }
        Update: {
          click_type?: string
          created_at?: string
          id?: string
          instagram_post_id?: string
          session_id?: string
          target_id?: string | null
          target_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "instagram_clicks_instagram_post_id_fkey"
            columns: ["instagram_post_id"]
            isOneToOne: false
            referencedRelation: "instagram_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      instagram_posts: {
        Row: {
          account: string
          cached_image_url: string | null
          caption: string | null
          created_at: string
          id: string
          instagram_id: string
          is_featured: boolean | null
          like_count: number | null
          link_type: string | null
          linked_portfolio_index: number | null
          linked_product_ids: string[] | null
          linked_service_index: number | null
          media_type: string
          media_url: string
          permalink: string
          thumbnail_url: string | null
          timestamp: string
          updated_at: string
          utm_clicks: number | null
        }
        Insert: {
          account?: string
          cached_image_url?: string | null
          caption?: string | null
          created_at?: string
          id?: string
          instagram_id: string
          is_featured?: boolean | null
          like_count?: number | null
          link_type?: string | null
          linked_portfolio_index?: number | null
          linked_product_ids?: string[] | null
          linked_service_index?: number | null
          media_type?: string
          media_url: string
          permalink: string
          thumbnail_url?: string | null
          timestamp: string
          updated_at?: string
          utm_clicks?: number | null
        }
        Update: {
          account?: string
          cached_image_url?: string | null
          caption?: string | null
          created_at?: string
          id?: string
          instagram_id?: string
          is_featured?: boolean | null
          like_count?: number | null
          link_type?: string | null
          linked_portfolio_index?: number | null
          linked_product_ids?: string[] | null
          linked_service_index?: number | null
          media_type?: string
          media_url?: string
          permalink?: string
          thumbnail_url?: string | null
          timestamp?: string
          updated_at?: string
          utm_clicks?: number | null
        }
        Relationships: []
      }
      kb_chunks: {
        Row: {
          chunk_index: number
          chunk_text: string
          created_at: string
          document_id: string
          embedding: string | null
          id: string
          language: string
          search_tsv: unknown
          token_count: number | null
        }
        Insert: {
          chunk_index: number
          chunk_text: string
          created_at?: string
          document_id: string
          embedding?: string | null
          id?: string
          language?: string
          search_tsv?: unknown
          token_count?: number | null
        }
        Update: {
          chunk_index?: number
          chunk_text?: string
          created_at?: string
          document_id?: string
          embedding?: string | null
          id?: string
          language?: string
          search_tsv?: unknown
          token_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "kb_chunks_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "kb_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      kb_documents: {
        Row: {
          content: string
          created_at: string
          created_by: string | null
          embedded_at: string | null
          id: string
          language: string
          metadata: Json
          source: string
          status: string
          tags: string[]
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by?: string | null
          embedded_at?: string | null
          id?: string
          language?: string
          metadata?: Json
          source: string
          status?: string
          tags?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string | null
          embedded_at?: string | null
          id?: string
          language?: string
          metadata?: Json
          source?: string
          status?: string
          tags?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      messaging_conversations: {
        Row: {
          ai_paused: boolean
          assigned_to: string | null
          channel: string
          created_at: string
          customer_display_name: string | null
          customer_handle: string | null
          customer_id: string | null
          external_thread_id: string
          external_user_id: string
          id: string
          language: string | null
          last_message_at: string
          last_message_preview: string | null
          metadata: Json
          status: string
          unread_count: number
          updated_at: string
        }
        Insert: {
          ai_paused?: boolean
          assigned_to?: string | null
          channel: string
          created_at?: string
          customer_display_name?: string | null
          customer_handle?: string | null
          customer_id?: string | null
          external_thread_id: string
          external_user_id: string
          id?: string
          language?: string | null
          last_message_at?: string
          last_message_preview?: string | null
          metadata?: Json
          status?: string
          unread_count?: number
          updated_at?: string
        }
        Update: {
          ai_paused?: boolean
          assigned_to?: string | null
          channel?: string
          created_at?: string
          customer_display_name?: string | null
          customer_handle?: string | null
          customer_id?: string | null
          external_thread_id?: string
          external_user_id?: string
          id?: string
          language?: string | null
          last_message_at?: string
          last_message_preview?: string | null
          metadata?: Json
          status?: string
          unread_count?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messaging_conversations_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messaging_messages: {
        Row: {
          ai_metadata: Json
          attachments: Json
          content: string
          conversation_id: string
          created_at: string
          external_message_id: string | null
          id: string
          role: string
        }
        Insert: {
          ai_metadata?: Json
          attachments?: Json
          content: string
          conversation_id: string
          created_at?: string
          external_message_id?: string | null
          id?: string
          role: string
        }
        Update: {
          ai_metadata?: Json
          attachments?: Json
          content?: string
          conversation_id?: string
          created_at?: string
          external_message_id?: string | null
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "messaging_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "messaging_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      packages: {
        Row: {
          created_at: string
          cta_label: string | null
          cta_label_en: string | null
          currency: string
          description: string | null
          description_en: string | null
          features: Json
          features_en: Json
          id: string
          is_active: boolean
          is_featured: boolean
          name: string
          name_en: string | null
          price_from: number
          price_to: number | null
          slug: string
          sort_order: number
          subtitle: string | null
          subtitle_en: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          cta_label?: string | null
          cta_label_en?: string | null
          currency?: string
          description?: string | null
          description_en?: string | null
          features?: Json
          features_en?: Json
          id?: string
          is_active?: boolean
          is_featured?: boolean
          name: string
          name_en?: string | null
          price_from?: number
          price_to?: number | null
          slug: string
          sort_order?: number
          subtitle?: string | null
          subtitle_en?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          cta_label?: string | null
          cta_label_en?: string | null
          currency?: string
          description?: string | null
          description_en?: string | null
          features?: Json
          features_en?: Json
          id?: string
          is_active?: boolean
          is_featured?: boolean
          name?: string
          name_en?: string | null
          price_from?: number
          price_to?: number | null
          slug?: string
          sort_order?: number
          subtitle?: string | null
          subtitle_en?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      page_views: {
        Row: {
          created_at: string
          id: string
          path: string
          referrer: string | null
          session_id: string
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          path: string
          referrer?: string | null
          session_id: string
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          path?: string
          referrer?: string | null
          session_id?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      telegram_admins: {
        Row: {
          chat_id: number | null
          created_at: string
          id: string
          is_active: boolean
          link_code: string | null
          link_code_expires_at: string | null
          linked_at: string | null
          notifications_enabled: boolean
          user_id: string | null
          username: string | null
        }
        Insert: {
          chat_id?: number | null
          created_at?: string
          id?: string
          is_active?: boolean
          link_code?: string | null
          link_code_expires_at?: string | null
          linked_at?: string | null
          notifications_enabled?: boolean
          user_id?: string | null
          username?: string | null
        }
        Update: {
          chat_id?: number | null
          created_at?: string
          id?: string
          is_active?: boolean
          link_code?: string | null
          link_code_expires_at?: string | null
          linked_at?: string | null
          notifications_enabled?: boolean
          user_id?: string | null
          username?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wan_runs: {
        Row: {
          compiled_prompt: string
          created_at: string
          duration_ms: number | null
          error_message: string | null
          first_frame_url: string | null
          id: string
          last_frame_description: string | null
          last_frame_url: string | null
          mood: Json
          motion: Json
          negative_prompt: string | null
          output: Json
          preset_id: string | null
          preset_name: string | null
          status: string
          style_strength: number
          thumbnail_url: string | null
          updated_at: string
          user_id: string | null
          user_prompt: string
          video_url: string | null
        }
        Insert: {
          compiled_prompt: string
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          first_frame_url?: string | null
          id?: string
          last_frame_description?: string | null
          last_frame_url?: string | null
          mood?: Json
          motion?: Json
          negative_prompt?: string | null
          output?: Json
          preset_id?: string | null
          preset_name?: string | null
          status?: string
          style_strength?: number
          thumbnail_url?: string | null
          updated_at?: string
          user_id?: string | null
          user_prompt: string
          video_url?: string | null
        }
        Update: {
          compiled_prompt?: string
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          first_frame_url?: string | null
          id?: string
          last_frame_description?: string | null
          last_frame_url?: string | null
          mood?: Json
          motion?: Json
          negative_prompt?: string | null
          output?: Json
          preset_id?: string | null
          preset_name?: string | null
          status?: string
          style_strength?: number
          thumbnail_url?: string | null
          updated_at?: string
          user_id?: string | null
          user_prompt?: string
          video_url?: string | null
        }
        Relationships: []
      }
      works: {
        Row: {
          category_id: string | null
          cover_image_url: string
          created_at: string
          created_by: string | null
          description: string | null
          description_en: string | null
          event_date: string | null
          featured: boolean
          gallery: Json
          id: string
          materials: string[]
          price_range: string | null
          slug: string
          sort_order: number
          status: Database["public"]["Enums"]["work_status"]
          tags: string[]
          title: string
          title_en: string | null
          updated_at: string
          video_url: string | null
          view_count: number
        }
        Insert: {
          category_id?: string | null
          cover_image_url: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          description_en?: string | null
          event_date?: string | null
          featured?: boolean
          gallery?: Json
          id?: string
          materials?: string[]
          price_range?: string | null
          slug: string
          sort_order?: number
          status?: Database["public"]["Enums"]["work_status"]
          tags?: string[]
          title: string
          title_en?: string | null
          updated_at?: string
          video_url?: string | null
          view_count?: number
        }
        Update: {
          category_id?: string | null
          cover_image_url?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          description_en?: string | null
          event_date?: string | null
          featured?: boolean
          gallery?: Json
          id?: string
          materials?: string[]
          price_range?: string | null
          slug?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["work_status"]
          tags?: string[]
          title?: string
          title_en?: string | null
          updated_at?: string
          video_url?: string | null
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "works_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      kb_search_chunks: {
        Args: {
          filter_language?: string
          match_count?: number
          query_text: string
        }
        Returns: {
          chunk_id: string
          chunk_text: string
          document_id: string
          document_source: string
          document_title: string
          rank: number
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "editor"
      gen_status: "queued" | "running" | "completed" | "failed" | "cancelled"
      work_status: "draft" | "published" | "archived"
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
    Enums: {
      app_role: ["admin", "editor"],
      gen_status: ["queued", "running", "completed", "failed", "cancelled"],
      work_status: ["draft", "published", "archived"],
    },
  },
} as const
