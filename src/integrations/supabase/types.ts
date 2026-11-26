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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      pulse_accounts: {
        Row: {
          alert_state: string
          alert_state_changed_at: string | null
          checkins: Json
          contact_confirm_sent_at: string | null
          contact_confirmed_at: string | null
          contact_confirmed_email: string | null
          contact_email: string
          contact_name: string
          contact_phone: string | null
          country_code: string | null
          created_at: string
          id: string
          interval_ms: number
          last_checkin: string | null
          paused_until: string | null
          recovery_code_created_at: string | null
          recovery_code_expires_at: string | null
          recovery_code_hash: string | null
          updated_at: string
          user_name: string
        }
        Insert: {
          alert_state?: string
          alert_state_changed_at?: string | null
          checkins?: Json
          contact_confirm_sent_at?: string | null
          contact_confirmed_at?: string | null
          contact_confirmed_email?: string | null
          contact_email: string
          contact_name?: string
          contact_phone?: string | null
          country_code?: string | null
          created_at?: string
          id?: string
          interval_ms?: number
          last_checkin?: string | null
          paused_until?: string | null
          recovery_code_created_at?: string | null
          recovery_code_expires_at?: string | null
          recovery_code_hash?: string | null
          updated_at?: string
          user_name?: string
        }
        Update: {
          alert_state?: string
          alert_state_changed_at?: string | null
          checkins?: Json
          contact_confirm_sent_at?: string | null
          contact_confirmed_at?: string | null
          contact_confirmed_email?: string | null
          contact_email?: string
          contact_name?: string
          contact_phone?: string | null
          country_code?: string | null
          created_at?: string
          id?: string
          interval_ms?: number
          last_checkin?: string | null
          paused_until?: string | null
          recovery_code_created_at?: string | null
          recovery_code_expires_at?: string | null
          recovery_code_hash?: string | null
          updated_at?: string
          user_name?: string
        }
        Relationships: []
      }
      pulse_alert_deliveries: {
        Row: {
          account_id: string
          attempts: number
          bounced_at: string | null
          channel: string
          checkin_key: string
          created_at: string
          delivered_at: string | null
          last_error: string | null
          next_attempt_at: string | null
          provider_message_id: string | null
          recipient_email: string | null
          send_key: string | null
          status: string
          updated_at: string
        }
        Insert: {
          account_id: string
          attempts?: number
          bounced_at?: string | null
          channel: string
          checkin_key: string
          created_at?: string
          delivered_at?: string | null
          last_error?: string | null
          next_attempt_at?: string | null
          provider_message_id?: string | null
          recipient_email?: string | null
          send_key?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          account_id?: string
          attempts?: number
          bounced_at?: string | null
          channel?: string
          checkin_key?: string
          created_at?: string
          delivered_at?: string | null
          last_error?: string | null
          next_attempt_at?: string | null
          provider_message_id?: string | null
          recipient_email?: string | null
          send_key?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pulse_alert_deliveries_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "pulse_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      pulse_challenges: {
        Row: {
          account_id: string | null
          challenge: string
          created_at: string
          expires_at: string
          id: string
          kind: string
          origin: string
          rp_id: string
        }
        Insert: {
          account_id?: string | null
          challenge: string
          created_at?: string
          expires_at?: string
          id?: string
          kind: string
          origin: string
          rp_id: string
        }
        Update: {
          account_id?: string | null
          challenge?: string
          created_at?: string
          expires_at?: string
          id?: string
          kind?: string
          origin?: string
          rp_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pulse_challenges_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "pulse_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      pulse_contact_requests: {
        Row: {
          account_id: string
          created_at: string
          id: string
          provider_message_id: string | null
          recipient_email: string
          status: string
        }
        Insert: {
          account_id: string
          created_at?: string
          id?: string
          provider_message_id?: string | null
          recipient_email: string
          status?: string
        }
        Update: {
          account_id?: string
          created_at?: string
          id?: string
          provider_message_id?: string | null
          recipient_email?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "pulse_contact_requests_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "pulse_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      pulse_cron_heartbeats: {
        Row: {
          job: string
          last_finished_at: string | null
          last_result: Json | null
          last_started_at: string | null
          last_watchdog_alert_at: string | null
        }
        Insert: {
          job: string
          last_finished_at?: string | null
          last_result?: Json | null
          last_started_at?: string | null
          last_watchdog_alert_at?: string | null
        }
        Update: {
          job?: string
          last_finished_at?: string | null
          last_result?: Json | null
          last_started_at?: string | null
          last_watchdog_alert_at?: string | null
        }
        Relationships: []
      }
      pulse_email_events: {
        Row: {
          event_id: string
          event_type: string
          provider_message_id: string | null
          received_at: string
        }
        Insert: {
          event_id: string
          event_type: string
          provider_message_id?: string | null
          received_at?: string
        }
        Update: {
          event_id?: string
          event_type?: string
          provider_message_id?: string | null
          received_at?: string
        }
        Relationships: []
      }
      pulse_email_suppressions: {
        Row: {
          created_at: string
          email_lower: string
          reason: string
        }
        Insert: {
          created_at?: string
          email_lower: string
          reason: string
        }
        Update: {
          created_at?: string
          email_lower?: string
          reason?: string
        }
        Relationships: []
      }
      pulse_passkeys: {
        Row: {
          account_id: string
          counter: number
          created_at: string
          credential_id: string
          id: number
          public_key: string
          transports: string[]
        }
        Insert: {
          account_id: string
          counter?: number
          created_at?: string
          credential_id: string
          id?: number
          public_key: string
          transports?: string[]
        }
        Update: {
          account_id?: string
          counter?: number
          created_at?: string
          credential_id?: string
          id?: number
          public_key?: string
          transports?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "pulse_passkeys_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "pulse_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      pulse_rate_limits: {
        Row: {
          bucket: string
          hits: number
          window_start: string
        }
        Insert: {
          bucket: string
          hits?: number
          window_start: string
        }
        Update: {
          bucket?: string
          hits?: number
          window_start?: string
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      email_queue_dispatch: { Args: never; Returns: undefined }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      pulse_advance_alert_states: { Args: never; Returns: number }
      pulse_overdue_accounts: {
        Args: { _limit?: number }
        Returns: {
          id: string
        }[]
      }
      pulse_rate_hit: {
        Args: { _bucket: string; _limit: number; _window_seconds: number }
        Returns: boolean
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
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
  public: {
    Enums: {},
  },
} as const
