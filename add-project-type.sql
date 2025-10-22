-- Add project type field to projects table
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/xnwzwppmknnyawffkpry/sql

-- 1. Add the project_type column
ALTER TABLE projects ADD COLUMN IF NOT EXISTS project_type text DEFAULT 'dashboard';

-- 2. Update existing projects based on their description/URL content
UPDATE projects 
SET project_type = CASE 
    WHEN description ILIKE '%power bi%' OR description ILIKE '%powerbi%' THEN 'power-bi'
    WHEN description ILIKE '%arcgis%' OR description ILIKE '%gis%' OR description ILIKE '%map%' THEN 'gis-map'
    WHEN description ILIKE '%sharepoint%' OR description ILIKE '%document%' THEN 'document'
    WHEN description ILIKE '%tableau%' THEN 'tableau'
    WHEN description ILIKE '%dashboard%' THEN 'dashboard'
    ELSE 'other'
END
WHERE project_type = 'dashboard';

-- 3. Verify the update
SELECT 
  project_type,
  COUNT(*) as count,
  array_agg(name ORDER BY name) as sample_projects
FROM projects 
GROUP BY project_type
ORDER BY count DESC;