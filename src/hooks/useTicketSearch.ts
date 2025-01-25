import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Database } from '../types/database';


type SearchTicketResult = Database['functions']['search_tickets']['Returns'][number];

interface SearchResult {
    ticket_id: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    created_at: string;
    updated_at: string;
    created_by_user_id: string;
    assigned_to_user_id: string;
    team_id: string;
    workspace_id: string;
    rank: number;
    matched_comment_id: string | null;
    matched_comment_content: string | null;
    matched_comment_type: string | null;
}

export function useTicketSearch(workspaceId: string | undefined) {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const abortControllerRef = useRef<AbortController | null>(null);
    const { session } = useAuth();

    useEffect(() => {
        const searchTickets = async () => {
            if (!workspaceId || searchQuery.length < 2) {
                setSearchResults([]);
                setIsSearching(false);
                return;
            }

            // Cancel previous request
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }

            // Create new abort controller
            abortControllerRef.current = new AbortController();
            setIsSearching(true);

            try {
                if (!session || !session.user) return;

                const { data, error } = await (supabase.rpc as any)('search_tickets', {
                    search_query: searchQuery,
                    p_workspace_id: workspaceId,
                    requesting_user_id: session.user.id
                });

                if (!error && !abortControllerRef.current.signal.aborted) {
                    setSearchResults(data || []);
                }
            } catch (error) {
                if (error instanceof Error && error.name === 'AbortError') {
                    // Ignore abort errors
                    return;
                }
                console.error('Search error:', error);
            } finally {
                if (!abortControllerRef.current?.signal.aborted) {
                    setIsSearching(false);
                }
            }
        };

        const timeoutId = setTimeout(searchTickets, 300); // 300ms debounce

        return () => {
            clearTimeout(timeoutId);
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [searchQuery, workspaceId, session]);

    return {
        searchQuery,
        setSearchQuery,
        searchResults,
        isSearching,
        selectedIndex,
        setSelectedIndex
    };
} 