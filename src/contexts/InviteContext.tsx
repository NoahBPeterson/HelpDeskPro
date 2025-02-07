import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { Database } from '../lib/database.types';

type Invitation = Database['public']['Tables']['invitations']['Row'];

interface InviteContextType {
    invitations: Invitation[];
    userRole: string | null;
    workspaceId: string | null;
    isLoading: boolean;
    error: string | null;
    setError: (error: string) => void;
    createInvitation: (email: string, role: Invitation['role']) => Promise<void>;
    createBulkInvitations: (emails: string[], role: Invitation['role']) => Promise<string[]>;
    removeInvitation: (id: string) => Promise<void>;
}

const InviteContext = createContext<InviteContextType | undefined>(undefined);

export function InviteProvider({ children }: { children: React.ReactNode }) {
    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [workspaceId, setWorkspaceId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>("");
    const { session } = useAuth();

    // Fetch user's role and workspace ID from database
    useEffect(() => {
        async function fetchUserData() {
            if (!session?.user?.id) return;

            const { data, error } = await supabase
                .from('users')
                .select('role, workspace_id')
                .eq('id', session.user.id)
                .single();

            if (error) {
                console.error('Error fetching user data:', error);
                return;
            }

            if (data) {
                setUserRole(data.role);
                setWorkspaceId(data.workspace_id);
            }
        }

        fetchUserData();
    }, [session?.user?.id]);

    // Fetch existing invitations
    useEffect(() => {
        async function fetchInvitations() {
            if (!session?.user) return;

            const { data, error } = await supabase
                .from('invitations')
                .select('*')
                .eq('status', 'pending');

            if (error) {
                console.error('Error fetching invitations:', error);
                return;
            }

            setInvitations(data);
        }

        fetchInvitations();
    }, [session]);

    const createInvitation = async (email: string, role: Invitation['role']) => {
        if (!session?.user || !workspaceId) return;
        setIsLoading(true);
        setError("");

        try {
            // First create the invitation record
            const { data: invitation, error: inviteError } = await supabase
                .from('invitations')
                .insert({
                    email,
                    role,
                    workspace_id: workspaceId,
                    invited_by_user_id: session.user.id,
                    token: crypto.randomUUID()
                })
                .select()
                .single();

            if (inviteError) {
                console.error('Error creating invitation:', inviteError);
                setError("Failed to create invitation");
                return;
            }

            // Then send the magic link
            const { error: otpError } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    emailRedirectTo: `${window.location.origin}/accept-invite?token=${invitation.token}`
                }
            });

            if (otpError) {
                console.error('Error sending invitation:', otpError);
                // Clean up the invitation record if email fails
                await supabase.from('invitations').delete().eq('id', invitation.id);
                setError("Failed to send invitation");
                return;
            }

            setInvitations(prev => [...prev, invitation]);
        } catch (err) {
            console.error('Error:', err);
            setError("An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    const createBulkInvitations = async (emails: string[], role: Invitation['role']): Promise<string[]> => {
        if (!session?.user || !workspaceId) return [];
        setIsLoading(true);
        setError("");

        try {
            // First create all invitation records
            const { data: newInvitations, error: inviteError } = await supabase
                .from('invitations')
                .insert(
                    emails.map(email => ({
                        email,
                        role,
                        workspace_id: workspaceId,
                        invited_by_user_id: session.user.id,
                        token: crypto.randomUUID()
                    }))
                )
                .select();

            if (inviteError) {
                console.error('Error creating invitations:', inviteError);
                setError("Failed to create invitations");
                return [];
            }

            // Then send magic links
            const emailPromises = newInvitations.map(invitation =>
                supabase.auth.signInWithOtp({
                    email: invitation.email,
                    options: {
                        emailRedirectTo: `${window.location.origin}/accept-invite?token=${invitation.token}`
                    }
                })
            );

            const results = await Promise.allSettled(emailPromises);

            // Check for any failed emails
            const failedEmails = results
                .map((result, index) => result.status === 'rejected' ? newInvitations[index].email : null)
                .filter((email): email is string => email !== null);

            if (failedEmails.length > 0) {
                // Clean up invitations for failed emails
                await supabase
                    .from('invitations')
                    .delete()
                    .in('email', failedEmails);

                return failedEmails;
            }

            setInvitations(prev => [...prev, ...newInvitations]);
            return [];
        } catch (err) {
            console.error('Error:', err);
            setError("An unexpected error occurred");
            return [];
        } finally {
            setIsLoading(false);
        }
    };

    const removeInvitation = async (id: string) => {
        if (!session?.user) return;

        const { error } = await supabase
            .from('invitations')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error removing invitation:', error);
            return;
        }

        setInvitations(invitations.filter((inv) => inv.id !== id));
    };

    const value = {
        invitations,
        userRole,
        workspaceId,
        isLoading,
        error,
        setError,
        createInvitation,
        createBulkInvitations,
        removeInvitation
    };

    return (
        <InviteContext.Provider value={value}>
            {children}
        </InviteContext.Provider>
    );
}

export function useInvites() {
    const context = useContext(InviteContext);
    if (context === undefined) {
        throw new Error('useInvites must be used within an InviteProvider');
    }
    return context;
} 