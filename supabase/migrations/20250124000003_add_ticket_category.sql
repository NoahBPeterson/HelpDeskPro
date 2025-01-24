-- Add category column to tickets table
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS category text;

-- Update existing RLS policies to include the new column
DROP POLICY IF EXISTS "Staff can manage workspace tickets" ON tickets;
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