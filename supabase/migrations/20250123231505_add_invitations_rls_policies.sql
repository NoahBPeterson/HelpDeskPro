-- Enable RLS
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- Allow admins to manage all invitations
CREATE POLICY "Admins can manage all invitations" ON invitations
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Allow agents to create end_user invitations and view invitations
CREATE POLICY "Agents can create end_user invitations" ON invitations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'agent'
    )
    AND role = 'end_user'
  );

CREATE POLICY "Agents can view invitations" ON invitations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'agent'
    )
  );

-- End users cannot manage invitations (default deny)
