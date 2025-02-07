import { useState, useRef, useEffect } from 'react';
import { useTeams } from '../contexts/TeamContext';
import { PlusCircle, Trash2, UserPlus, X, ChevronDown, Tags } from 'lucide-react';

export function TeamManagement() {
    const {
        teams,
        teamMembers,
        availableAgents,
        teamCategories,
        isLoading,
        error,
        createTeam,
        deleteTeam,
        addTeamMember,
        removeTeamMember,
        toggleTeamCategory
    } = useTeams();
    const [newTeamName, setNewTeamName] = useState('');
    const [newTeamDescription, setNewTeamDescription] = useState('');
    const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
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

    const handleCreateTeam = async (e: React.FormEvent) => {
        e.preventDefault();
        await createTeam(newTeamName, newTeamDescription);
        setNewTeamName('');
        setNewTeamDescription('');
    };

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div className="text-red-500">{error}</div>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6 text-white">Team Management</h1>

            {/* Create Team Form */}
            <form onSubmit={handleCreateTeam} className="mb-8 p-4 bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-4 text-white">Create New Team</h2>
                <div className="flex gap-4">
                    <input
                        type="text"
                        value={newTeamName}
                        onChange={(e) => setNewTeamName(e.target.value)}
                        placeholder="Team Name"
                        className="flex-1 rounded-lg border border-gray-600 bg-gray-800 text-gray-100"
                    />
                    <input
                        type="text"
                        value={newTeamDescription}
                        onChange={(e) => setNewTeamDescription(e.target.value)}
                        placeholder="Description (optional)"
                        className="flex-1 rounded-lg border border-gray-600 bg-gray-800 text-gray-100"
                    />
                    <button
                        type="submit"
                        disabled={!newTeamName.trim()}
                        className="px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-500 text-white rounded-lg hover:from-gray-500 hover:to-gray-400 disabled:opacity-50"
                    >
                        <PlusCircle className="w-5 h-5" />
                    </button>
                </div>
            </form>

            {/* Teams List */}
            <div className="grid grid-cols-1 gap-6 overflow-y-auto">
                {teams.map((team) => (
                    <div key={team.id} className="bg-gray-800 rounded-lg shadow p-4">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h3 className="text-lg font-semibold text-white">{team.name}</h3>
                                {team.description && (
                                    <p className="text-gray-400 text-left">{team.description}</p>
                                )}
                            </div>
                            <button
                                onClick={() => deleteTeam(team.id)}
                                className="text-red-500 hover:text-red-600"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Team Members */}
                        <div className="mt-4">
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="font-medium text-white">Team Members</h4>
                                <button
                                    onClick={() => setSelectedTeam(selectedTeam === team.id ? null : team.id)}
                                    className="text-gray-300 hover:text-gray-200"
                                >
                                    <UserPlus className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Add Member Dropdown */}
                            {selectedTeam === team.id && (
                                <div className="mb-4">
                                    <select
                                        onChange={(e) => {
                                            addTeamMember(team.id, e.target.value);
                                            setSelectedTeam(null);
                                        }}
                                        className="w-full rounded-lg border border-gray-600 bg-gray-800 text-white"
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
                                    <div key={member.user_id} className="flex justify-between items-center p-2 bg-gray-700 rounded">
                                        <span className="text-gray-100">{member.user.email}</span>
                                        <button
                                            onClick={() => removeTeamMember(team.id, member.user_id)}
                                            className="text-gray-300 hover:text-red-500"
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
                                    <h4 className="font-medium text-white">Ticket Categories</h4>
                                    <p className="text-sm text-gray-400">
                                        {teamCategories[team.id]?.length || 0} categories selected
                                    </p>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        updateDropdownPosition(team.id, e.currentTarget);
                                        setShowCategoryDropdown((prev: { [key: string]: boolean }) => ({
                                            ...prev,
                                            [team.id]: !prev[team.id]
                                        }));
                                    }}
                                    ref={el => buttonRefs.current[team.id] = el}
                                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-200 bg-gray-800 border border-gray-600 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
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

                            {teamCategories[team.id]?.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2 mb-4">
                                    {teamCategories[team.id].map(categoryId => {
                                        const category = categories.find(c => c.id === categoryId);
                                        return category ? (
                                            <span 
                                                key={category.id}
                                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-br from-gray-700 to-gray-600 text-gray-200"
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
                                    <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700">
                                        <div className="p-3 border-b border-gray-700">
                                            <h4 className="text-sm font-medium text-white">Select Categories</h4>
                                            <p className="text-xs text-gray-400 mt-1">
                                                Tickets in these categories will be automatically routed to this team
                                            </p>
                                        </div>
                                        <div className="p-2 max-h-64 overflow-y-auto">
                                            {categories.map((category) => (
                                                <label
                                                    key={category.id}
                                                    className="flex items-center space-x-2 px-2 py-2 hover:bg-gray-700 rounded cursor-pointer"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={teamCategories[team.id]?.includes(category.id)}
                                                        onChange={() => toggleTeamCategory(team.id, category.id)}
                                                        className="rounded border-gray-600 text-purple-500 focus:ring-purple-500"
                                                    />
                                                    <span className="text-sm text-gray-300">{category.label}</span>
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