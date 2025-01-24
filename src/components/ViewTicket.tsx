import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Clock,
    AlertCircle,
    CheckCircle,
    ArrowLeft,
    User,
    Flag,
    MoreVertical,
    Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { Ticket, Comment } from "../types/tickets";
import { Team } from "../types/teams";

function formatDate(date: string) {
    return new Date(date).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

interface Agent {
    id: string;
    email: string;
    role: string;
}

export function ViewTicket() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { session } = useAuth();
    const [ticket, setTicket] = useState<Ticket & { creator?: { email: string } } | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [newComment, setNewComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [agents, setAgents] = useState<Agent[]>([]);
    const [isInternalNote, setIsInternalNote] = useState(false);
    const [teams, setTeams] = useState<Team[]>([]);

    useEffect(() => {
        async function fetchTicket() {
            if (!session?.user?.id || !id) return;

            try {
                // Get user's workspace_id
                const { data: userData, error: userError } = await supabase
                    .from('users')
                    .select('workspace_id')
                    .eq('id', session.user.id)
                    .single();

                if (userError) throw userError;

                // Fetch ticket
                const { data: ticketData, error: ticketError } = await supabase
                    .from('tickets')
                    .select('*, creator:created_by_user_id(email)')
                    .eq('id', id)
                    .eq('workspace_id', userData.workspace_id)
                    .single();

                if (ticketError) throw ticketError;
                setTicket(ticketData);

                // Fetch agents from the same workspace
                const { data: agentsData, error: agentsError } = await supabase
                    .from('users')
                    .select('id, email, role')
                    .eq('workspace_id', userData.workspace_id)
                    .neq('role', 'end_user');

                if (agentsError) throw agentsError;
                setAgents(agentsData);

                // Fetch teams from the same workspace
                const { data: teamsData, error: teamsError } = await supabase
                    .from('teams')
                    .select('*')
                    .eq('workspace_id', userData.workspace_id);

                if (teamsError) throw teamsError;
                setTeams(teamsData);

                // Fetch comments
                const { data: commentsData, error: commentsError } = await supabase
                    .from('comments')
                    .select('*, user:users(email)')
                    .eq('ticket_id', id)
                    .order('created_at', { ascending: true });

                if (commentsError) throw commentsError;
                setComments(commentsData);
            } catch (err) {
                console.error('Error fetching ticket:', err);
                setError('Failed to load ticket details');
            } finally {
                setIsLoading(false);
            }
        }

        fetchTicket();
    }, [id, session?.user?.id]);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'new':
            case 'open':
                return <AlertCircle className="text-blue-500" size={18} />;
            case 'pending':
                return <Clock className="text-yellow-500" size={18} />;
            case 'solved':
            case 'closed':
                return <CheckCircle className="text-green-500" size={18} />;
            default:
                return null;
        }
    };

    async function handleSubmitComment(e: React.FormEvent) {
        e.preventDefault();
        if (!session?.user?.id || !ticket || !newComment.trim()) return;

        setIsSubmitting(true);
        try {
            const { error } = await supabase
                .from('comments')
                .insert({
                    ticket_id: ticket.id,
                    content: newComment.trim(),
                    author_id: session.user.id,
                    type: isInternalNote ? 'note' : 'reply'
                });

            if (error) throw error;

            // Fetch updated comments
            const { data: commentsData, error: commentsError } = await supabase
                .from('comments')
                .select('*, user:users(email)')
                .eq('ticket_id', ticket.id)
                .order('created_at', { ascending: true });

            if (commentsError) throw commentsError;
            setComments(commentsData);
            setNewComment("");
        } catch (err) {
            console.error('Error adding comment:', err);
            alert('Failed to add comment');
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleStatusChange(newStatus: Ticket['status']) {
        if (!session?.user?.id || !ticket) return;

        try {
            const { error } = await supabase
                .from('tickets')
                .update({ status: newStatus })
                .eq('id', ticket.id);

            if (error) throw error;

            // Add a system comment about the status change
            await supabase
                .from('comments')
                .insert({
                    ticket_id: ticket.id,
                    author_id: session.user.id,
                    content: `Status changed to ${newStatus}`,
                    type: 'status_change'
                });

            // Fetch updated comments
            const { data: commentsData, error: commentsError } = await supabase
                .from('comments')
                .select('*, user:users(email)')
                .eq('ticket_id', ticket.id)
                .order('created_at', { ascending: true });

            if (commentsError) throw commentsError;
            setComments(commentsData);
            setTicket(prev => prev ? { ...prev, status: newStatus } : null);
        } catch (err) {
            console.error('Error updating ticket status:', err);
            alert('Failed to update ticket status');
        }
    }

    async function handlePriorityChange(newPriority: Ticket['priority']) {
        if (!session?.user?.id || !ticket) return;

        try {
            const { error } = await supabase
                .from('tickets')
                .update({ priority: newPriority })
                .eq('id', ticket.id);

            if (error) throw error;

            await supabase
                .from('comments')
                .insert({
                    ticket_id: ticket.id,
                    author_id: session.user.id,
                    content: `Priority changed to ${newPriority}`,
                    type: 'system'
                });

            // Fetch updated comments
            const { data: commentsData, error: commentsError } = await supabase
                .from('comments')
                .select('*, user:users(email)')
                .eq('ticket_id', ticket.id)
                .order('created_at', { ascending: true });

            if (commentsError) throw commentsError;
            setComments(commentsData);
            setTicket(prev => prev ? { ...prev, priority: newPriority } : null);
        } catch (err) {
            console.error('Error updating ticket priority:', err);
            alert('Failed to update ticket priority');
        }
    }

    async function handleAssigneeChange(agentId: string) {
        if (!session?.user?.id || !ticket) return;

        try {
            const { error } = await supabase
                .from('tickets')
                .update({ assigned_to_user_id: agentId || null })
                .eq('id', ticket.id);

            if (error) throw error;

            await supabase
                .from('comments')
                .insert({
                    ticket_id: ticket.id,
                    author_id: session.user.id,
                    content: agentId ? `Ticket assigned to ${agents.find(a => a.id === agentId)?.email}` : 'Ticket unassigned',
                    type: 'system'
                });

            // Fetch updated comments
            const { data: commentsData, error: commentsError } = await supabase
                .from('comments')
                .select('*, user:users(email)')
                .eq('ticket_id', ticket.id)
                .order('created_at', { ascending: true });

            if (commentsError) throw commentsError;
            setComments(commentsData);
            setTicket(prev => prev ? { ...prev, assigned_to_user_id: agentId || null } : null);
        } catch (err) {
            console.error('Error updating ticket assignee:', err);
            alert('Failed to update ticket assignee');
        }
    }

    async function handleTeamChange(teamId: string) {
        if (!session?.user?.id || !ticket) return;

        try {
            const { error } = await supabase
                .from('tickets')
                .update({ team_id: teamId || null })
                .eq('id', ticket.id);

            if (error) throw error;

            // Add a system comment about the team assignment
            await supabase
                .from('comments')
                .insert({
                    ticket_id: ticket.id,
                    author_id: session.user.id,
                    content: teamId 
                        ? `Ticket assigned to team: ${teams.find(t => t.id === teamId)?.name}`
                        : 'Ticket removed from team',
                    type: 'system'
                });

            // Fetch updated comments
            const { data: commentsData, error: commentsError } = await supabase
                .from('comments')
                .select('*, user:users(email)')
                .eq('ticket_id', ticket.id)
                .order('created_at', { ascending: true });

            if (commentsError) throw commentsError;
            setComments(commentsData);
            setTicket(prev => prev ? { ...prev, team_id: teamId || null } : null);
        } catch (err) {
            console.error('Error updating ticket team:', err);
            alert('Failed to update ticket team');
        }
    }

    if (isLoading) {
        return <div className="p-4 text-center">Loading ticket details...</div>;
    }

    if (error || !ticket) {
        return (
            <div className="p-4 text-center text-red-600">
                {error || 'Ticket not found'}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <button
                onClick={() => navigate("/")}
                className="flex items-center text-gray-600 hover:text-gray-800"
            >
                <ArrowLeft size={20} className="mr-1" />
                Back to tickets
            </button>
            <div className="flex gap-6">
                <div className="flex-1">
                    <div className="bg-white rounded-lg shadow">
                        <div className="p-4 border-b border-gray-200">
                            <div className="flex justify-between">
                                <h2 className="text-lg font-semibold text-gray-800">
                                    {ticket.title}
                                </h2>
                                <div className="flex space-x-2">
                                    {getStatusIcon(ticket.status)}
                                    <span className="text-sm font-medium capitalize">
                                        {ticket.status}
                                    </span>
                                </div>
                            </div>
                            <div className="mt-2 text-sm text-gray-500">
                                Requested by {ticket.creator?.email} on {formatDate(ticket.created_at)}
                            </div>
                        </div>
                        <div className="p-4 space-y-4">
                            <div>
                                <h3 className="text-sm font-medium text-gray-700">Description</h3>
                                <p className="mt-1 text-sm text-gray-600">{ticket.description}</p>
                            </div>
                            <div className="border-t pt-4">
                                <h3 className="text-sm font-medium text-gray-700 mb-4">Updates</h3>
                                {comments.length === 0 ? (
                                    <p className="text-sm text-gray-500">No updates yet</p>
                                ) : (
                                    comments.map((comment) => (
                                        <div 
                                            key={comment.id} 
                                            className={`rounded-lg p-3 mb-3 ${
                                                comment.type === 'note' 
                                                    ? 'bg-yellow-50 border border-yellow-200' 
                                                    : 'bg-gray-50'
                                            }`}
                                        >
                                            <div className="flex justify-between text-sm">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">{comment.user.email}</span>
                                                    {comment.type === 'note' && (
                                                        <span className="text-yellow-600 text-xs bg-yellow-100 px-2 py-0.5 rounded-full">
                                                            Internal Note
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-gray-500">
                                                    {formatDate(comment.created_at)}
                                                </span>
                                            </div>
                                            <p className="mt-1 text-sm text-gray-600 text-left">{comment.content}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                            <form onSubmit={handleSubmitComment} className="mt-4">
                                <div className="mb-2">
                                    <label className="flex items-center gap-2 text-sm text-gray-600">
                                        <input
                                            type="checkbox"
                                            checked={isInternalNote}
                                            onChange={(e) => setIsInternalNote(e.target.checked)}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        Make this an internal note (only visible to agents)
                                    </label>
                                </div>
                                <div className="flex gap-2">
                                    <textarea
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder={isInternalNote ? "Add an internal note..." : "Add a comment..."}
                                        className="flex-1 min-h-[100px] rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || !newComment.trim()}
                                        className={`px-4 py-2 text-sm font-medium rounded-lg ${
                                            isInternalNote
                                                ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                    >
                                        {isSubmitting ? 'Sending...' : isInternalNote ? 'Add Note' : 'Send'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
                <div className="w-80 flex-shrink-0">
                    <div className="bg-white rounded-lg shadow">
                        <div className="p-4 border-b border-gray-200">
                            <h3 className="text-sm font-medium text-gray-800">
                                Ticket Details
                            </h3>
                        </div>
                        <div className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Status
                                </label>
                                <div className="relative">
                                    <select
                                        value={ticket.status}
                                        onChange={(e) => handleStatusChange(e.target.value as Ticket['status'])}
                                        className="appearance-none w-full bg-white border border-gray-300 rounded-lg py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="new">🔵 New</option>
                                        <option value="open">🔴 Open</option>
                                        <option value="pending">🟡 Pending</option>
                                        <option value="solved">🟢 Solved</option>
                                        <option value="closed">⚫ Closed</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                        <MoreVertical size={16} className="text-gray-400" />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Priority
                                </label>
                                <div className="relative">
                                    <select
                                        value={ticket.priority}
                                        onChange={(e) => handlePriorityChange(e.target.value as Ticket['priority'])}
                                        className="appearance-none w-full bg-white border border-gray-300 rounded-lg py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="low">🟢 Low Priority</option>
                                        <option value="medium">🟡 Medium Priority</option>
                                        <option value="high">🔴 High Priority</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                        <Flag size={16} className="text-gray-400" />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Assigned To
                                </label>
                                <div className="relative">
                                    <select
                                        value={ticket.assigned_to_user_id || ""}
                                        onChange={(e) => handleAssigneeChange(e.target.value)}
                                        className="appearance-none w-full bg-white border border-gray-300 rounded-lg py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">👤 Unassigned</option>
                                        {agents.map((agent) => (
                                            <option key={agent.id} value={agent.id}>
                                                👤 {agent.email} ({agent.role})
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                        <User size={16} className="text-gray-400" />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Team
                                </label>
                                <div className="relative">
                                    <select
                                        value={ticket.team_id || ""}
                                        onChange={(e) => handleTeamChange(e.target.value)}
                                        className="appearance-none w-full bg-white border border-gray-300 rounded-lg py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">👥 No Team</option>
                                        {teams.map((team) => (
                                            <option key={team.id} value={team.id}>
                                                👥 {team.name}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                        <Users size={16} className="text-gray-400" />
                                    </div>
                                </div>
                            </div>
                            <div className="border-t pt-4 mt-4">
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-xs font-medium text-gray-500">
                                            Created
                                        </label>
                                        <p className="text-sm text-gray-900">{formatDate(ticket.created_at)}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-500">
                                            Ticket ID
                                        </label>
                                        <p className="text-sm text-gray-900">#{ticket.id}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
