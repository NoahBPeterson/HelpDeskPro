-- Enable RLS for comments table (if not already enabled)
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view public comments" ON comments;
DROP POLICY IF EXISTS "Staff can view all comments" ON comments;
DROP POLICY IF EXISTS "Users can create replies" ON comments;
DROP POLICY IF EXISTS "Staff can create all comment types" ON comments;

-- Users can view non-internal comments on tickets in their workspace
CREATE POLICY "Users can view public comments"
ON comments FOR SELECT
USING (
  type != 'note'
  AND ticket_id IN (
    SELECT id FROM tickets
    WHERE workspace_id IN (
      SELECT workspace_id 
      FROM users 
      WHERE auth.uid() = id
    )
  )
);

-- Agents and admins can view all comments including internal notes
CREATE POLICY "Staff can view all comments"
ON comments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE auth.uid() = id
    AND role IN ('admin', 'agent')
    AND workspace_id = (
      SELECT workspace_id 
      FROM tickets 
      WHERE id = comments.ticket_id
    )
  )
);

-- Users can create regular replies on their workspace tickets
CREATE POLICY "Users can create replies"
ON comments FOR INSERT
WITH CHECK (
  type = 'reply'
  AND EXISTS (
    SELECT 1 FROM tickets t
    JOIN users u ON u.workspace_id = t.workspace_id
    WHERE t.id = ticket_id
    AND u.id = auth.uid()
  )
);

-- Agents and admins can create all types of comments
CREATE POLICY "Staff can create all comment types"
ON comments FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users u
    JOIN tickets t ON t.workspace_id = u.workspace_id
    WHERE u.id = auth.uid()
    AND t.id = ticket_id
    AND u.role IN ('admin', 'agent')
  )
); 