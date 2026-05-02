-- Create moods table
CREATE TABLE moods (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID,
  lat FLOAT8,
  lng FLOAT8,
  city TEXT,
  emoji TEXT,
  mood TEXT,
  caption TEXT,
  expires_at TIMESTAMPTZ,
  relates INT4 DEFAULT 0,
  letters INT4 DEFAULT 0
);

-- Enable Row Level Security (optional - disable for testing)
-- ALTER TABLE moods ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read moods
-- CREATE POLICY "Anyone can read moods" ON moods FOR SELECT USING (true);

-- Create policy to allow authenticated users to insert moods
-- CREATE POLICY "Authenticated users can insert moods" ON moods FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE moods;

-- Create index for faster queries
CREATE INDEX idx_moods_expires_at ON moods(expires_at);
CREATE INDEX idx_moods_created_at ON moods(created_at DESC);

-- Function to auto-delete expired moods (optional)
CREATE OR REPLACE FUNCTION delete_expired_moods()
RETURNS void AS $$
BEGIN
  DELETE FROM moods WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup every hour (requires pg_cron extension)
-- SELECT cron.schedule(
--   'delete-expired-moods',
--   '0 * * * *',
--   'SELECT delete_expired_moods();'
-- );
