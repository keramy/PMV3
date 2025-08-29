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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: unknown | null
          project_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: unknown | null
          project_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: unknown | null
          project_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "migration_audit_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      change_orders: {
        Row: {
          client_approval_status: string | null
          client_approved_at: string | null
          client_approved_by: string | null
          co_number: string | null
          cost_impact: number | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          implementation_date: string | null
          internal_approval_status: string | null
          internal_approved_at: string | null
          internal_approved_by: string | null
          project_id: string | null
          reason: string | null
          status: string | null
          time_impact: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          client_approval_status?: string | null
          client_approved_at?: string | null
          client_approved_by?: string | null
          co_number?: string | null
          cost_impact?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          implementation_date?: string | null
          internal_approval_status?: string | null
          internal_approved_at?: string | null
          internal_approved_by?: string | null
          project_id?: string | null
          reason?: string | null
          status?: string | null
          time_impact?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          client_approval_status?: string | null
          client_approved_at?: string | null
          client_approved_by?: string | null
          co_number?: string | null
          cost_impact?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          implementation_date?: string | null
          internal_approval_status?: string | null
          internal_approved_at?: string | null
          internal_approved_by?: string | null
          project_id?: string | null
          reason?: string | null
          status?: string | null
          time_impact?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "change_orders_client_approved_by_fkey"
            columns: ["client_approved_by"]
            isOneToOne: false
            referencedRelation: "migration_audit_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "change_orders_client_approved_by_fkey"
            columns: ["client_approved_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "change_orders_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "migration_audit_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "change_orders_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "change_orders_internal_approved_by_fkey"
            columns: ["internal_approved_by"]
            isOneToOne: false
            referencedRelation: "migration_audit_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "change_orders_internal_approved_by_fkey"
            columns: ["internal_approved_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "change_orders_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          address: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      material_specs: {
        Row: {
          approval_date: string | null
          approved_by: string | null
          category: string | null
          created_at: string | null
          created_by: string | null
          id: string
          image_url: string | null
          manufacturer: string | null
          model: string | null
          name: string
          notes: string | null
          priority: Database["public"]["Enums"]["material_priority"]
          project_id: string | null
          quantity: number | null
          review_date: string | null
          review_notes: string | null
          reviewed_by: string | null
          spec_number: string | null
          specification: string | null
          status: string | null
          supplier: string | null
          total_cost: number | null
          unit: string | null
          unit_cost: number | null
          updated_at: string | null
        }
        Insert: {
          approval_date?: string | null
          approved_by?: string | null
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          image_url?: string | null
          manufacturer?: string | null
          model?: string | null
          name: string
          notes?: string | null
          priority?: Database["public"]["Enums"]["material_priority"]
          project_id?: string | null
          quantity?: number | null
          review_date?: string | null
          review_notes?: string | null
          reviewed_by?: string | null
          spec_number?: string | null
          specification?: string | null
          status?: string | null
          supplier?: string | null
          total_cost?: number | null
          unit?: string | null
          unit_cost?: number | null
          updated_at?: string | null
        }
        Update: {
          approval_date?: string | null
          approved_by?: string | null
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          image_url?: string | null
          manufacturer?: string | null
          model?: string | null
          name?: string
          notes?: string | null
          priority?: Database["public"]["Enums"]["material_priority"]
          project_id?: string | null
          quantity?: number | null
          review_date?: string | null
          review_notes?: string | null
          reviewed_by?: string | null
          spec_number?: string | null
          specification?: string | null
          status?: string | null
          supplier?: string | null
          total_cost?: number | null
          unit?: string | null
          unit_cost?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "material_specs_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "migration_audit_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "material_specs_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "material_specs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "migration_audit_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "material_specs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "material_specs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "material_specs_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "migration_audit_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "material_specs_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          assignment_notifications: boolean | null
          comment_notifications: boolean | null
          created_at: string | null
          due_date_notifications: boolean | null
          in_app_enabled: boolean | null
          mention_notifications: boolean | null
          status_change_notifications: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          assignment_notifications?: boolean | null
          comment_notifications?: boolean | null
          created_at?: string | null
          due_date_notifications?: boolean | null
          in_app_enabled?: boolean | null
          mention_notifications?: boolean | null
          status_change_notifications?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          assignment_notifications?: boolean | null
          comment_notifications?: boolean | null
          created_at?: string | null
          due_date_notifications?: boolean | null
          in_app_enabled?: boolean | null
          mention_notifications?: boolean | null
          status_change_notifications?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "migration_audit_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          data: Json | null
          id: string
          message: string
          read_at: string | null
          title: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          id?: string
          message: string
          read_at?: string | null
          title: string
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          id?: string
          message?: string
          read_at?: string | null
          title?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "migration_audit_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      project_members: {
        Row: {
          created_at: string | null
          id: string
          joined_at: string | null
          permissions: string[] | null
          project_id: string | null
          role: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          joined_at?: string | null
          permissions?: string[] | null
          project_id?: string | null
          role?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          joined_at?: string | null
          permissions?: string[] | null
          project_id?: string | null
          role?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "migration_audit_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          actual_cost: number | null
          address: string | null
          budget: number | null
          client_contact: string | null
          client_email: string | null
          client_name: string | null
          company_id: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          end_date: string | null
          id: string
          name: string
          priority: string | null
          progress_percentage: number | null
          project_code: string | null
          project_manager: string | null
          project_number: string | null
          start_date: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          actual_cost?: number | null
          address?: string | null
          budget?: number | null
          client_contact?: string | null
          client_email?: string | null
          client_name?: string | null
          company_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          priority?: string | null
          progress_percentage?: number | null
          project_code?: string | null
          project_manager?: string | null
          project_number?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          actual_cost?: number | null
          address?: string | null
          budget?: number | null
          client_contact?: string | null
          client_email?: string | null
          client_name?: string | null
          company_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          priority?: string | null
          progress_percentage?: number | null
          project_code?: string | null
          project_manager?: string | null
          project_number?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "migration_audit_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_project_manager_fkey"
            columns: ["project_manager"]
            isOneToOne: false
            referencedRelation: "migration_audit_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_project_manager_fkey"
            columns: ["project_manager"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      punch_items: {
        Row: {
          assigned_to: string | null
          category: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          identified_by: string | null
          item_number: string | null
          location: string | null
          notes: string | null
          photo_urls: string[] | null
          priority: string | null
          project_id: string | null
          resolved_date: string | null
          status: string | null
          title: string
          trade: string | null
          updated_at: string | null
          verified_by: string | null
          verified_date: string | null
        }
        Insert: {
          assigned_to?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          identified_by?: string | null
          item_number?: string | null
          location?: string | null
          notes?: string | null
          photo_urls?: string[] | null
          priority?: string | null
          project_id?: string | null
          resolved_date?: string | null
          status?: string | null
          title: string
          trade?: string | null
          updated_at?: string | null
          verified_by?: string | null
          verified_date?: string | null
        }
        Update: {
          assigned_to?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          identified_by?: string | null
          item_number?: string | null
          location?: string | null
          notes?: string | null
          photo_urls?: string[] | null
          priority?: string | null
          project_id?: string | null
          resolved_date?: string | null
          status?: string | null
          title?: string
          trade?: string | null
          updated_at?: string | null
          verified_by?: string | null
          verified_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "punch_items_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "migration_audit_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "punch_items_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "punch_items_identified_by_fkey"
            columns: ["identified_by"]
            isOneToOne: false
            referencedRelation: "migration_audit_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "punch_items_identified_by_fkey"
            columns: ["identified_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "punch_items_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "punch_items_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "migration_audit_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "punch_items_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      rfis: {
        Row: {
          answer: string | null
          answered_at: string | null
          answered_by: string | null
          assigned_to: string | null
          attachments: Json | null
          category: string | null
          created_at: string | null
          due_date: string | null
          id: string
          priority: string | null
          project_id: string | null
          question: string
          rfi_number: string | null
          status: string | null
          submitted_at: string | null
          submitted_by: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          answer?: string | null
          answered_at?: string | null
          answered_by?: string | null
          assigned_to?: string | null
          attachments?: Json | null
          category?: string | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          project_id?: string | null
          question: string
          rfi_number?: string | null
          status?: string | null
          submitted_at?: string | null
          submitted_by?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          answer?: string | null
          answered_at?: string | null
          answered_by?: string | null
          assigned_to?: string | null
          attachments?: Json | null
          category?: string | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          project_id?: string | null
          question?: string
          rfi_number?: string | null
          status?: string | null
          submitted_at?: string | null
          submitted_by?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rfis_answered_by_fkey"
            columns: ["answered_by"]
            isOneToOne: false
            referencedRelation: "migration_audit_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rfis_answered_by_fkey"
            columns: ["answered_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rfis_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "migration_audit_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rfis_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rfis_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rfis_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "migration_audit_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rfis_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      role_configurations: {
        Row: {
          created_at: string | null
          default_can_edit_costs: boolean
          default_can_view_costs: boolean
          description: string | null
          display_name: string
          id: string
          permission_level: number
          project_access_type: string
          role_name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          default_can_edit_costs?: boolean
          default_can_view_costs?: boolean
          description?: string | null
          display_name: string
          id?: string
          permission_level: number
          project_access_type?: string
          role_name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          default_can_edit_costs?: boolean
          default_can_view_costs?: boolean
          description?: string | null
          display_name?: string
          id?: string
          permission_level?: number
          project_access_type?: string
          role_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      scope_items: {
        Row: {
          actual_cost: number | null
          assigned_to: string | null
          category: string | null
          cost_variance: number | null
          cost_variance_percentage: number | null
          created_at: string | null
          created_by: string | null
          description: string | null
          end_date: string | null
          id: string
          initial_cost: number | null
          item_sequence: number | null
          notes: string | null
          priority: string | null
          project_id: string
          quantity: number | null
          scope_code: string | null
          specification: string | null
          start_date: string | null
          status: string | null
          subcontractor_id: string | null
          title: string
          total_cost: number | null
          unit: Database["public"]["Enums"]["unit_type"] | null
          unit_cost: number | null
          updated_at: string | null
        }
        Insert: {
          actual_cost?: number | null
          assigned_to?: string | null
          category?: string | null
          cost_variance?: number | null
          cost_variance_percentage?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          initial_cost?: number | null
          item_sequence?: number | null
          notes?: string | null
          priority?: string | null
          project_id: string
          quantity?: number | null
          scope_code?: string | null
          specification?: string | null
          start_date?: string | null
          status?: string | null
          subcontractor_id?: string | null
          title: string
          total_cost?: number | null
          unit?: Database["public"]["Enums"]["unit_type"] | null
          unit_cost?: number | null
          updated_at?: string | null
        }
        Update: {
          actual_cost?: number | null
          assigned_to?: string | null
          category?: string | null
          cost_variance?: number | null
          cost_variance_percentage?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          initial_cost?: number | null
          item_sequence?: number | null
          notes?: string | null
          priority?: string | null
          project_id?: string
          quantity?: number | null
          scope_code?: string | null
          specification?: string | null
          start_date?: string | null
          status?: string | null
          subcontractor_id?: string | null
          title?: string
          total_cost?: number | null
          unit?: Database["public"]["Enums"]["unit_type"] | null
          unit_cost?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_scope_items_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scope_items_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "migration_audit_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scope_items_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scope_items_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "migration_audit_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scope_items_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scope_items_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scope_items_subcontractor_id_fkey"
            columns: ["subcontractor_id"]
            isOneToOne: false
            referencedRelation: "subcontractors"
            referencedColumns: ["id"]
          },
        ]
      }
      shop_drawing_comments: {
        Row: {
          attachments: Json | null
          comment: string
          comment_type: string | null
          created_at: string | null
          id: string
          is_resolved: boolean | null
          shop_drawing_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          attachments?: Json | null
          comment: string
          comment_type?: string | null
          created_at?: string | null
          id?: string
          is_resolved?: boolean | null
          shop_drawing_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          attachments?: Json | null
          comment?: string
          comment_type?: string | null
          created_at?: string | null
          id?: string
          is_resolved?: boolean | null
          shop_drawing_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shop_drawing_comments_shop_drawing_id_fkey"
            columns: ["shop_drawing_id"]
            isOneToOne: false
            referencedRelation: "shop_drawings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shop_drawing_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "migration_audit_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shop_drawing_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      shop_drawings: {
        Row: {
          assigned_to: string | null
          category: Database["public"]["Enums"]["drawing_category"] | null
          client_comments: string | null
          client_contact: string | null
          client_response_date: string | null
          client_response_type: string | null
          created_at: string | null
          current_turn: string | null
          days_with_client: number | null
          description: string | null
          drawing_number: string | null
          due_date: string | null
          file_name: string | null
          file_size: number | null
          file_url: string | null
          id: string
          priority: Database["public"]["Enums"]["drawing_priority"] | null
          project_id: string | null
          responsibility: string | null
          review_comments: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          revision: string | null
          status: string | null
          submitted_at: string | null
          submitted_by: string | null
          submitted_to_client_by: string | null
          submitted_to_client_date: string | null
          title: string
          trade: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          category?: Database["public"]["Enums"]["drawing_category"] | null
          client_comments?: string | null
          client_contact?: string | null
          client_response_date?: string | null
          client_response_type?: string | null
          created_at?: string | null
          current_turn?: string | null
          days_with_client?: number | null
          description?: string | null
          drawing_number?: string | null
          due_date?: string | null
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["drawing_priority"] | null
          project_id?: string | null
          responsibility?: string | null
          review_comments?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          revision?: string | null
          status?: string | null
          submitted_at?: string | null
          submitted_by?: string | null
          submitted_to_client_by?: string | null
          submitted_to_client_date?: string | null
          title: string
          trade?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          category?: Database["public"]["Enums"]["drawing_category"] | null
          client_comments?: string | null
          client_contact?: string | null
          client_response_date?: string | null
          client_response_type?: string | null
          created_at?: string | null
          current_turn?: string | null
          days_with_client?: number | null
          description?: string | null
          drawing_number?: string | null
          due_date?: string | null
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["drawing_priority"] | null
          project_id?: string | null
          responsibility?: string | null
          review_comments?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          revision?: string | null
          status?: string | null
          submitted_at?: string | null
          submitted_by?: string | null
          submitted_to_client_by?: string | null
          submitted_to_client_date?: string | null
          title?: string
          trade?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_shop_drawings_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shop_drawings_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "migration_audit_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shop_drawings_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shop_drawings_client_contact_fkey"
            columns: ["client_contact"]
            isOneToOne: false
            referencedRelation: "migration_audit_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shop_drawings_client_contact_fkey"
            columns: ["client_contact"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shop_drawings_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shop_drawings_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "migration_audit_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shop_drawings_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shop_drawings_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "migration_audit_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shop_drawings_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shop_drawings_submitted_to_client_by_fkey"
            columns: ["submitted_to_client_by"]
            isOneToOne: false
            referencedRelation: "migration_audit_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shop_drawings_submitted_to_client_by_fkey"
            columns: ["submitted_to_client_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subcontractors: {
        Row: {
          address: string | null
          company_id: string | null
          contact_person: string | null
          created_at: string | null
          email: string | null
          id: string
          is_active: boolean | null
          license_number: string | null
          name: string
          phone: string | null
          trade: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          company_id?: string | null
          contact_person?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          license_number?: string | null
          name: string
          phone?: string | null
          trade?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          company_id?: string | null
          contact_person?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          license_number?: string | null
          name?: string
          phone?: string | null
          trade?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subcontractors_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      task_comments: {
        Row: {
          attachments: Json | null
          comment: string
          comment_type: string | null
          created_at: string | null
          id: string
          mentions: string[] | null
          task_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          attachments?: Json | null
          comment: string
          comment_type?: string | null
          created_at?: string | null
          id?: string
          mentions?: string[] | null
          task_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          attachments?: Json | null
          comment?: string
          comment_type?: string | null
          created_at?: string | null
          id?: string
          mentions?: string[] | null
          task_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_comments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "migration_audit_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          actual_hours: number | null
          assigned_to: string | null
          attachments: Json | null
          completion_date: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          due_date: string | null
          estimated_hours: number | null
          id: string
          parent_task_id: string | null
          priority: string | null
          progress_percentage: number | null
          project_id: string | null
          start_date: string | null
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          actual_hours?: number | null
          assigned_to?: string | null
          attachments?: Json | null
          completion_date?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          id?: string
          parent_task_id?: string | null
          priority?: string | null
          progress_percentage?: number | null
          project_id?: string | null
          start_date?: string | null
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          actual_hours?: number | null
          assigned_to?: string | null
          attachments?: Json | null
          completion_date?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          id?: string
          parent_task_id?: string | null
          priority?: string | null
          progress_percentage?: number | null
          project_id?: string | null
          start_date?: string | null
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_tasks_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "migration_audit_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "migration_audit_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_parent_task_id_fkey"
            columns: ["parent_task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          assigned_projects: string[] | null
          avatar_url: string | null
          can_view_costs: boolean | null
          created_at: string | null
          email: string
          first_name: string | null
          id: string
          is_active: boolean | null
          job_title: string | null
          last_login: string | null
          last_name: string | null
          permissions: string[] | null
          permissions_bitwise: number | null
          phone: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_projects?: string[] | null
          avatar_url?: string | null
          can_view_costs?: boolean | null
          created_at?: string | null
          email: string
          first_name?: string | null
          id: string
          is_active?: boolean | null
          job_title?: string | null
          last_login?: string | null
          last_name?: string | null
          permissions?: string[] | null
          permissions_bitwise?: number | null
          phone?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_projects?: string[] | null
          avatar_url?: string | null
          can_view_costs?: boolean | null
          created_at?: string | null
          email?: string
          first_name?: string | null
          id?: string
          is_active?: boolean | null
          job_title?: string | null
          last_login?: string | null
          last_name?: string | null
          permissions?: string[] | null
          permissions_bitwise?: number | null
          phone?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      material_specs_pm_dashboard: {
        Row: {
          approval_date: string | null
          approved_by_name: string | null
          category: string | null
          created_at: string | null
          created_by_name: string | null
          days_since_created: number | null
          days_since_review: number | null
          id: string | null
          manufacturer: string | null
          model: string | null
          name: string | null
          priority: Database["public"]["Enums"]["material_priority"] | null
          project_id: string | null
          project_name: string | null
          review_date: string | null
          review_notes: string | null
          spec_number: string | null
          status: string | null
          supplier: string | null
          total_cost: number | null
        }
        Relationships: [
          {
            foreignKeyName: "material_specs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      migration_audit_view: {
        Row: {
          assigned_projects: string[] | null
          can_view_costs: boolean | null
          email: string | null
          first_name: string | null
          id: string | null
          last_name: string | null
          migration_date: string | null
          old_permissions: string[] | null
          role: string | null
        }
        Insert: {
          assigned_projects?: string[] | null
          can_view_costs?: boolean | null
          email?: string | null
          first_name?: string | null
          id?: string | null
          last_name?: string | null
          migration_date?: string | null
          old_permissions?: string[] | null
          role?: string | null
        }
        Update: {
          assigned_projects?: string[] | null
          can_view_costs?: boolean | null
          email?: string | null
          first_name?: string | null
          id?: string | null
          last_name?: string | null
          migration_date?: string | null
          old_permissions?: string[] | null
          role?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      assign_client_to_projects: {
        Args: { client_user_id: string; project_ids: string[] }
        Returns: boolean
      }
      can_user_access_project: {
        Args: { check_project_id: string; check_user_id: string }
        Returns: boolean
      }
      create_notification: {
        Args: {
          notification_data?: Json
          notification_message: string
          notification_title: string
          notification_type: string
          target_user_id: string
        }
        Returns: string
      }
      get_effective_permissions: {
        Args: { user_id: string }
        Returns: {
          assigned_projects: string[]
          can_edit_costs: boolean
          can_view_costs: boolean
          permission_level: number
          project_access_type: string
          role: string
        }[]
      }
      get_next_scope_sequence: {
        Args: { p_project_id: string }
        Returns: number
      }
      get_unread_notification_count: {
        Args: { target_user_id: string }
        Returns: number
      }
      mark_all_notifications_as_read: {
        Args: { target_user_id: string }
        Returns: number
      }
      mark_notifications_as_read: {
        Args: { notification_ids: string[]; target_user_id: string }
        Returns: number
      }
      migrate_existing_permissions: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      user_can_access_project: {
        Args: { project_id: string; user_id: string }
        Returns: boolean
      }
      user_can_view_costs: {
        Args: { user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      drawing_category:
        | "construction"
        | "millwork"
        | "electrical"
        | "mechanical"
        | "plumbing"
        | "hvac"
      drawing_priority: "low" | "medium" | "high" | "critical"
      drawing_status:
        | "pending_submittal"
        | "submitted_to_client"
        | "revision_requested"
        | "approved"
        | "rejected"
      material_category:
        | "wood"
        | "metal"
        | "glass"
        | "stone"
        | "paint"
        | "floor"
        | "fabric"
        | "hardware"
        | "miscellaneous"
      material_priority: "low" | "medium" | "high" | "critical"
      priority_level: "low" | "medium" | "high" | "critical"
      shop_drawing_approval_stage:
        | "not_submitted"
        | "internal_review"
        | "client_review"
        | "approved"
        | "approved_with_comments"
        | "rejected"
        | "resubmit_required"
      shop_drawing_category:
        | "architectural"
        | "structural"
        | "mechanical"
        | "electrical"
        | "plumbing"
        | "hvac"
        | "fire_protection"
        | "technology"
        | "specialty"
        | "other"
      unit_type:
        | "pcs"
        | "set"
        | "lm"
        | "sqm"
        | "cum"
        | "kg"
        | "ton"
        | "lot"
        | "ea"
        | "sf"
        | "lf"
        | "cf"
        | "hrs"
        | "days"
        | "roll"
        | "bag"
        | "box"
        | "can"
        | "gal"
        | "ltr"
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
      drawing_category: [
        "construction",
        "millwork",
        "electrical",
        "mechanical",
        "plumbing",
        "hvac",
      ],
      drawing_priority: ["low", "medium", "high", "critical"],
      drawing_status: [
        "pending_submittal",
        "submitted_to_client",
        "revision_requested",
        "approved",
        "rejected",
      ],
      material_category: [
        "wood",
        "metal",
        "glass",
        "stone",
        "paint",
        "floor",
        "fabric",
        "hardware",
        "miscellaneous",
      ],
      material_priority: ["low", "medium", "high", "critical"],
      priority_level: ["low", "medium", "high", "critical"],
      shop_drawing_approval_stage: [
        "not_submitted",
        "internal_review",
        "client_review",
        "approved",
        "approved_with_comments",
        "rejected",
        "resubmit_required",
      ],
      shop_drawing_category: [
        "architectural",
        "structural",
        "mechanical",
        "electrical",
        "plumbing",
        "hvac",
        "fire_protection",
        "technology",
        "specialty",
        "other",
      ],
      unit_type: [
        "pcs",
        "set",
        "lm",
        "sqm",
        "cum",
        "kg",
        "ton",
        "lot",
        "ea",
        "sf",
        "lf",
        "cf",
        "hrs",
        "days",
        "roll",
        "bag",
        "box",
        "can",
        "gal",
        "ltr",
      ],
    },
  },
} as const