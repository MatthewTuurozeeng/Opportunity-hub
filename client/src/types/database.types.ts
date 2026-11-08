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
    PostgrestVersion: "14.18"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      application_documents: {
        Row: {
          application_id: string
          created_at: string
          document_id: string
          user_id: string
        }
        Insert: {
          application_id: string
          created_at?: string
          document_id: string
          user_id?: string
        }
        Update: {
          application_id?: string
          created_at?: string
          document_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "application_documents_application_id_user_id_fkey"
            columns: ["application_id", "user_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "application_documents_document_id_user_id_fkey"
            columns: ["document_id", "user_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "application_documents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      application_events: {
        Row: {
          application_id: string | null
          created_at: string
          description: string | null
          ends_at: string | null
          event_type: Database["public"]["Enums"]["application_event_type"]
          id: string
          is_all_day: boolean
          is_completed: boolean
          location: string | null
          starts_at: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          application_id?: string | null
          created_at?: string
          description?: string | null
          ends_at?: string | null
          event_type: Database["public"]["Enums"]["application_event_type"]
          id?: string
          is_all_day?: boolean
          is_completed?: boolean
          location?: string | null
          starts_at: string
          title: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          application_id?: string | null
          created_at?: string
          description?: string | null
          ends_at?: string | null
          event_type?: Database["public"]["Enums"]["application_event_type"]
          id?: string
          is_all_day?: boolean
          is_completed?: boolean
          location?: string | null
          starts_at?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "application_events_application_id_user_id_fkey"
            columns: ["application_id", "user_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "application_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      application_status_history: {
        Row: {
          application_id: string
          changed_at: string
          id: string
          new_status: Database["public"]["Enums"]["application_status"]
          notes: string | null
          previous_status:
            | Database["public"]["Enums"]["application_status"]
            | null
          user_id: string
        }
        Insert: {
          application_id: string
          changed_at?: string
          id?: string
          new_status: Database["public"]["Enums"]["application_status"]
          notes?: string | null
          previous_status?:
            | Database["public"]["Enums"]["application_status"]
            | null
          user_id: string
        }
        Update: {
          application_id?: string
          changed_at?: string
          id?: string
          new_status?: Database["public"]["Enums"]["application_status"]
          notes?: string | null
          previous_status?:
            | Database["public"]["Enums"]["application_status"]
            | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "application_status_history_application_id_user_id_fkey"
            columns: ["application_id", "user_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "application_status_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      applications: {
        Row: {
          application_method: string | null
          created_at: string
          id: string
          notes: string | null
          opportunity_id: string
          reference_number: string | null
          status: Database["public"]["Enums"]["application_status"]
          submitted_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          application_method?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          opportunity_id: string
          reference_number?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          submitted_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Update: {
          application_method?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          opportunity_id?: string
          reference_number?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          submitted_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_opportunity_id_user_id_fkey"
            columns: ["opportunity_id", "user_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "applications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      communications: {
        Row: {
          application_id: string
          attachment_document_id: string | null
          communicated_at: string
          communication_type: Database["public"]["Enums"]["communication_type"]
          content: string | null
          created_at: string
          direction: Database["public"]["Enums"]["communication_direction"]
          external_link: string | null
          id: string
          recipient: string | null
          sender: string | null
          subject: string
          summary: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          application_id: string
          attachment_document_id?: string | null
          communicated_at: string
          communication_type?: Database["public"]["Enums"]["communication_type"]
          content?: string | null
          created_at?: string
          direction: Database["public"]["Enums"]["communication_direction"]
          external_link?: string | null
          id?: string
          recipient?: string | null
          sender?: string | null
          subject: string
          summary?: string | null
          updated_at?: string
          user_id?: string
        }
        Update: {
          application_id?: string
          attachment_document_id?: string | null
          communicated_at?: string
          communication_type?: Database["public"]["Enums"]["communication_type"]
          content?: string | null
          created_at?: string
          direction?: Database["public"]["Enums"]["communication_direction"]
          external_link?: string | null
          id?: string
          recipient?: string | null
          sender?: string | null
          subject?: string
          summary?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "communications_application_id_user_id_fkey"
            columns: ["application_id", "user_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "communications_attachment_document_id_user_id_fkey"
            columns: ["attachment_document_id", "user_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "communications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          category: Database["public"]["Enums"]["document_category"]
          created_at: string
          description: string | null
          file_name: string
          id: string
          mime_type: string
          name: string
          size_bytes: number
          storage_path: string
          updated_at: string
          user_id: string
          version: number
          version_group_id: string
        }
        Insert: {
          category?: Database["public"]["Enums"]["document_category"]
          created_at?: string
          description?: string | null
          file_name: string
          id?: string
          mime_type: string
          name: string
          size_bytes: number
          storage_path: string
          updated_at?: string
          user_id?: string
          version?: number
          version_group_id?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["document_category"]
          created_at?: string
          description?: string | null
          file_name?: string
          id?: string
          mime_type?: string
          name?: string
          size_bytes?: number
          storage_path?: string
          updated_at?: string
          user_id?: string
          version?: number
          version_group_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notes: {
        Row: {
          application_id: string | null
          category: Database["public"]["Enums"]["note_category"]
          content: string
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          application_id?: string | null
          category?: Database["public"]["Enums"]["note_category"]
          content: string
          created_at?: string
          id?: string
          title: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          application_id?: string | null
          category?: Database["public"]["Enums"]["note_category"]
          content?: string
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notes_application_id_user_id_fkey"
            columns: ["application_id", "user_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "notes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunities: {
        Row: {
          application_url: string | null
          category_id: string | null
          created_at: string
          deadline: string | null
          description: string | null
          id: string
          location: string | null
          organization: string
          source: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          application_url?: string | null
          category_id?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          location?: string | null
          organization: string
          source?: string | null
          title: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          application_url?: string | null
          category_id?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          location?: string | null
          organization?: string
          source?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "opportunities_category_id_user_id_fkey"
            columns: ["category_id", "user_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "opportunities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      change_application_status: {
        Args: {
          p_application_id: string
          p_note?: string
          p_status: Database["public"]["Enums"]["application_status"]
        }
        Returns: undefined
      }
      create_opportunity_application: {
        Args: { p_application: Json; p_opportunity: Json }
        Returns: string
      }
      owner_account_exists: { Args: never; Returns: boolean }
      update_opportunity_application: {
        Args: {
          p_application: Json
          p_application_id: string
          p_opportunity: Json
        }
        Returns: undefined
      }
    }
    Enums: {
      application_event_type:
        | "application_deadline"
        | "submission"
        | "shortlisting_notification"
        | "interview_invitation"
        | "interview"
        | "assessment"
        | "follow_up_reminder"
        | "acceptance_notification"
        | "rejection_notification"
        | "other"
      application_status:
        | "draft"
        | "submitted"
        | "under_review"
        | "shortlisted"
        | "interview"
        | "assessment"
        | "successful"
        | "unsuccessful"
        | "withdrawn"
        | "no_response"
      communication_direction: "received" | "sent"
      communication_type:
        | "application_confirmation"
        | "interview_invitation"
        | "follow_up"
        | "assessment_notification"
        | "acceptance_notification"
        | "rejection_notification"
        | "general_inquiry"
        | "other"
      document_category:
        | "curriculum_vitae"
        | "cover_letter"
        | "academic_transcript"
        | "recommendation_letter"
        | "certificate"
        | "personal_statement"
        | "essay_writing_sample"
        | "identification_document"
        | "application_form"
        | "other"
      note_category:
        | "interview_preparation"
        | "interview_questions"
        | "interview_reflection"
        | "feedback_received"
        | "strengths"
        | "areas_for_improvement"
        | "lessons_learned"
        | "follow_up"
        | "general"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      application_event_type: [
        "application_deadline",
        "submission",
        "shortlisting_notification",
        "interview_invitation",
        "interview",
        "assessment",
        "follow_up_reminder",
        "acceptance_notification",
        "rejection_notification",
        "other",
      ],
      application_status: [
        "draft",
        "submitted",
        "under_review",
        "shortlisted",
        "interview",
        "assessment",
        "successful",
        "unsuccessful",
        "withdrawn",
        "no_response",
      ],
      communication_direction: ["received", "sent"],
      communication_type: [
        "application_confirmation",
        "interview_invitation",
        "follow_up",
        "assessment_notification",
        "acceptance_notification",
        "rejection_notification",
        "general_inquiry",
        "other",
      ],
      document_category: [
        "curriculum_vitae",
        "cover_letter",
        "academic_transcript",
        "recommendation_letter",
        "certificate",
        "personal_statement",
        "essay_writing_sample",
        "identification_document",
        "application_form",
        "other",
      ],
      note_category: [
        "interview_preparation",
        "interview_questions",
        "interview_reflection",
        "feedback_received",
        "strengths",
        "areas_for_improvement",
        "lessons_learned",
        "follow_up",
        "general",
      ],
    },
  },
} as const
