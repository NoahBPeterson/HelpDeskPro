-- Add search vectors to tickets table
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS search_vector tsvector;
CREATE INDEX IF NOT EXISTS tickets_search_idx ON tickets USING gin(search_vector);

-- Create a function to update ticket search vectors
CREATE OR REPLACE FUNCTION tickets_search_vector_update() RETURNS trigger AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(NEW.description, '')), 'B');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for tickets
DROP TRIGGER IF EXISTS tickets_search_vector_trigger ON tickets;
CREATE TRIGGER tickets_search_vector_trigger
    BEFORE INSERT OR UPDATE ON tickets
    FOR EACH ROW
    EXECUTE FUNCTION tickets_search_vector_update();

-- Add search vectors to comments table
ALTER TABLE comments ADD COLUMN IF NOT EXISTS search_vector tsvector;
CREATE INDEX IF NOT EXISTS comments_search_idx ON comments USING gin(search_vector);

-- Create a function to update comment search vectors
CREATE OR REPLACE FUNCTION comments_search_vector_update() RETURNS trigger AS $$
BEGIN
    NEW.search_vector := to_tsvector('english', coalesce(NEW.content, ''));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for comments
DROP TRIGGER IF EXISTS comments_search_vector_trigger ON comments;
CREATE TRIGGER comments_search_vector_trigger
    BEFORE INSERT OR UPDATE ON comments
    FOR EACH ROW
    EXECUTE FUNCTION comments_search_vector_update();

-- Update existing data
UPDATE tickets SET search_vector = 
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'B');

UPDATE comments SET search_vector = to_tsvector('english', coalesce(content, '')); 