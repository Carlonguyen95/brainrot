-- Create media table to track uploaded files
CREATE TABLE IF NOT EXISTS media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  type VARCHAR(100) NOT NULL,
  size BIGINT NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  definition_id UUID NOT NULL REFERENCES definitions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create comment likes table
CREATE TABLE IF NOT EXISTS comment_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(comment_id, user_id)
);

-- Add image_url column to definitions table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'definitions' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE definitions ADD COLUMN image_url TEXT;
  END IF;
END $$;

-- Create helper functions for incrementing and decrementing
CREATE OR REPLACE FUNCTION increment(val integer, x integer DEFAULT 1)
RETURNS integer AS $$
BEGIN
  RETURN val + x;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement(val integer, x integer DEFAULT 1)
RETURNS integer AS $$
BEGIN
  RETURN GREATEST(0, val - x);
END;
$$ LANGUAGE plpgsql;

