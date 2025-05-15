export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      branches: {
        Row: {
          id: number
          name: string
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          created_at?: string
        }
      }
      years: {
        Row: {
          id: number
          year_number: number
          branch_id: number
          created_at: string
        }
        Insert: {
          id?: number
          year_number: number
          branch_id: number
          created_at?: string
        }
        Update: {
          id?: number
          year_number?: number
          branch_id?: number
          created_at?: string
        }
      }
      semesters: {
        Row: {
          id: number
          semester_number: number
          year_id: number
          created_at: string
        }
        Insert: {
          id?: number
          semester_number: number 
          year_id: number
          created_at?: string
        }
        Update: {
          id?: number
          semester_number?: number
          year_id?: number
          created_at?: string
        }
      }
      subjects: {
        Row: {
          id: number
          name: string
          code: string
          credits: number
          semester_id: number
          year_id: number
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          code: string
          credits: number
          semester_id: number
          year_id: number
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          code?: string
          credits?: number
          semester_id?: number
          year_id?: number
          created_at?: string
        }
      }
      materials: {
        Row: {
          id: number
          subject_id: number
          title: string
          description: string
          file_path: string
          type: string
          created_at: string
        }
        Insert: {
          id?: number
          subject_id: number
          title: string
          description: string
          file_path: string
          type: string
          created_at?: string
        }
        Update: {
          id?: number
          subject_id?: number
          title?: string
          description?: string
          file_path?: string
          type?: string
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          first_name: string | null
          last_name: string | null
          avatar_url: string | null
          branch_id: number | null
          year_id: number | null
          semester_id: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          branch_id?: number | null
          year_id?: number | null
          semester_id?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          branch_id?: number | null
          year_id?: number | null
          semester_id?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      user_progress: {
        Row: {
          id: number
          user_id: string
          material_id: number
          progress_percentage: number
          last_accessed: string
        }
        Insert: {
          id?: number
          user_id: string
          material_id: number
          progress_percentage: number
          last_accessed?: string
        }
        Update: {
          id?: number
          user_id?: string
          material_id?: number
          progress_percentage?: number
          last_accessed?: string
        }
      }
      user_materials: {
        Row: {
          id: number
          user_id: string
          material_id: number
          is_favorite: boolean
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          material_id: number
          is_favorite?: boolean
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          material_id?: number
          is_favorite?: boolean
          created_at?: string
        }
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
  }
}