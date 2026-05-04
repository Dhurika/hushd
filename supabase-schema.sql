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


-- Create replies table
CREATE TABLE replies (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  mood_id BIGINT REFERENCES moods(id) ON DELETE CASCADE,
  user_id UUID,
  text TEXT NOT NULL
);

-- Create letters table
CREATE TABLE letters (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  mood_id BIGINT REFERENCES moods(id) ON DELETE CASCADE,
  from_user_id UUID,
  to_user_id UUID,
  subject TEXT,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE
);

-- Enable Realtime for replies
ALTER PUBLICATION supabase_realtime ADD TABLE replies;

-- Create indexes
CREATE INDEX idx_replies_mood_id ON replies(mood_id);
CREATE INDEX idx_letters_to_user ON letters(to_user_id);
CREATE INDEX idx_letters_mood_id ON letters(mood_id);
