-- Drop and recreate the trigger function with end_user as default role
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO users (id, email, workspace_id, role)
    VALUES (
        NEW.id,
        NEW.email,
        (SELECT id FROM workspaces WHERE slug = 'default'),
        COALESCE(NEW.raw_user_meta_data->>'role', 'end_user')  -- Use role from metadata if provided, otherwise default to end_user
    );
    RETURN NEW;
END;
$$;
