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
    id: number;
    type: 'status' | 'priority';
    value: string;
    message: string;
    time: string;
};

export type User = UserRow;