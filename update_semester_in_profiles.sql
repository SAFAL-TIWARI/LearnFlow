-- Update semester in profiles from users table
DO $$
DECLARE
  user_record RECORD;
BEGIN
  -- Loop through all users in the auth.users table
  FOR user_record IN 
    SELECT 
      id, 
      email, 
      raw_user_meta_data 
    FROM auth.users
  LOOP
    -- Update semester in profiles table from user metadata
    UPDATE profiles
    SET 
      semester = COALESCE(
        user_record.raw_user_meta_data->>'semester', 
        profiles.semester
      ),
      updated_at = now()
    WHERE id = user_record.id;
    
    RAISE NOTICE 'Updated semester for user: %', user_record.email;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Also update semester from users table if available
DO $$
DECLARE
  user_record RECORD;
BEGIN
  -- Loop through all users in the users table
  FOR user_record IN 
    SELECT 
      id, 
      email, 
      semester
    FROM users
    WHERE semester IS NOT NULL AND semester != ''
  LOOP
    -- Update semester in profiles table from users table
    UPDATE profiles
    SET 
      semester = user_record.semester,
      updated_at = now()
    WHERE id = user_record.id;
    
    RAISE NOTICE 'Updated semester from users table for user: %', user_record.email;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Verify the updates
SELECT 
  p.id, 
  p.username, 
  p.semester AS profile_semester, 
  u.semester AS user_semester,
  (auth.raw_user_meta_data->>'semester') AS auth_semester
FROM 
  profiles p
LEFT JOIN 
  users u ON p.id = u.id
LEFT JOIN 
  auth.users auth ON p.id = auth.id
WHERE 
  p.semester IS NULL OR p.semester = '';