-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    workspace_id uuid REFERENCES workspaces(id) NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(workspace_id, name)
);

-- Create team_members junction table
CREATE TABLE IF NOT EXISTS team_members (
    team_id uuid REFERENCES teams(id) ON DELETE CASCADE,
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    role text CHECK (role IN ('leader', 'member')) DEFAULT 'member',
    created_at timestamptz DEFAULT now(),
    PRIMARY KEY (team_id, user_id)
);

-- Add team_id to tickets table
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS team_id uuid REFERENCES teams(id);

-- Enable RLS
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Teams table policies

-- Users can view teams in their workspace
CREATE POLICY "Users can view workspace teams"
ON teams FOR SELECT
USING (
    workspace_id IN (
        SELECT workspace_id 
        FROM users 
        WHERE auth.uid() = id
    )
);

-- Only admins can manage teams
CREATE POLICY "Admins can manage teams"
ON teams FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE auth.uid() = id
        AND role = 'admin'
        AND workspace_id = teams.workspace_id
    )
);

-- Team members table policies

-- Users can view team memberships in their workspace
CREATE POLICY "Users can view team memberships"
ON team_members FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM teams t
        JOIN users u ON u.workspace_id = t.workspace_id
        WHERE t.id = team_members.team_id
        AND u.id = auth.uid()
    )
);

-- Only admins can manage team memberships
CREATE POLICY "Admins can manage team memberships"
ON team_members FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM users u
        JOIN teams t ON t.workspace_id = u.workspace_id
        WHERE u.id = auth.uid()
        AND u.role = 'admin'
        AND t.id = team_members.team_id
    )
);

-- Add trigger to update tickets.updated_at
CREATE OR REPLACE FUNCTION update_tickets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tickets_updated_at
    BEFORE UPDATE ON tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_tickets_updated_at();

-- Update tickets RLS to include team-based access for agents
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