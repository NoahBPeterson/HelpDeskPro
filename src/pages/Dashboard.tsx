import { useEffect, useState } from "react";
import {
    CheckCircle,
    Clock,
    FolderOpen,
    Inbox,
    TrendingUp,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { Stats, Activity } from "../types/tickets";

function formatRelativeTime(date: string) {
    const now = new Date();
    const then = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);

    if (diffInSeconds < 60) {
        return 'just now';
    } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    } else {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} day${days === 1 ? '' : 's'} ago`;
    }
}

export function Dashboard() {
    const { session } = useAuth();
    const [stats, setStats] = useState<Stats>({
        total: 0,
        new: 0,
        open: 0,
        pending: 0,
        solved: 0,
        closed: 0,
        highPriority: 0,
        mediumPriority: 0,
        lowPriority: 0
    });
    const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchDashboardData() {
            if (!session?.user?.id) return;

            try {
                // Get user's workspace_id
                const { data: userData, error: userError } = await supabase
                    .from('users')
                    .select('workspace_id')
                    .eq('id', session.user.id)
                    .single();

                if (userError) throw userError;

                // Fetch tickets for the workspace
                const { data: tickets, error: ticketsError } = await supabase
                    .from('tickets')
                    .select('*')
                    .eq('workspace_id', userData.workspace_id)
                    .order('created_at', { ascending: false });

                if (ticketsError) throw ticketsError;

                // Calculate stats
                const newStats: Stats = {
                    total: tickets?.length || 0,
                    new: tickets?.filter(t => t.status === 'new').length || 0,
                    open: tickets?.filter(t => t.status === 'open').length || 0,
                    pending: tickets?.filter(t => t.status === 'pending').length || 0,
                    solved: tickets?.filter(t => t.status === 'solved').length || 0,
                    closed: tickets?.filter(t => t.status === 'closed').length || 0,
                    highPriority: tickets?.filter(t => t.priority === 'high').length || 0,
                    mediumPriority: tickets?.filter(t => t.priority === 'medium').length || 0,
                    lowPriority: tickets?.filter(t => t.priority === 'low').length || 0
                };
                setStats(newStats);

                // Generate recent activity from tickets
                if (tickets) {
                    const activity: Activity[] = tickets.slice(0, 5).map(ticket => ({
                        id: ticket.id,
                        type: 'ticket_created',
                        ticketId: ticket.id,
                        ticketTitle: ticket.title,
                        timestamp: ticket.created_at,
                        user: ticket.created_by_user_id
                    }));
                    setRecentActivity(activity);
                }
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchDashboardData();
    }, [session?.user?.id]);

    if (isLoading) {
        return <div className="p-4 text-center">Loading dashboard...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Tickets</p>
                            <p className="text-2xl font-semibold text-gray-900">
                                {stats.total}
                            </p>
                        </div>
                        <Inbox className="text-blue-500" size={24} />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Open</p>
                            <p className="text-2xl font-semibold text-gray-900">
                                {stats.open}
                            </p>
                        </div>
                        <FolderOpen className="text-grey-500" size={24} />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Pending</p>
                            <p className="text-2xl font-semibold text-gray-900">
                                {stats.pending}
                            </p>
                        </div>
                        <Clock className="text-yellow-500" size={24} />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Solved</p>
                            <p className="text-2xl font-semibold text-gray-900">
                                {stats.solved}
                            </p>
                        </div>
                        <CheckCircle className="text-green-500" size={24} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-800">
                            Recent Activity
                        </h2>
                    </div>
                    <div className="p-4">
                        <div className="space-y-4">
                            {recentActivity.map((activity) => (
                                <div key={activity.id} className="flex items-start space-x-3">
                                    <TrendingUp className="text-blue-500 mt-1" size={20} />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            New ticket created
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {activity.ticketTitle}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {formatRelativeTime(activity.timestamp)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Priority Distribution */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-800">
                            Ticket Overview
                        </h2>
                    </div>
                    <div className="p-4">
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm text-gray-600 mb-1">
                                    <span>High Priority</span>
                                    <span>{stats.highPriority} tickets</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-red-500 h-2 rounded-full"
                                        style={{
                                            width: `${stats.total ? (stats.highPriority / stats.total) * 100 : 0}%`,
                                        }}
                                    ></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm text-gray-600 mb-1">
                                    <span>Medium Priority</span>
                                    <span>{stats.mediumPriority} tickets</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-yellow-500 h-2 rounded-full"
                                        style={{
                                            width: `${stats.total ? (stats.mediumPriority / stats.total) * 100 : 0}%`,
                                        }}
                                    ></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm text-gray-600 mb-1">
                                    <span>Low Priority</span>
                                    <span>{stats.lowPriority} tickets</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-green-500 h-2 rounded-full"
                                        style={{
                                            width: `${stats.total ? (stats.lowPriority / stats.total) * 100 : 0}%`,
                                        }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
  