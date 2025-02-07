import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import type { TicketWithCreator } from '../types/tickets';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type { Team } from '../types/teams';

interface Agent {
  id: string;
  email: string;
}

interface TicketContextType {
  tickets: TicketWithCreator[];
  isLoading: boolean;
  error: string | null;
  refreshTickets: () => Promise<void>;
  agents: Agent[];
  teams: Team[];
}

const TicketContext = createContext<TicketContextType | undefined>(undefined);

export function TicketProvider({ children }: { children: React.ReactNode }) {
  const [tickets, setTickets] = useState<TicketWithCreator[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { session } = useAuth();
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  const fetchAgentsAndTeams = async (workspaceId: string) => {
    try {
      // Fetch agents
      const { data: agentsData, error: agentsError } = await supabase
        .from('users')
        .select('id, email')
        .eq('workspace_id', workspaceId)
        .neq('role', 'end_user');

      if (agentsError) throw agentsError;
      setAgents(agentsData || []);

      // Fetch teams
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select('*')
        .eq('workspace_id', workspaceId);

      if (teamsError) throw teamsError;
      setTeams(teamsData || []);
    } catch (err) {
      console.error('Error fetching agents and teams:', err);
    }
  };

  const fetchTickets = async () => {
    if (!session?.user?.id) return;

    try {
      // Get user's workspace_id
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('workspace_id')
        .eq('id', session.user.id)
        .single();

      if (userError) throw userError;
      if (!userData?.workspace_id) throw new Error('No workspace found');

      // Fetch tickets with creator info
      const { data, error: ticketsError } = await supabase
        .from('tickets')
        .select('*, creator:users!tickets_created_by_user_id_fkey(email)')
        .eq('workspace_id', userData.workspace_id)
        .order('created_at', { ascending: false });

      if (ticketsError) throw ticketsError;

      setTickets(data || []);
      setError(null);

      // Also fetch agents and teams
      await fetchAgentsAndTeams(userData.workspace_id);
    } catch (err) {
      console.error('Error fetching tickets:', err);
      setError('Failed to load tickets');
    } finally {
      setIsLoading(false);
    }
  };

  // Set up real-time subscription
  useEffect(() => {
    if (!session?.user?.id) return;

    const setupSubscription = async () => {
      // Get user's workspace_id
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('workspace_id')
        .eq('id', session.user.id)
        .single();

      if (userError) {
        console.error('Error getting workspace_id:', userError);
        return;
      }

      // Subscribe to changes
      const newChannel = supabase
        .channel('ticket-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'tickets',
            filter: `workspace_id=eq.${userData.workspace_id}`
          },
          async (payload) => {
            console.log('Received real-time update:', payload);
            // Refresh tickets when changes occur
            await fetchTickets();
          }
        )
        .subscribe();

      setChannel(newChannel);

      // Cleanup subscription
      return () => {
        newChannel.unsubscribe();
      };
    };

    setupSubscription();
  }, [session?.user?.id]);

  // Initial fetch
  useEffect(() => {
    fetchTickets();
  }, [session?.user?.id]);

  const value = {
    tickets,
    isLoading,
    error,
    refreshTickets: fetchTickets,
    agents,
    teams
  };

  return (
    <TicketContext.Provider value={value}>
      {children}
    </TicketContext.Provider>
  );
}

export function useTickets() {
  const context = useContext(TicketContext);
  if (context === undefined) {
    throw new Error('useTickets must be used within a TicketProvider');
  }
  return context;
} 