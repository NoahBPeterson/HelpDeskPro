import { Database } from '../lib/database.types';

// Base types from database
type Tables = Database['public']['Tables'];
type TicketRow = Tables['tickets']['Row'];
type CommentRow = Tables['comments']['Row'];
type UserRow = Tables['users']['Row'];

// Frontend types
export type Ticket = TicketRow;

export type TicketWithCreator = Ticket & {
    creator: {
        email: string;
    };
};


export type Comment = CommentRow & {
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