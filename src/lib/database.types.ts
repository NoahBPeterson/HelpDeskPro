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
      invitations: {
        Row: {
          id: string
          workspace_id: string
          invited_by_user_id: string
          email: string
          role: 'admin' | 'agent' | 'end_user'
          token: string
          status: 'pending' | 'accepted' | 'expired'
          created_at: string
          expires_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          invited_by_user_id: string
          email: string
          role?: 'admin' | 'agent' | 'end_user'
          token?: string
          status?: 'pending' | 'accepted' | 'expired'
          created_at?: string
          expires_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          invited_by_user_id?: string
          email?: string
          role?: 'admin' | 'agent' | 'end_user'
          token?: string
          status?: 'pending' | 'accepted' | 'expired'
          created_at?: string
          expires_at?: string
        }
      }
      // ... existing code ...
    }
  }
}
