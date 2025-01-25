export interface SearchResult {
    ticket_id: string;  // Match the SQL function return type
    title: string;
    description: string;
    status: string;
    priority: string;
    created_at: string;
    updated_at: string;
    created_by_user_id: string;
    assigned_to_user_id: string;
    team_id: string;
    workspace_id: string;
    rank: number;
    matched_comment_id: string | null;
    matched_comment_content: string | null;
    matched_comment_type: string | null;
} 