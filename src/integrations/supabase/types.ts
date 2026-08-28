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
    PostgrestVersion: "14.17"
  }
  public: {
    Tables: {
      bookmarks: {
        Row: {
          book_id: string
          chapter_id: string | null
          created_at: string
          id: string
          label: string
          page: number | null
          user_id: string
        }
        Insert: {
          book_id: string
          chapter_id?: string | null
          created_at?: string
          id?: string
          label?: string
          page?: number | null
          user_id: string
        }
        Update: {
          book_id?: string
          chapter_id?: string | null
          created_at?: string
          id?: string
          label?: string
          page?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookmarks_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookmarks_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      books: {
        Row: {
          author: string
          book_type: string
          classes: string[]
          collection: string | null
          content_mode: string
          content_url: string | null
          cover_url: string
          created_at: string
          description: string
          display_class: string
          display_order: number
          edition: string
          exams: string[]
          id: string
          is_paid: boolean
          legacy_id: string | null
          no_of_chapters: number
          price: number
          publisher: string
          status: string
          subject: string
          tags: string[]
          title: string
        }
        Insert: {
          author?: string
          book_type?: string
          classes?: string[]
          collection?: string | null
          content_mode?: string
          content_url?: string | null
          cover_url?: string
          created_at?: string
          description?: string
          display_class?: string
          display_order?: number
          edition?: string
          exams?: string[]
          id?: string
          is_paid?: boolean
          legacy_id?: string | null
          no_of_chapters?: number
          price?: number
          publisher?: string
          status?: string
          subject?: string
          tags?: string[]
          title: string
        }
        Update: {
          author?: string
          book_type?: string
          classes?: string[]
          collection?: string | null
          content_mode?: string
          content_url?: string | null
          cover_url?: string
          created_at?: string
          description?: string
          display_class?: string
          display_order?: number
          edition?: string
          exams?: string[]
          id?: string
          is_paid?: boolean
          legacy_id?: string | null
          no_of_chapters?: number
          price?: number
          publisher?: string
          status?: string
          subject?: string
          tags?: string[]
          title?: string
        }
        Relationships: []
      }
      chapter_resources: {
        Row: {
          book_id: string
          chapter_id: string | null
          created_at: string
          id: string
          kind: string
          title: string
          url: string
        }
        Insert: {
          book_id: string
          chapter_id?: string | null
          created_at?: string
          id?: string
          kind?: string
          title?: string
          url?: string
        }
        Update: {
          book_id?: string
          chapter_id?: string | null
          created_at?: string
          id?: string
          kind?: string
          title?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "chapter_resources_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chapter_resources_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      chapters: {
        Row: {
          book_id: string
          ch_no: string
          content_url: string | null
          created_at: string
          id: string
          page_end: number | null
          page_start: number | null
          position: number
          title: string
        }
        Insert: {
          book_id: string
          ch_no?: string
          content_url?: string | null
          created_at?: string
          id?: string
          page_end?: number | null
          page_start?: number | null
          position?: number
          title: string
        }
        Update: {
          book_id?: string
          ch_no?: string
          content_url?: string | null
          created_at?: string
          id?: string
          page_end?: number | null
          page_start?: number | null
          position?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "chapters_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      highlights: {
        Row: {
          book_id: string
          chapter_id: string | null
          color: string
          created_at: string
          id: string
          note: string
          quote: string
          user_id: string
        }
        Insert: {
          book_id: string
          chapter_id?: string | null
          color?: string
          created_at?: string
          id?: string
          note?: string
          quote?: string
          user_id: string
        }
        Update: {
          book_id?: string
          chapter_id?: string | null
          color?: string
          created_at?: string
          id?: string
          note?: string
          quote?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "highlights_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "highlights_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      library_items: {
        Row: {
          added_at: string
          book_id: string
          user_id: string
        }
        Insert: {
          added_at?: string
          book_id: string
          user_id: string
        }
        Update: {
          added_at?: string
          book_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "library_items_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      notes: {
        Row: {
          audio_url: string | null
          body: string
          book_id: string
          chapter_id: string | null
          color: string
          created_at: string
          id: string
          kind: string
          page: number | null
          user_id: string
        }
        Insert: {
          audio_url?: string | null
          body?: string
          book_id: string
          chapter_id?: string | null
          color?: string
          created_at?: string
          id?: string
          kind?: string
          page?: number | null
          user_id: string
        }
        Update: {
          audio_url?: string | null
          body?: string
          book_id?: string
          chapter_id?: string | null
          color?: string
          created_at?: string
          id?: string
          kind?: string
          page?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notes_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notes_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      pass_books: {
        Row: {
          book_id: string
          pass_id: string
        }
        Insert: {
          book_id: string
          pass_id: string
        }
        Update: {
          book_id?: string
          pass_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pass_books_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pass_books_pass_id_fkey"
            columns: ["pass_id"]
            isOneToOne: false
            referencedRelation: "passes"
            referencedColumns: ["id"]
          },
        ]
      }
      passes: {
        Row: {
          created_at: string
          description: string
          exam: string
          id: string
          is_free: boolean
          original_price: number
          poster_url: string
          price: number
          status: string
          subtitle: string
          title: string
          validity_months: number
        }
        Insert: {
          created_at?: string
          description?: string
          exam?: string
          id?: string
          is_free?: boolean
          original_price?: number
          poster_url?: string
          price?: number
          status?: string
          subtitle?: string
          title: string
          validity_months?: number
        }
        Update: {
          created_at?: string
          description?: string
          exam?: string
          id?: string
          is_free?: boolean
          original_price?: number
          poster_url?: string
          price?: number
          status?: string
          subtitle?: string
          title?: string
          validity_months?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          class_level: string | null
          coaching_institute: string | null
          created_at: string
          email: string | null
          exam_category: string | null
          full_name: string
          id: string
          is_banned: boolean
          updated_at: string
          username: string | null
        }
        Insert: {
          class_level?: string | null
          coaching_institute?: string | null
          created_at?: string
          email?: string | null
          exam_category?: string | null
          full_name?: string
          id: string
          is_banned?: boolean
          updated_at?: string
          username?: string | null
        }
        Update: {
          class_level?: string | null
          coaching_institute?: string | null
          created_at?: string
          email?: string | null
          exam_category?: string | null
          full_name?: string
          id?: string
          is_banned?: boolean
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      reading_progress: {
        Row: {
          book_id: string
          chapter_id: string | null
          id: string
          page: number
          percent: number
          updated_at: string
          user_id: string
        }
        Insert: {
          book_id: string
          chapter_id?: string | null
          id?: string
          page?: number
          percent?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          book_id?: string
          chapter_id?: string | null
          id?: string
          page?: number
          percent?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reading_progress_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reading_progress_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      user_passes: {
        Row: {
          activated_at: string
          created_at: string
          expires_at: string | null
          id: string
          pass_id: string
          status: string
          user_id: string
        }
        Insert: {
          activated_at?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          pass_id: string
          status?: string
          user_id: string
        }
        Update: {
          activated_at?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          pass_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_passes_pass_id_fkey"
            columns: ["pass_id"]
            isOneToOne: false
            referencedRelation: "passes"
            referencedColumns: ["id"]
          },
        ]
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      activate_pass: { Args: { p_pass_id: string }; Returns: undefined }
      bootstrap_profile: {
        Args: {
          p_category: string
          p_class: string
          p_coaching: string
          p_full_name: string
          p_username: string
        }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      set_user_admin: {
        Args: { p_make_admin: boolean; p_user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
