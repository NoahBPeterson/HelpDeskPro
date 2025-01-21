import { Database } from '../lib/database.types';

// Base types from database
type Tables = Database['public']['Tables'];
type TicketRow = Tables['tickets']['Row'];
type CommentRow = Tables['comments']['Row'];
type UserRow = Tables['users']['Row'];

// Frontend types
export type Ticket = TicketRow;

export type Comment = Omit<CommentRow, 'author_id'> & {
    created_by_user_id: string;
    user: {
        email: string;
    };
};

export type Stats = {
    total: number;
    new: number;
    open: number;
    pending: number;
    solved: number;
    closed: number;
    highPriority: number;
    mediumPriority: number;
    lowPriority: number;
};

export type Activity = {
    id: string;
    type: 'ticket_created' | 'status_changed' | 'comment_added';
    ticketId: string;
    ticketTitle: string;
    timestamp: string;
    user: string;
}; 

export type User = UserRow;