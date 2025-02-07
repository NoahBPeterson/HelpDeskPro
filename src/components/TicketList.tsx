import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Flag, Filter, User, Users } from "lucide-react";
import { Ticket } from "../types/tickets";
import { Team } from '../types/teams';
import { useTickets } from '../contexts/TicketContext';

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
  const { tickets, isLoading, agents, teams } = useTickets();
  const [showStatusFilters, setShowStatusFilters] = useState(false);
  const [showAssigneeFilters, setShowAssigneeFilters] = useState(false);
  const [showTeamFilters, setShowTeamFilters] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState<Ticket['status'][]>(['new', 'open', 'pending']);
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>(['unassigned']);
  const [selectedTeams, setSelectedTeams] = useState<string[]>(['unassigned']);

  const statusOptions: { value: Ticket['status']; label: string; emoji: string }[] = [
    { value: 'new', label: 'New', emoji: '🔵' },
    { value: 'open', label: 'Open', emoji: '🔴' },
    { value: 'pending', label: 'Pending', emoji: '🟡' },
    { value: 'solved', label: 'Solved', emoji: '🟢' },
    { value: 'closed', label: 'Closed', emoji: '⚫' },
  ];

  // Initialize filters when agents and teams are loaded
  useEffect(() => {
    if (agents?.length) {
      setSelectedAssignees(['unassigned', ...agents.map((agent: { id: string }) => agent.id)]);
    }
  }, [agents]);

  useEffect(() => {
    if (teams?.length) {
      setSelectedTeams(['unassigned', ...teams.map((team: Team) => team.id)]);
    }
  }, [teams]);

  // Filter tickets based on selected filters
  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      // Status filter
      if (!selectedStatuses.includes(ticket.status)) {
        return false;
      }

      // Assignee filter
      const hasUnassigned = selectedAssignees.includes('unassigned');
      const assigneeIds = selectedAssignees.filter(id => id !== 'unassigned');
      if (!hasUnassigned && !assigneeIds.includes(ticket.assigned_to_user_id || '')) {
        return false;
      }
      if (hasUnassigned && !assigneeIds.includes(ticket.assigned_to_user_id || '') && ticket.assigned_to_user_id) {
        return false;
      }

      // Team filter
      const hasUnassignedTeam = selectedTeams.includes('unassigned');
      const teamIds = selectedTeams.filter(id => id !== 'unassigned');
      if (!hasUnassignedTeam && !teamIds.includes(ticket.team_id || '')) {
        return false;
      }
      if (hasUnassignedTeam && !teamIds.includes(ticket.team_id || '') && ticket.team_id) {
        return false;
      }

      return true;
    });
  }, [tickets, selectedStatuses, selectedAssignees, selectedTeams]);

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

  if (isLoading && tickets.length === 0) {
    return <div className="p-4 text-center">Loading tickets...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium leading-6 text-gray-100">
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
              className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-200 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <Filter size={16} />
              <span>Status</span>
            </button>
            {showStatusFilters && (
              <div className="absolute right-0 mt-2 w-56 bg-gray-800 rounded-lg shadow-lg border border-gray-700 z-10">
                <div className="p-3 border-b border-gray-700">
                  <h4 className="text-sm font-medium text-gray-100">Status</h4>
                </div>
                <div className="p-2">
                  {statusOptions.map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center space-x-2 px-2 py-1.5 hover:bg-gray-700 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedStatuses.includes(option.value)}
                        onChange={() => handleStatusToggle(option.value)}
                        className="rounded border-gray-700 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-200">
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
              className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-200 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <User size={16} />
              <span>Assignee</span>
            </button>
            {showAssigneeFilters && (
              <div className="absolute right-0 mt-2 min-w-[14rem] max-w-[18rem] bg-gray-800 rounded-lg shadow-lg border border-gray-700 z-10">
                <div className="p-3 border-b border-gray-700">
                  <h4 className="text-sm font-medium text-gray-100">Assigned To</h4>
                </div>
                <div className="p-2">
                  <label className="flex items-center space-x-2 px-2 py-1.5 hover:bg-gray-700 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedAssignees.includes('unassigned')}
                      onChange={() => handleAssigneeToggle('unassigned')}
                      className="rounded border-gray-700 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-200">
                      👤 Unassigned
                    </span>
                  </label>
                  {agents.map((agent) => (
                    <label
                      key={agent.id}
                      className="flex items-center space-x-2 px-2 py-1.5 hover:bg-gray-700 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedAssignees.includes(agent.id)}
                        onChange={() => handleAssigneeToggle(agent.id)}
                        className="rounded border-gray-700 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-200 truncate">
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
              className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-200 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <Users size={16} />
              <span>Team</span>
            </button>
            {showTeamFilters && (
              <div className="absolute right-0 mt-2 w-56 bg-gray-800 rounded-lg shadow-lg border border-gray-700 z-10">
                <div className="p-3 border-b border-gray-700">
                  <h4 className="text-sm font-medium text-gray-100">Team</h4>
                </div>
                <div className="p-2">
                  <label className="flex items-center space-x-2 px-2 py-1.5 hover:bg-gray-700 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedTeams.includes('unassigned')}
                      onChange={() => handleTeamToggle('unassigned')}
                      className="rounded border-gray-700 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-200">
                      👥 No Team
                    </span>
                  </label>
                  {teams.map((team) => (
                    <label
                      key={team.id}
                      className="flex items-center space-x-2 px-2 py-1.5 hover:bg-gray-700 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedTeams.includes(team.id)}
                        onChange={() => handleTeamToggle(team.id)}
                        className="rounded border-gray-700 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-200">
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

      {filteredTickets.length === 0 ? (
        <div className="text-center py-12 bg-gray-800 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-100">No tickets found</h3>
          <p className="mt-2 text-sm text-gray-400">
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
        <div className="bg-gray-800 shadow rounded-lg overflow-y-auto">
          <ul className="divide-y divide-gray-700">
            {filteredTickets.map((ticket) => (
              <li key={ticket.id}>
                <Link
                  to={`/ticket/${ticket.id}`}
                  className="block hover:bg-gray-700"
                >
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getPriorityIcon(ticket.priority)}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-100 break-words text-left line-clamp-1">
                            {ticket.title}
                          </p>
                          <p className="text-xs text-gray-400 text-left">
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
                      <p className="text-sm text-gray-400 line-clamp-2 text-left">
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
