import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { Team, TeamMember } from '../types/teams';
import { User } from '../types/users';
import { PlusCircle, Trash2, UserPlus, X, ChevronDown, Tags } from 'lucide-react';

export function TeamManagement() {
    const { session } = useAuth();
    const [teams, setTeams] = useState<Team[]>([]);
    const [teamMembers, setTeamMembers] = useState<{ [key: string]: TeamMember[] }>({});
    const [availableAgents, setAvailableAgents] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [newTeamName, setNewTeamName] = useState('');
    const [newTeamDescription, setNewTeamDescription] = useState('');
    const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
    const [teamCategories, setTeamCategories] = useState<{ [key: string]: string[] }>({});
    const [showCategoryDropdown, setShowCategoryDropdown] = useState<{ [key: string]: boolean }>({});
    const [dropdownPosition, setDropdownPosition] = useState<{ [key: string]: { top: number; right: number } }>({});
    const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
    const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

    const categories = [
        { id: "technical", label: "Technical Issue" },
        { id: "billing", label: "Billing Question" },
        { id: "account", label: "Account Access" },
        { id: "feature", label: "Feature Request" },
        { id: "other", label: "Other" }
    ];

    // Fetch teams and their members
    useEffect(() => {
        async function fetchTeams() {
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
        }

        fetchTeams();
    }, [session?.user?.id]);

    // Add click outside handler
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            const target = event.target as Node;
            
            // Find which dropdown is open
            const openTeamId = Object.entries(showCategoryDropdown)
                .find(([, isOpen]) => isOpen)?.[0];
            
            if (!openTeamId) return; // No dropdowns are open

            const activeDropdown = dropdownRefs.current[openTeamId];
            const activeButton = buttonRefs.current[openTeamId];

            // If we click inside the active dropdown or its button, do nothing
            if (activeDropdown?.contains(target) || activeButton?.contains(target)) {
                return;
            }

            // Otherwise, close the dropdown
            setShowCategoryDropdown((prev: { [key: string]: boolean }) => ({
                ...prev,
                [openTeamId]: false
            }));
        }

        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [showCategoryDropdown]); // Need this dependency to know which dropdown is open

    async function handleCreateTeam(e: React.FormEvent) {
        e.preventDefault();
        if (!session?.user?.id || !newTeamName.trim()) return;

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
                    name: newTeamName.trim(),
                    description: newTeamDescription.trim(),
                    workspace_id: userData.workspace_id
                })
                .select()
                .single();

            if (error) throw error;

            setTeams([...teams, team]);
            setNewTeamName('');
            setNewTeamDescription('');
        } catch (err) {
            console.error('Error creating team:', err);
            setError('Failed to create team');
        }
    }

    async function handleDeleteTeam(teamId: string) {
        try {
            const { error } = await supabase
                .from('teams')
                .delete()
                .eq('id', teamId);

            if (error) throw error;

            setTeams(teams.filter(t => t.id !== teamId));
            delete teamMembers[teamId];
            setTeamMembers({ ...teamMembers });
        } catch (err) {
            console.error('Error deleting team:', err);
            setError('Failed to delete team');
        }
    }

    async function handleAddMember(teamId: string, userId: string) {
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
    }

    async function handleRemoveMember(teamId: string, userId: string) {
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
    }

    async function handleCategoryToggle(teamId: string, category: string) {
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
    }

    const updateDropdownPosition = (teamId: string, buttonElement: HTMLButtonElement) => {
        const rect = buttonElement.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        const shouldShowBelow = spaceBelow >= 200 || spaceBelow > spaceAbove;

        setDropdownPosition(prev => ({
            ...prev,
            [teamId]: {
                top: shouldShowBelow ? rect.bottom + window.scrollY : rect.top + window.scrollY - 256,
                right: window.innerWidth - rect.right
            }
        }));
    };

    // Update dropdown position on scroll
    useEffect(() => {
        function handleScroll() {
            Object.entries(showCategoryDropdown).forEach(([teamId, isOpen]) => {
                if (isOpen && buttonRefs.current[teamId]) {
                    updateDropdownPosition(teamId, buttonRefs.current[teamId]!);
                }
            });
        }

        window.addEventListener('scroll', handleScroll, true);
        return () => window.removeEventListener('scroll', handleScroll, true);
    }, [showCategoryDropdown]);

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div className="text-red-500">{error}</div>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Team Management</h1>

            {/* Create Team Form */}
            <form onSubmit={handleCreateTeam} className="mb-8 p-4 bg-white rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-4">Create New Team</h2>
                <div className="flex gap-4">
                    <input
                        type="text"
                        value={newTeamName}
                        onChange={(e) => setNewTeamName(e.target.value)}
                        placeholder="Team Name"
                        className="flex-1 rounded-lg border-gray-300"
                    />
                    <input
                        type="text"
                        value={newTeamDescription}
                        onChange={(e) => setNewTeamDescription(e.target.value)}
                        placeholder="Description (optional)"
                        className="flex-1 rounded-lg border-gray-300"
                    />
                    <button
                        type="submit"
                        disabled={!newTeamName.trim()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        <PlusCircle className="w-5 h-5" />
                    </button>
                </div>
            </form>

            {/* Teams List */}
            <div className="grid grid-cols-1 gap-6 overflow-y-auto">
                {teams.map((team) => (
                    <div key={team.id} className="bg-white rounded-lg shadow p-4">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h3 className="text-lg font-semibold text-left">{team.name}</h3>
                                {team.description && (
                                    <p className="text-gray-600 text-left">{team.description}</p>
                                )}
                            </div>
                            <button
                                onClick={() => handleDeleteTeam(team.id)}
                                className="text-red-600 hover:text-red-700"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Team Members */}
                        <div className="mt-4">
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="font-medium">Team Members</h4>
                                <button
                                    onClick={() => setSelectedTeam(selectedTeam === team.id ? null : team.id)}
                                    className="text-blue-600 hover:text-blue-700"
                                >
                                    <UserPlus className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Add Member Dropdown */}
                            {selectedTeam === team.id && (
                                <div className="mb-4">
                                    <select
                                        onChange={(e) => {
                                            handleAddMember(team.id, e.target.value);
                                            setSelectedTeam(null);
                                        }}
                                        className="w-full rounded-lg border-gray-300"
                                        defaultValue=""
                                    >
                                        <option value="" disabled>Select an agent to add</option>
                                        {availableAgents
                                            .filter(agent => !teamMembers[team.id]?.some(m => m.user_id === agent.id))
                                            .map(agent => (
                                                <option key={agent.id} value={agent.id}>
                                                    {agent.email} ({agent.role})
                                                </option>
                                            ))
                                        }
                                    </select>
                                </div>
                            )}

                            {/* Members List */}
                            <div className="space-y-2">
                                {teamMembers[team.id]?.map((member) => (
                                    <div key={member.user_id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                        <span>{member.user.email}</span>
                                        <button
                                            onClick={() => handleRemoveMember(team.id, member.user_id)}
                                            className="text-gray-600 hover:text-red-600"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Team Categories */}
                        <div className="mt-6 border-t pt-4">
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <h4 className="font-medium">Ticket Categories</h4>
                                    <p className="text-sm text-gray-600">
                                        {teamCategories[team.id]?.length || 0} categories selected
                                    </p>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation(); // Stop event from bubbling
                                        updateDropdownPosition(team.id, e.currentTarget);
                                        setShowCategoryDropdown((prev: { [key: string]: boolean }) => ({
                                            ...prev,
                                            [team.id]: !prev[team.id]
                                        }));
                                    }}
                                    ref={el => buttonRefs.current[team.id] = el}
                                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <Tags size={16} />
                                    <span>Manage Categories</span>
                                    <ChevronDown 
                                        size={16} 
                                        className={`transform transition-transform ${
                                            showCategoryDropdown[team.id] ? 'rotate-180' : ''
                                        }`}
                                    />
                                </button>
                            </div>

                            {/* Always show selected categories as tags */}
                            {teamCategories[team.id]?.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2 mb-4">
                                    {teamCategories[team.id].map(categoryId => {
                                        const category = categories.find(c => c.id === categoryId);
                                        return category ? (
                                            <span 
                                                key={category.id}
                                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                            >
                                                {category.label}
                                            </span>
                                        ) : null;
                                    })}
                                </div>
                            )}

                            {showCategoryDropdown[team.id] && (
                                <div 
                                    ref={el => dropdownRefs.current[team.id] = el}
                                    className="fixed z-50 w-72"
                                    style={{
                                        top: dropdownPosition[team.id]?.top ?? 0,
                                        right: dropdownPosition[team.id]?.right ?? 0
                                    }}
                                    onClick={e => e.stopPropagation()} // Stop clicks inside dropdown from bubbling
                                >
                                    <div className="bg-white rounded-lg shadow-lg border border-gray-200">
                                        <div className="p-3 border-b border-gray-200">
                                            <h4 className="text-sm font-medium text-gray-800">Select Categories</h4>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Tickets in these categories will be automatically routed to this team
                                            </p>
                                        </div>
                                        <div className="p-2 max-h-64 overflow-y-auto">
                                            {categories.map((category) => (
                                                <label
                                                    key={category.id}
                                                    className="flex items-center space-x-2 px-2 py-2 hover:bg-gray-50 rounded cursor-pointer"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={teamCategories[team.id]?.includes(category.id)}
                                                        onChange={() => handleCategoryToggle(team.id, category.id)}
                                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                    />
                                                    <span className="text-sm text-gray-700">{category.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
} 