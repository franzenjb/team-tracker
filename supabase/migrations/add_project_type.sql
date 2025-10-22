-- Add project_type column to projects table
ALTER TABLE projects
ADD COLUMN project_type TEXT
CHECK (project_type IN ('dashboard', 'power-bi', 'gis-map', 'document', 'tableau', 'other'));

-- Set default value for existing projects
UPDATE projects
SET project_type = 'other'
WHERE project_type IS NULL;
