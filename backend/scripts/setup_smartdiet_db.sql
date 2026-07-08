DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'smartdiet') THEN
        CREATE ROLE smartdiet LOGIN PASSWORD 'smartdiet';
    ELSE
        ALTER ROLE smartdiet WITH LOGIN PASSWORD 'smartdiet';
    END IF;
END
$$;

SELECT 'CREATE DATABASE smartdiet OWNER smartdiet'
WHERE NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = 'smartdiet')\gexec

ALTER DATABASE smartdiet OWNER TO smartdiet;
