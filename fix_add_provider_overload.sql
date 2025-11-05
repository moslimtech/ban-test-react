-- Fix add_provider function overloading issue
-- Drop the 18-parameter version to keep only the 19-parameter version with p_online

DROP FUNCTION IF EXISTS add_provider(
  text, text, text, text, text, text, text, text, text, text, numeric, numeric, text, boolean, text, uuid, bigint, bigint
) CASCADE;
