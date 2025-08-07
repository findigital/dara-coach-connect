-- Create extensions schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS extensions;

-- Update extensions to their latest versions (without IF EXISTS)
-- We'll handle errors gracefully in the DO block
DO $$
DECLARE
    ext_names text[] := ARRAY[
        'uuid-ossp', 'pgcrypto', 'pgjwt', 'pg_stat_statements', 
        'pg_graphql', 'pg_hashids', 'supabase_vault', 'pgsodium',
        'pg_jsonschema', 'pg_plan_filter', 'pgtle', 'plpgsql_check',
        'timescaledb', 'http', 'pg_net', 'pg_cron', 'pgaudit',
        'pgtap', 'vector', 'wrappers'
    ];
    ext_name text;
BEGIN
    -- Update each extension if it exists
    FOREACH ext_name IN ARRAY ext_names
    LOOP
        BEGIN
            IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = ext_name) THEN
                EXECUTE format('ALTER EXTENSION %I UPDATE', ext_name);
                RAISE NOTICE 'Updated extension: %', ext_name;
            END IF;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Could not update extension %: %', ext_name, SQLERRM;
        END;
    END LOOP;
END $$;

-- Move extensions from public schema to extensions schema
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