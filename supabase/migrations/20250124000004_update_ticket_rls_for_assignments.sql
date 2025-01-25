-- Drop existing policies
DROP POLICY IF EXISTS "End users can manage their own tickets" ON tickets;
DROP POLICY IF EXISTS "Staff can manage workspace tickets" ON tickets;

-- End users can create tickets and update their own tickets (except assignments)
CREATE POLICY "End users can create tickets"
ON tickets FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM users
        WHERE auth.uid() = id
        AND role = 'end_user'
    )
    AND created_by_user_id = auth.uid()
    AND assigned_to_user_id IS NULL
    AND team_id IS NULL
);

CREATE POLICY "End users can update own tickets content"
ON tickets FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE auth.uid() = id
        AND role = 'end_user'
        AND created_by_user_id = auth.uid()
    )
    AND (
        -- Prevent end users from modifying assignments
        (assigned_to_user_id IS NULL OR assigned_to_user_id = tickets.assigned_to_user_id)
        AND (team_id IS NULL OR team_id = tickets.team_id)
    )
);

-- Agents and admins can manage all tickets in their workspace
CREATE POLICY "Staff can manage workspace tickets"
ON tickets FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE auth.uid() = id
        AND role IN ('admin', 'agent')
        AND (
            workspace_id = tickets.workspace_id
            OR EXISTS (
                SELECT 1 FROM team_members tm
                JOIN teams t ON t.id = tm.team_id
                WHERE tm.user_id = auth.uid()
                AND t.id = tickets.team_id
            )
        )
    )
);
