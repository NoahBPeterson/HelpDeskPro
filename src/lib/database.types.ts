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
      workspaces: {
        Row: {
          id: string
          name: string
          slug: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
        }
      }
      users: {
        Row: {
          id: string
          workspace_id: string | null
          email: string
          hashed_password: string | null
          role: 'admin' | 'agent' | 'end_user'
          created_at: string
        }
        Insert: {
          id?: string
          workspace_id?: string | null
          email: string
          hashed_password?: string | null
          role?: 'admin' | 'agent' | 'end_user'
          created_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string | null
          email?: string
          hashed_password?: string | null
          role?: 'admin' | 'agent' | 'end_user'
          created_at?: string
        }
      }
      tickets: {
        Row: {
          id: string
          workspace_id: string
          created_by_user_id: string
          assigned_to_user_id: string | null
          title: string
          description: string | null
          status: 'new' | 'open' | 'pending' | 'solved' | 'closed'
          priority: 'low' | 'medium' | 'high'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          created_by_user_id: string
          assigned_to_user_id?: string | null
          title: string
          description?: string | null
          status?: 'new' | 'open' | 'pending' | 'solved' | 'closed'
          priority?: 'low' | 'medium' | 'high'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          created_by_user_id?: string
          assigned_to_user_id?: string | null
          title?: string
          description?: string | null
          status?: 'new' | 'open' | 'pending' | 'solved' | 'closed'
          priority?: 'low' | 'medium' | 'high'
          created_at?: string
          updated_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          ticket_id: string
          author_id: string
          content: string
          type: 'reply' | 'note' | 'status_change' | 'assignment' | 'system'
          created_at: string
        }
        Insert: {
          id?: string
          ticket_id: string
          author_id: string
          content: string
          type?: 'reply' | 'note' | 'status_change' | 'assignment' | 'system'
          created_at?: string
        }
        Update: {
          id?: string
          ticket_id?: string
          author_id?: string
          content?: string
          type?: 'reply' | 'note' | 'status_change' | 'assignment' | 'system'
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