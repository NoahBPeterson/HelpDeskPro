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
BEGIN
    -- Get the user's role
    SELECT role INTO user_role FROM users WHERE id = requesting_user_id;

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
            ts_rank(t.search_vector, websearch_to_tsquery('english', search_query)) as rank,
            NULL::uuid as matched_comment_id,
            NULL::text as matched_comment_content,
            NULL::text as matched_comment_type
        FROM tickets t
        WHERE 
            t.workspace_id = p_workspace_id AND
            t.search_vector @@ websearch_to_tsquery('english', search_query)

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
            ts_rank(c.search_vector, websearch_to_tsquery('english', search_query)) as rank,
            c.id,
            c.content,
            c.type
        FROM tickets t
        JOIN comments c ON c.ticket_id = t.id
        WHERE 
            t.workspace_id = p_workspace_id AND
            c.search_vector @@ websearch_to_tsquery('english', search_query) AND
            (
                -- Only show internal notes to agents and admins
                c.type != 'note' OR 
                user_role IN ('agent', 'admin')
            )
    )
    SELECT DISTINCT ON (ticket_id)
        ticket_id,
        title,
        description,
        status,
        priority,
        created_at,
        updated_at,
        created_by_user_id,
        assigned_to_user_id,
        team_id,
        workspace_id,
        rank,
        matched_comment_id,
        matched_comment_content,
        matched_comment_type
    FROM ranked_matches
    ORDER BY rank DESC
    LIMIT 10;
END;
$$; 