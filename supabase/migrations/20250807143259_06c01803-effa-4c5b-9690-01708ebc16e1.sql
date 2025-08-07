-- Create extensions schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS extensions;

-- Move extensions from public schema to extensions schema
-- First, we need to identify and relocate common extensions

-- Update extensions to their latest versions
ALTER EXTENSION IF EXISTS "uuid-ossp" UPDATE;
ALTER EXTENSION IF EXISTS "pgcrypto" UPDATE;
ALTER EXTENSION IF EXISTS "pgjwt" UPDATE;
ALTER EXTENSION IF EXISTS "pg_stat_statements" UPDATE;
ALTER EXTENSION IF EXISTS "pg_graphql" UPDATE;
ALTER EXTENSION IF EXISTS "pg_hashids" UPDATE;
ALTER EXTENSION IF EXISTS "supabase_vault" UPDATE;
ALTER EXTENSION IF EXISTS "pgsodium" UPDATE;
ALTER EXTENSION IF EXISTS "pg_jsonschema" UPDATE;
ALTER EXTENSION IF EXISTS "pg_plan_filter" UPDATE;
ALTER EXTENSION IF EXISTS "pgtle" UPDATE;
ALTER EXTENSION IF EXISTS "plpgsql_check" UPDATE;
ALTER EXTENSION IF EXISTS "timescaledb" UPDATE;
ALTER EXTENSION IF EXISTS "http" UPDATE;
ALTER EXTENSION IF EXISTS "pg_net" UPDATE;
ALTER EXTENSION IF EXISTS "pg_cron" UPDATE;
ALTER EXTENSION IF EXISTS "pgaudit" UPDATE;
ALTER EXTENSION IF EXISTS "pgtap" UPDATE;
ALTER EXTENSION IF EXISTS "vector" UPDATE;
ALTER EXTENSION IF EXISTS "wrappers" UPDATE;

-- For extensions that can be moved, relocate them to extensions schema
-- Note: Some system extensions cannot be moved and that's expected
DO $$
DECLARE
    ext_name text;
    ext_schema text;
BEGIN
    -- Get list of extensions in public schema
    FOR ext_name, ext_schema IN 
        SELECT e.extname, n.nspname 
        FROM pg_extension e 
        JOIN pg_namespace n ON e.extnamespace = n.oid 
        WHERE n.nspname = 'public'
        AND e.extname NOT IN ('plpgsql') -- Skip system extensions that cannot be moved
    LOOP
        -- Try to move extension to extensions schema
        BEGIN
            EXECUTE format('ALTER EXTENSION %I SET SCHEMA extensions', ext_name);
            RAISE NOTICE 'Moved extension % from public to extensions schema', ext_name;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Could not move extension % (this may be expected for system extensions): %', ext_name, SQLERRM;
        END;
    END LOOP;
END $$;