-- Create a function to create a user record with admin privileges
-- This bypasses RLS policies by using SECURITY DEFINER
CREATE OR REPLACE FUNCTION create_user_record(
  user_id UUID,
  user_email TEXT,
  user_name TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER -- This makes the function run with the privileges of the creator
AS $$
BEGIN
  -- Insert the user record
  INSERT INTO users (id, email, name, created_at, updated_at)
  VALUES (
    user_id,
    user_email,
    user_name,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING; -- Don't error if the user already exists
  
  RETURN TRUE;
END;
$$;
