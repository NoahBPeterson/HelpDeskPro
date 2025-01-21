-- Drop everything first (if exists)
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS tickets CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS workspaces CASCADE;

-- Create tables
CREATE TABLE workspaces (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text UNIQUE NOT NULL
);

CREATE TABLE users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id uuid REFERENCES workspaces(id),
  email text UNIQUE NOT NULL,
  hashed_password text,
  role text CHECK (role IN ('admin','agent','end_user')) DEFAULT 'end_user',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE tickets (
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

CREATE TABLE comments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id uuid REFERENCES tickets(id),
  author_id uuid REFERENCES users(id),
  content text NOT NULL,
  type text CHECK (type IN ('reply', 'note', 'status_change', 'assignment', 'system')) DEFAULT 'reply',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Create default workspace
INSERT INTO workspaces (name, slug)
VALUES ('Default Workspace', 'default')
ON CONFLICT (slug) DO NOTHING;

-- Create a function to handle user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO users (id, email, workspace_id, role)
    VALUES (
        NEW.id,
        NEW.email,
        (SELECT id FROM workspaces WHERE slug = 'default'),
        'admin'
    );
    RETURN NEW;
END;
$$;

-- Create a trigger to automatically create a user record
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- Set up RLS policies
-- Users table policies
CREATE POLICY "Allow authenticated users to read users" ON users
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Users can update own record" ON users
FOR UPDATE USING (id = auth.uid())
WITH CHECK (id = auth.uid());

CREATE POLICY "Allow insert during signup" ON users
FOR INSERT WITH CHECK (auth.uid() = id);

-- Workspace policies
CREATE POLICY "Users can view own workspace" ON workspaces
FOR SELECT USING (
  id IN (SELECT workspace_id FROM users WHERE id = auth.uid())
);

-- Ticket policies
CREATE POLICY "Users can view tickets in their workspace" ON tickets
FOR SELECT USING (
  workspace_id IN (SELECT workspace_id FROM users WHERE id = auth.uid())
);

CREATE POLICY "Users can create tickets" ON tickets
FOR INSERT WITH CHECK (
  created_by_user_id = auth.uid()
);

CREATE POLICY "Users can update own tickets" ON tickets
FOR UPDATE USING (created_by_user_id = auth.uid());

-- Comment policies
CREATE POLICY "Users can view comments on their workspace tickets" ON comments
FOR SELECT USING (
  ticket_id IN (
    SELECT id FROM tickets WHERE workspace_id IN (
      SELECT workspace_id FROM users WHERE id = auth.uid()
    )
  )
);

CREATE POLICY "Users can create comments on workspace tickets" ON comments
FOR INSERT WITH CHECK (
  ticket_id IN (
    SELECT id FROM tickets WHERE workspace_id IN (
      SELECT workspace_id FROM users WHERE id = auth.uid()
    )
  )
);
