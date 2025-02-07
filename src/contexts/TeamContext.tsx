import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { Team, TeamMember } from '../types/teams';
import { User } from '../types/users';

interface TeamContextType {
    teams: Team[];
    teamMembers: { [key: string]: TeamMember[] };
    availableAgents: User[];
    teamCategories: { [key: string]: string[] };
    isLoading: boolean;
    error: string | null;
    refreshTeams: () => Promise<void>;
    createTeam: (name: string, description: string) => Promise<void>;
    deleteTeam: (teamId: string) => Promise<void>;
    addTeamMember: (teamId: string, userId: string) => Promise<void>;
    removeTeamMember: (teamId: string, userId: string) => Promise<void>;
    toggleTeamCategory: (teamId: string, category: string) => Promise<void>;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export function TeamProvider({ children }: { children: React.ReactNode }) {
    const [teams, setTeams] = useState<Team[]>([]);
    const [teamMembers, setTeamMembers] = useState<{ [key: string]: TeamMember[] }>({});
    const [availableAgents, setAvailableAgents] = useState<User[]>([]);
    const [teamCategories, setTeamCategories] = useState<{ [key: string]: string[] }>({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { session } = useAuth();

    const fetchTeams = async () => {
        if (!session?.user?.id) return;

        try {
            const { data: teamsData, error: teamsError } = await supabase
                .from('teams')
                .select('*');

            if (teamsError) throw teamsError;
            setTeams(teamsData);

            // Fetch members for each team
            const membersPromises = teamsData.map(async (team) => {
                const { data: membersData, error: membersError } = await supabase
                    .from('team_members')
                    .select('*, user:users(email, role)')
                    .eq('team_id', team.id);

                if (membersError) throw membersError;
                return { teamId: team.id, members: membersData };
            });

            const membersResults = await Promise.all(membersPromises);
            const membersMap = membersResults.reduce((acc, { teamId, members }) => {
                acc[teamId] = members;
                return acc;
            }, {} as { [key: string]: TeamMember[] });

            setTeamMembers(membersMap);

            // Fetch team categories
            const { data: categoriesData, error: categoriesError } = await supabase
                .from('team_categories')
                .select('*');

            if (categoriesError) throw categoriesError;
            
            const categoriesMap = categoriesData.reduce((acc, { team_id, category }) => {
                acc[team_id] = acc[team_id] || [];
                acc[team_id].push(category);
                return acc;
            }, {} as { [key: string]: string[] });

            setTeamCategories(categoriesMap);

            // Fetch available agents
            const { data: agentsData, error: agentsError } = await supabase
                .from('users')
                .select('*')
                .in('role', ['admin', 'agent']);

            if (agentsError) throw agentsError;
            setAvailableAgents(agentsData as User[]);

        } catch (err) {
            console.error('Error fetching teams:', err);
            setError('Failed to load teams');
        } finally {
            setIsLoading(false);
        }
    };

    const createTeam = async (name: string, description: string) => {
        if (!session?.user?.id || !name.trim()) return;

        try {
            const { data: userData } = await supabase
                .from('users')
                .select('workspace_id')
                .eq('id', session.user.id)
                .single();

            if (!userData?.workspace_id) throw new Error('No workspace found');

            const { data: team, error } = await supabase
                .from('teams')
                .insert({
                    name: name.trim(),
                    description: description.trim(),
                    workspace_id: userData.workspace_id
                })
                .select()
                .single();

            if (error) throw error;

            setTeams([...teams, team]);
        } catch (err) {
            console.error('Error creating team:', err);
            setError('Failed to create team');
        }
    };

    const deleteTeam = async (teamId: string) => {
        try {
            const { error } = await supabase
                .from('teams')
                .delete()
                .eq('id', teamId);

            if (error) throw error;

            setTeams(teams.filter(t => t.id !== teamId));
            const newTeamMembers = { ...teamMembers };
            delete newTeamMembers[teamId];
            setTeamMembers(newTeamMembers);
        } catch (err) {
            console.error('Error deleting team:', err);
            setError('Failed to delete team');
        }
    };

    const addTeamMember = async (teamId: string, userId: string) => {
        try {
            const { data: member, error } = await supabase
                .from('team_members')
                .insert({
                    team_id: teamId,
                    user_id: userId,
                    role: 'member'
                })
                .select('*, user:users(email, role)')
                .single();

            if (error) throw error;

            setTeamMembers({
                ...teamMembers,
                [teamId]: [...(teamMembers[teamId] || []), member]
            });
        } catch (err) {
            console.error('Error adding team member:', err);
            setError('Failed to add team member');
        }
    };

    const removeTeamMember = async (teamId: string, userId: string) => {
        try {
            const { error } = await supabase
                .from('team_members')
                .delete()
                .eq('team_id', teamId)
                .eq('user_id', userId);

            if (error) throw error;

            setTeamMembers({
                ...teamMembers,
                [teamId]: teamMembers[teamId].filter(m => m.user_id !== userId)
            });
        } catch (err) {
            console.error('Error removing team member:', err);
            setError('Failed to remove team member');
        }
    };

    const toggleTeamCategory = async (teamId: string, category: string) => {
        try {
            const isAssigned = teamCategories[teamId]?.includes(category);

            if (isAssigned) {
                // Remove category
                const { error } = await supabase
                    .from('team_categories')
                    .delete()
                    .eq('team_id', teamId)
                    .eq('category', category);

                if (error) throw error;

                setTeamCategories(prev => ({
                    ...prev,
                    [teamId]: prev[teamId].filter(c => c !== category)
                }));
            } else {
                // Add category
                const { error } = await supabase
                    .from('team_categories')
                    .insert({ team_id: teamId, category });

                if (error) throw error;

                setTeamCategories(prev => ({
                    ...prev,
                    [teamId]: [...(prev[teamId] || []), category]
                }));
            }
        } catch (err) {
            console.error('Error updating team categories:', err);
            setError('Failed to update team categories');
        }
    };

    // Set up real-time subscription
    useEffect(() => {
        if (!session?.user?.id) return;

        const channel = supabase
            .channel('team-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'teams'
                },
                () => {
                    fetchTeams();
                }
            )
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'team_members'
                },
                () => {
                    fetchTeams();
                }
            )
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'team_categories'
                },
                () => {
                    fetchTeams();
                }
            )
            .subscribe();

        return () => {
            channel.unsubscribe();
        };
    }, [session?.user?.id]);

    // Initial fetch
    useEffect(() => {
        fetchTeams();
    }, [session?.user?.id]);

    const value = {
        teams,
        teamMembers,
        availableAgents,
        teamCategories,
        isLoading,
        error,
        refreshTeams: fetchTeams,
        createTeam,
        deleteTeam,
        addTeamMember,
        removeTeamMember,
        toggleTeamCategory
    };

    return (
        <TeamContext.Provider value={value}>
            {children}
        </TeamContext.Provider>
    );
}

export function useTeams() {
    const context = useContext(TeamContext);
    if (context === undefined) {
        throw new Error('useTeams must be used within a TeamProvider');
    }
    return context;
} 