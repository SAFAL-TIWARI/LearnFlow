-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS update_profiles_from_auth();

-- Create a function to update profiles from auth.users metadata
CREATE OR REPLACE FUNCTION update_profiles_from_auth()
RETURNS void AS $$
DECLARE
  auth_user RECORD;
BEGIN
  FOR auth_user IN 
    SELECT 
      id, 
      email, 
      raw_user_meta_data 
    FROM auth.users
  LOOP
    -- Check if profile exists
    IF EXISTS (SELECT 1 FROM profiles WHERE id = auth_user.id) THEN
      -- Update existing profile with metadata
      UPDATE profiles
      SET 
        full_name = COALESCE(
          auth_user.raw_user_meta_data->>'full_name', 
          profiles.full_name
        ),
        branch = COALESCE(
          auth_user.raw_user_meta_data->>'branch', 
          profiles.branch
        ),
        year = COALESCE(
          auth_user.raw_user_meta_data->>'year', 
          profiles.year
        ),
        semester = COALESCE(
          auth_user.raw_user_meta_data->>'semester', 
          profiles.semester
        ),
        updated_at = now()
      WHERE id = auth_user.id;
      
      RAISE NOTICE 'Updated profile for user: %', auth_user.email;
    ELSE
      -- Create new profile
      INSERT INTO profiles (
        id,
        username,
        full_name,
        branch,
        year,
        semester,
        is_public,
        created_at,
        updated_at
      ) VALUES (
        auth_user.id,
        COALESCE(auth_user.raw_user_meta_data->>'username', split_part(auth_user.email, '@', 1)),
        COALESCE(auth_user.raw_user_meta_data->>'full_name', split_part(auth_user.email, '@', 1)),
        COALESCE(auth_user.raw_user_meta_data->>'branch', ''),
        COALESCE(auth_user.raw_user_meta_data->>'year', ''),
        COALESCE(auth_user.raw_user_meta_data->>'semester', ''),
        true,
        now(),
        now()
      );
      
      RAISE NOTICE 'Created profile for user: %', auth_user.email;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Run the function to update profiles
SELECT update_profiles_from_auth();

-- Create a function to ensure branch and year are properly displayed
CREATE OR REPLACE FUNCTION ensure_profile_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- If branch, year, or semester are NULL, try to get them from auth.users metadata
  IF NEW.branch IS NULL OR NEW.branch = '' OR NEW.year IS NULL OR NEW.year = '' OR NEW.semester IS NULL OR NEW.semester = '' THEN
    DECLARE
      user_metadata JSONB;
    BEGIN
      SELECT raw_user_meta_data INTO user_metadata
      FROM auth.users
      WHERE id = NEW.id;
      
      IF user_metadata IS NOT NULL THEN
        -- Update branch if needed
        IF NEW.branch IS NULL OR NEW.branch = '' THEN
          NEW.branch := COALESCE(user_metadata->>'branch', '');
        END IF;
        
        -- Update year if needed
        IF NEW.year IS NULL OR NEW.year = '' THEN
          NEW.year := COALESCE(user_metadata->>'year', '');
        END IF;
        
        -- Update semester if needed
        IF NEW.semester IS NULL OR NEW.semester = '' THEN
          NEW.semester := COALESCE(user_metadata->>'semester', '');
        END IF;
      END IF;
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to ensure profile fields are properly set
DROP TRIGGER IF EXISTS ensure_profile_fields_trigger ON profiles;
CREATE TRIGGER ensure_profile_fields_trigger
BEFORE INSERT OR UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION ensure_profile_fields();

-- Update all existing profiles to ensure branch and year are set
UPDATE profiles
SET updated_at = now()
WHERE true;