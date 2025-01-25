-- Drop the old function
DROP FUNCTION IF EXISTS search_tickets(text, uuid, uuid);

-- Create the improved function
CREATE OR REPLACE FUNCTION search_tickets(
    search_query text,
    p_workspace_id uuid,
    requesting_user_id uuid
)
RETURNS TABLE (
    ticket_id uuid,
    title text,
    description text,
    status text,
    priority text,
    created_at timestamptz,
    updated_at timestamptz,
    created_by_user_id uuid,
    assigned_to_user_id uuid,
    team_id uuid,
    workspace_id uuid,
    rank real,
    matched_comment_id uuid,
    matched_comment_content text,
    matched_comment_type text
) LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    user_role text;
    search_terms text;
BEGIN
    -- Get the user's role
    SELECT role INTO user_role FROM users WHERE id = requesting_user_id;

    -- Only search for words with 2 or more characters
    IF length(search_query) < 2 THEN
        RETURN;
    END IF;

    -- Create a simple prefix search pattern
    search_terms := lower(search_query) || ':*';

    RETURN QUERY
    WITH ranked_matches AS (
        -- Search in tickets
        SELECT 
            t.id as ticket_id,
            t.title,
            t.description,
            t.status,
            t.priority,
            t.created_at,
            t.updated_at,
            t.created_by_user_id,
            t.assigned_to_user_id,
            t.team_id,
            t.workspace_id,
            ts_rank(t.search_vector, to_tsquery('english', search_terms)) as rank,
            NULL::uuid as matched_comment_id,
            NULL::text as matched_comment_content,
            NULL::text as matched_comment_type
        FROM tickets t
        WHERE 
            t.workspace_id = p_workspace_id AND
            t.search_vector @@ to_tsquery('english', search_terms)

        UNION ALL

        -- Search in comments
        SELECT 
            t.id,
            t.title,
            t.description,
            t.status,
            t.priority,
            t.created_at,
            t.updated_at,
            t.created_by_user_id,
            t.assigned_to_user_id,
            t.team_id,
            t.workspace_id,
            ts_rank(c.search_vector, to_tsquery('english', search_terms)) as rank,
            c.id,
            c.content,
            c.type
        FROM tickets t
        JOIN comments c ON c.ticket_id = t.id
        WHERE 
            t.workspace_id = p_workspace_id AND
            c.search_vector @@ to_tsquery('english', search_terms) AND
            (
                -- Only show internal notes to agents and admins
                c.type != 'note' OR 
                user_role IN ('agent', 'admin')
            )
    )
    SELECT DISTINCT ON (rm.ticket_id)
        rm.ticket_id,
        rm.title,
        rm.description,
        rm.status,
        rm.priority,
        rm.created_at,
        rm.updated_at,
        rm.created_by_user_id,
        rm.assigned_to_user_id,
        rm.team_id,
        rm.workspace_id,
        rm.rank,
        rm.matched_comment_id,
        rm.matched_comment_content,
        rm.matched_comment_type
    FROM ranked_matches rm
    ORDER BY rm.ticket_id, rm.rank DESC
    LIMIT 10;
END;
$$; 