import { Database } from '../lib/database.types';

// Base types from database
type Tables = Database['public']['Tables'];
type UserRow = Tables['users']['Row'];

// Frontend types
export type User = UserRow & {
    email: string;
    role: 'admin' | 'agent' | 'end_user';
}; 

// UserRole
export type UserRole = 'admin' | 'agent' | 'end_user';