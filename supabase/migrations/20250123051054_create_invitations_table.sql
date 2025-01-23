-- Create invitations table
CREATE TABLE IF NOT EXISTS invitations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id uuid REFERENCES workspaces(id),
  invited_by_user_id uuid REFERENCES users(id),
  email text NOT NULL,
  role text CHECK (role IN ('admin','agent','end_user')) DEFAULT 'end_user',
  token text UNIQUE NOT NULL,
  status text CHECK (status IN ('pending','accepted','expired')) DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '7 days')
);

-- Enable RLS
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for invitations table

-- Admins and agents can view invitations in their workspace
CREATE POLICY "Staff can view workspace invitations"
ON invitations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE auth.uid() = id
    AND role IN ('admin', 'agent')
    AND workspace_id = invitations.workspace_id
  )
);

-- Only admins can create invitations
CREATE POLICY "Admins can create invitations"
ON invitations FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE auth.uid() = id
    AND role = 'admin'
    AND workspace_id = invitations.workspace_id
  )
);

-- Only admins can update invitations
CREATE POLICY "Admins can update invitations"
ON invitations FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE auth.uid() = id
    AND role = 'admin'
    AND workspace_id = invitations.workspace_id
  )
);

-- Only admins can delete invitations
CREATE POLICY "Admins can delete invitations"
ON invitations FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE auth.uid() = id
    AND role = 'admin'
    AND workspace_id = invitations.workspace_id
  )
);

-- Create function to generate secure invitation tokens
CREATE OR REPLACE FUNCTION generate_invitation_token()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  token text;
BEGIN
  token := encode(gen_random_bytes(32), 'base64');
  RETURN token;
END;
$$;

-- Create trigger to automatically generate invitation tokens
CREATE OR REPLACE FUNCTION set_invitation_token()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.token IS NULL THEN
    NEW.token := generate_invitation_token();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER before_invitation_insert
  BEFORE INSERT ON invitations
  FOR EACH ROW
  EXECUTE FUNCTION set_invitation_token();
