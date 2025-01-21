import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { Flag } from "lucide-react";
import { Ticket } from "../types/tickets";

type TicketWithCreator = Ticket & {
    creator: {
        email: string;
    };
};

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
            return <Flag className="text-gray-500" size={18} />;
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
  const { session } = useAuth();

  useEffect(() => {
    async function fetchTickets() {
      if (!session?.user?.id) return;

      try {
        // Get user's workspace_id
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('workspace_id')
          .eq('id', session.user.id)
          .single();

        if (userError) throw userError;

        // Fetch tickets with creator's email
        const { data, error } = await supabase
          .from('tickets')
          .select('*, creator:created_by_user_id(email)')
          .eq('workspace_id', userData.workspace_id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setTickets(data || []);
      } catch (error) {
        console.error('Error fetching tickets:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTickets();
  }, [session?.user?.id]);

  if (isLoading) {
    return <div className="p-4 text-center">Loading tickets...</div>;
  }

  if (tickets.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">No tickets found</h3>
        <p className="mt-2 text-sm text-gray-500">
          Get started by creating a new ticket.
        </p>
        <div className="mt-6">
          <Link
            to="/create"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Create New Ticket
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          All Tickets
        </h3>
      </div>
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
  );
}
