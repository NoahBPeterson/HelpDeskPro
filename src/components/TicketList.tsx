import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { Flag, Filter, User, Users } from "lucide-react";
import { Ticket, TicketWithCreator } from "../types/tickets";
import { Team } from '../types/teams';

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function getStatusColor(status: Ticket['status']) {
    switch (status) {
        case 'new':
            return 'bg-blue-100 text-blue-800';
        case 'open':
            return 'bg-yellow-100 text-yellow-800';
        case 'pending':
            return 'bg-orange-100 text-orange-800';
        case 'solved':
            return 'bg-green-100 text-green-800';
        case 'closed':
            return 'bg-gray-100 text-gray-800';
    }
}

function getPriorityIcon(priority: Ticket['priority']) {
    switch (priority) {
        case 'low':
            return <Flag className="text-blue-500" size={18} />;
        case 'medium':
            return <Flag className="text-yellow-500" size={18} />;
        case 'high':
            return <Flag className="text-red-500" size={18} />;
        default:
            return null;
    }
}

export function TicketList() {
  const [tickets, setTickets] = useState<TicketWithCreator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showStatusFilters, setShowStatusFilters] = useState(false);
  const [showAssigneeFilters, setShowAssigneeFilters] = useState(false);
  const [showTeamFilters, setShowTeamFilters] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState<Ticket['status'][]>(['new', 'open', 'pending']);
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<string[]>(['unassigned']);
  const [agents, setAgents] = useState<{ id: string; email: string }[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const { session } = useAuth();

  const statusOptions: { value: Ticket['status']; label: string; emoji: string }[] = [
    { value: 'new', label: 'New', emoji: '🔵' },
    { value: 'open', label: 'Open', emoji: '🔴' },
    { value: 'pending', label: 'Pending', emoji: '🟡' },
    { value: 'solved', label: 'Solved', emoji: '🟢' },
    { value: 'closed', label: 'Closed', emoji: '⚫' },
  ];

  // First effect to fetch agents and teams
  useEffect(() => {
    async function fetchAgentsAndTeams() {
      if (!session?.user?.id) return;

      try {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('workspace_id')
          .eq('id', session.user.id)
          .single();

        if (userError) throw userError;

        // Fetch agents
        const { data: agentsData, error: agentsError } = await supabase
          .from('users')
          .select('id, email')
          .eq('workspace_id', userData.workspace_id)
          .neq('role', 'end_user');

        if (agentsError) throw agentsError;
        setAgents(agentsData || []);
        setSelectedAssignees(['unassigned', ...(agentsData || []).map(agent => agent.id)]);

        // Fetch teams
        const { data: teamsData, error: teamsError } = await supabase
          .from('teams')
          .select('*')
          .eq('workspace_id', userData.workspace_id);

        if (teamsError) throw teamsError;
        setTeams(teamsData || []);
        setSelectedTeams(['unassigned', ...(teamsData || []).map(team => team.id)]);
      } catch (error) {
        console.error('Error fetching agents and teams:', error);
      }
    }

    fetchAgentsAndTeams();
  }, [session?.user?.id]);

  // Second effect to fetch tickets
  useEffect(() => {
    async function fetchTickets() {
      if (!session?.user?.id || selectedAssignees.length === 0 || selectedTeams.length === 0) return;

      try {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('workspace_id')
          .eq('id', session.user.id)
          .single();

        if (userError) throw userError;

        // Build the query
        let query = supabase
          .from('tickets')
          .select(`
            *,
            creator:users!tickets_created_by_user_id_fkey(email)
          `)
          .eq('workspace_id', userData.workspace_id);

        // Add status filter
        if (selectedStatuses.length > 0) {
          query = query.in('status', selectedStatuses);
        }

        // Add assignee filter
        const hasUnassigned = selectedAssignees.includes('unassigned');
        const assigneeIds = selectedAssignees.filter(id => id !== 'unassigned');
        
        if (hasUnassigned && assigneeIds.length > 0) {
          query = query.or(`assigned_to_user_id.is.null,assigned_to_user_id.in.(${assigneeIds.join(',')})`);
        } else if (hasUnassigned) {
          query = query.is('assigned_to_user_id', null);
        } else if (assigneeIds.length > 0) {
          query = query.in('assigned_to_user_id', assigneeIds);
        }

        // Add team filter
        const hasUnassignedTeam = selectedTeams.includes('unassigned');
        const teamIds = selectedTeams.filter(id => id !== 'unassigned');
        
        if (hasUnassignedTeam && teamIds.length > 0) {
          query = query.or(`team_id.is.null,team_id.in.(${teamIds.join(',')})`);
        } else if (hasUnassignedTeam) {
          query = query.is('team_id', null);
        } else if (teamIds.length > 0) {
          query = query.in('team_id', teamIds);
        }

        const { data, error } = await query;

        if (error) throw error;
        console.log('Fetched tickets:', data);
        console.log('Query filters:', { selectedStatuses, selectedAssignees, selectedTeams });

        // Sort tickets by priority (high -> medium -> low) and then by creation date
        const priorityOrder: Record<Ticket['priority'], number> = { high: 0, medium: 1, low: 2 };
        const sortedTickets = [...(data || [])].sort((a: TicketWithCreator, b: TicketWithCreator) => {
          // First sort by priority
          const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
          if (priorityDiff !== 0) return priorityDiff;
          
          // If priorities are equal, sort by creation date (oldest first)
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        });

        setTickets(sortedTickets);
      } catch (error) {
        console.error('Error fetching tickets:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTickets();
  }, [session?.user?.id, selectedStatuses, selectedAssignees, selectedTeams]);

  const handleStatusToggle = (status: Ticket['status']) => {
    setSelectedStatuses(prev => {
      if (prev.includes(status)) {
        return prev.filter(s => s !== status);
      } else {
        return [...prev, status];
      }
    });
  };

  const handleAssigneeToggle = (assigneeId: string) => {
    setSelectedAssignees(prev => {
      if (prev.includes(assigneeId)) {
        return prev.filter(id => id !== assigneeId);
      } else {
        return [...prev, assigneeId];
      }
    });
  };

  const handleTeamToggle = (teamId: string) => {
    setSelectedTeams(prev => {
      if (prev.includes(teamId)) {
        return prev.filter(id => id !== teamId);
      } else {
        return [...prev, teamId];
      }
    });
  };

  if (isLoading) {
    return <div className="p-4 text-center">Loading tickets...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          All Tickets
        </h3>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <button
              onClick={() => {
                setShowStatusFilters(!showStatusFilters);
                setShowAssigneeFilters(false);
                setShowTeamFilters(false);
              }}
              className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <Filter size={16} />
              <span>Status</span>
            </button>
            {showStatusFilters && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <div className="p-3 border-b border-gray-200">
                  <h4 className="text-sm font-medium text-gray-800">Status</h4>
                </div>
                <div className="p-2">
                  {statusOptions.map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center space-x-2 px-2 py-1.5 hover:bg-gray-50 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedStatuses.includes(option.value)}
                        onChange={() => handleStatusToggle(option.value)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">
                        {option.emoji} {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => {
                setShowAssigneeFilters(!showAssigneeFilters);
                setShowStatusFilters(false);
                setShowTeamFilters(false);
              }}
              className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <User size={16} />
              <span>Assignee</span>
            </button>
            {showAssigneeFilters && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <div className="p-3 border-b border-gray-200">
                  <h4 className="text-sm font-medium text-gray-800">Assigned To</h4>
                </div>
                <div className="p-2">
                  <label className="flex items-center space-x-2 px-2 py-1.5 hover:bg-gray-50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedAssignees.includes('unassigned')}
                      onChange={() => handleAssigneeToggle('unassigned')}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      👤 Unassigned
                    </span>
                  </label>
                  {agents.map((agent) => (
                    <label
                      key={agent.id}
                      className="flex items-center space-x-2 px-2 py-1.5 hover:bg-gray-50 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedAssignees.includes(agent.id)}
                        onChange={() => handleAssigneeToggle(agent.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">
                        👤 {agent.email}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => {
                setShowTeamFilters(!showTeamFilters);
                setShowStatusFilters(false);
                setShowAssigneeFilters(false);
              }}
              className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <Users size={16} />
              <span>Team</span>
            </button>
            {showTeamFilters && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <div className="p-3 border-b border-gray-200">
                  <h4 className="text-sm font-medium text-gray-800">Team</h4>
                </div>
                <div className="p-2">
                  <label className="flex items-center space-x-2 px-2 py-1.5 hover:bg-gray-50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedTeams.includes('unassigned')}
                      onChange={() => handleTeamToggle('unassigned')}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      👥 No Team
                    </span>
                  </label>
                  {teams.map((team) => (
                    <label
                      key={team.id}
                      className="flex items-center space-x-2 px-2 py-1.5 hover:bg-gray-50 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedTeams.includes(team.id)}
                        onChange={() => handleTeamToggle(team.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">
                        👥 {team.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {tickets.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">No tickets found</h3>
          <p className="mt-2 text-sm text-gray-500">
            {selectedStatuses.length === 0 
              ? "Please select at least one status filter to view tickets."
              : "No tickets found with the selected status filters."}
          </p>
          {selectedStatuses.length === 0 ? null : (
            <div className="mt-6">
              <Link
                to="/create"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Create New Ticket
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg">
          <ul className="divide-y divide-gray-200">
            {tickets.map((ticket) => (
              <li key={ticket.id}>
                <Link
                  to={`/ticket/${ticket.id}`}
                  className="block hover:bg-gray-50"
                >
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getPriorityIcon(ticket.priority)}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 break-words text-left line-clamp-1">
                            {ticket.title}
                          </p>
                          <p className="text-xs text-gray-500 text-left">
                            from {ticket.creator.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            ticket.status
                          )}`}
                        >
                          {ticket.status}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatDate(ticket.created_at)}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 line-clamp-2 text-left">
                        {ticket.description}
                      </p>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
