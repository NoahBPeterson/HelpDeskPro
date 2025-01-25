import { Database as GeneratedDatabase } from '../lib/database.types';

export interface Database extends GeneratedDatabase {
    functions: {
        search_tickets: {
            Args: {
                search_query: string;
                p_workspace_id: string;
                requesting_user_id: string;
            };
            Returns: Array<{
                ticket_id: string;
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
                matched_comment_id: string;
                matched_comment_content: string;
                matched_comment_type: string;
            }>;
        };
        generate_invitation_token: {
            Args: { email: string };
            Returns: string;
        };
        get_or_create_user: {
            Args: { user_id: string; email: string };
            Returns: { id: string; email: string; role: string };
        };
    };
} 