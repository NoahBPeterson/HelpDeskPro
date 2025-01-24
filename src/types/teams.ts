import { Database } from '../lib/database.types';

// Base types from database
type Tables = Database['public']['Tables'];
type TeamRow = Tables['teams']['Row'];
type TeamMemberRow = Tables['team_members']['Row'];

// Frontend types
export type Team = TeamRow & {
    member_count?: number;
};

export type TeamMember = TeamMemberRow & {
    user: {
        email: string;
        role: string;
    };
}; 