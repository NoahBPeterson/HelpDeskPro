-- Create team_categories table
CREATE TABLE team_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(team_id, category)
);

-- Enable RLS
ALTER TABLE team_categories ENABLE ROW LEVEL SECURITY;

-- RLS policies for team_categories
CREATE POLICY "Users can view team categories in their workspace" ON team_categories
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM teams t
            JOIN users u ON u.workspace_id = t.workspace_id
            WHERE t.id = team_categories.team_id
            AND u.id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage team categories" ON team_categories
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM teams t
            JOIN users u ON u.workspace_id = t.workspace_id
            WHERE t.id = team_categories.team_id
            AND u.id = auth.uid()
            AND u.role = 'admin'
        )
    );

-- Function to automatically assign tickets to teams based on category
CREATE OR REPLACE FUNCTION auto_assign_team_on_ticket_create()
RETURNS TRIGGER AS $$
DECLARE
    matching_team_id UUID;
BEGIN
    -- Find a team that handles this category in the same workspace
    SELECT tc.team_id INTO matching_team_id
    FROM team_categories tc
    JOIN teams t ON t.id = tc.team_id
    WHERE tc.category = NEW.category
    AND t.workspace_id = NEW.workspace_id
    LIMIT 1;

    -- If a matching team is found, assign the ticket to that team
    IF matching_team_id IS NOT NULL THEN
        NEW.team_id := matching_team_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-assign team on ticket creation
DROP TRIGGER IF EXISTS auto_assign_team_trigger ON tickets;
CREATE TRIGGER auto_assign_team_trigger
    BEFORE INSERT ON tickets
    FOR EACH ROW
    EXECUTE FUNCTION auto_assign_team_on_ticket_create(); 