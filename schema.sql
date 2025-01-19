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
  created_at timestamptz DEFAULT now()
); 