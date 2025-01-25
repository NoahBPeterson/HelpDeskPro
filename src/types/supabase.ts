export interface Database {
    public: {
        Tables: {
            tickets: {
                Row: {
                    id: string;
                    title: string;
                    description: string;
                    status: string;
                    priority: string;
                    created_at: string;
                    updated_at: string;
                    created_by_user_id: string;
                    assigned_to_user_id: string | null;
                    team_id: string | null;
                    workspace_id: string;
                };
                Insert: {
                    title: string;
                    description: string;
                    status?: string;
                    priority?: string;
                    created_by_user_id: string;
                    assigned_to_user_id?: string;
                    team_id?: string;
                    workspace_id: string;
                };
                Update: {
                    title?: string;
                    description?: string;
                    status?: string;
                    priority?: string;
                    assigned_to_user_id?: string;
                    team_id?: string;
                };
            };
            comments: {
                Row: {
                    id: string;
                    content: string;
                    created_at: string;
                    ticket_id: string;
                    author_id: string;
                    type: string;
                };
                Insert: {
                    content: string;
                    ticket_id: string;
                    author_id: string;
                    type?: string;
                };
                Update: {
                    content?: string;
                    type?: string;
                };
            };
            users: {
                Row: {
                    id: string;
                    email: string;
                    role: string;
                    workspace_id: string;
                };
                Insert: {
                    id: string;
                    email: string;
                    role?: string;
                    workspace_id: string;
                };
                Update: {
                    email?: string;
                    role?: string;
                    workspace_id?: string;
                };
            };
            teams: {
                Row: {
                    id: string;
                    name: string;
                    workspace_id: string;
                };
                Insert: {
                    name: string;
                    workspace_id: string;
                };
                Update: {
                    name?: string;
                };
            };
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            [_ in never]: never;
        };
        Enums: {
            [_ in never]: never;
        };
    };
} 