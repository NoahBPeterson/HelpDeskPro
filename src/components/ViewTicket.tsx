import { useParams, useNavigate } from "react-router-dom";
import { Clock, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { Ticket, Comment } from "../types/tickets";

function formatDate(date: string) {
    return new Date(date).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getStatusIcon(status: Ticket['status']) {
    switch (status) {
        case 'new':
        case 'open':
            return <AlertCircle className="text-red-500" size={18} />;
        case 'pending':
            return <Clock className="text-yellow-500" size={18} />;
        case 'solved':
        case 'closed':
            return <CheckCircle className="text-green-500" size={18} />;
    }
}

export function ViewTicket() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { session } = useAuth();
    const [ticket, setTicket] = useState<Ticket | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [newComment, setNewComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

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
                    .select('*')
                    .eq('id', id)
                    .eq('workspace_id', userData.workspace_id)
                    .single();

                if (ticketError) throw ticketError;
                setTicket(ticketData);

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
                    created_by_user_id: session.user.id
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
            <div className="bg-white rounded-lg shadow">
                <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-800">
                            {ticket.title}
                        </h2>
                        <div className="flex items-center space-x-2">
                            {getStatusIcon(ticket.status)}
                            <span className="text-sm font-medium capitalize">
                                {ticket.status}
                            </span>
                        </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                        Created on {formatDate(ticket.created_at)}
                    </div>
                </div>
                <div className="p-4 space-y-4">
                    <div>
                        <h3 className="text-sm font-medium text-gray-700">Description</h3>
                        <p className="mt-1 text-sm text-gray-600">{ticket.description}</p>
                    </div>
                    <div className="border-t pt-4">
                        <h3 className="text-sm font-medium text-gray-700 mb-4">Comments</h3>
                        {comments.length === 0 ? (
                            <p className="text-sm text-gray-500">No comments yet</p>
                        ) : (
                            comments.map((comment) => (
                                <div key={comment.id} className="bg-gray-50 rounded-lg p-3 mb-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium">{comment.user.email}</span>
                                        <span className="text-gray-500">
                                            {formatDate(comment.created_at)}
                                        </span>
                                    </div>
                                    <p className="mt-1 text-sm text-gray-600">{comment.content}</p>
                                </div>
                            ))
                        )}
                    </div>
                    <form onSubmit={handleSubmitComment} className="border-t pt-4">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">
                            Add Comment
                        </h3>
                        <textarea
                            rows={3}
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            placeholder="Type your comment..."
                            required
                        />
                        <div className="mt-3 flex justify-end">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'Sending...' : 'Send Comment'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
