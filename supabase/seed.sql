-- workspaces table
CREATE TABLE IF NOT EXISTS workspaces (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text UNIQUE NOT NULL
);

-- users table
CREATE TABLE IF NOT EXISTS users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id uuid REFERENCES workspaces(id),
  email text UNIQUE NOT NULL,
  hashed_password text,
  role text CHECK (role IN ('admin','agent','end_user')) DEFAULT 'end_user',
  created_at timestamptz DEFAULT now()
);

-- tickets table
CREATE TABLE IF NOT EXISTS tickets (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id uuid REFERENCES workspaces(id),
  created_by_user_id uuid REFERENCES users(id),
  assigned_to_user_id uuid REFERENCES users(id),
  title text NOT NULL,
  description text,
  status text CHECK (status IN ('new','open','pending','solved','closed')) DEFAULT 'new',
  priority text CHECK (priority IN ('low','medium','high')) DEFAULT 'low',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id uuid REFERENCES tickets(id),
  author_id uuid REFERENCES users(id),
  content text NOT NULL,
  type text CHECK (type IN ('reply', 'note', 'status_change', 'assignment', 'system')) DEFAULT 'reply',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;

-- Users can view their own workspace
CREATE POLICY "Users can view own workspace" ON workspaces
FOR SELECT
USING (
  id IN (
    SELECT workspace_id 
    FROM users 
    WHERE id = auth.uid()
  )
);

-- Only admins can create/update workspaces
CREATE POLICY "Admins can manage workspaces"
ON workspaces FOR ALL
USING (EXISTS (
  SELECT 1 FROM users 
  WHERE auth.uid() = id 
  AND role = 'admin' 
  AND workspace_id = workspaces.id
));

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow users to read other users in their workspace
CREATE POLICY "Users can view users in same workspace" ON users
FOR SELECT
USING (
  workspace_id IN (
    SELECT workspace_id 
    FROM users 
    WHERE id = auth.uid()
  )
);

-- Users can update their own record
CREATE POLICY "Users can update own record" ON users
FOR UPDATE
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Allow insert during signup
CREATE POLICY "Allow insert during signup" ON users
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Only admins can create/delete users in their workspace
CREATE POLICY "Admins can manage users in their workspace"
ON users FOR ALL
USING (EXISTS (
  SELECT 1 FROM users 
  WHERE auth.uid() = id 
  AND role = 'admin' 
  AND workspace_id = users.workspace_id
));

-- Enable RLS
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- Users can view tickets in their workspace
CREATE POLICY "Users can view tickets in their workspace"
ON tickets FOR SELECT
USING (workspace_id IN (
  SELECT workspace_id 
  FROM users 
  WHERE auth.uid() = id
));

-- End users can only create tickets and update their own tickets
CREATE POLICY "End users can manage their own tickets"
ON tickets FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE auth.uid() = id
    AND role = 'end_user'
    AND created_by_user_id = auth.uid()
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
    AND workspace_id = tickets.workspace_id
  )
);

-- Enable RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

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