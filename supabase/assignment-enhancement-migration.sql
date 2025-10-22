-- Migration to add enhanced assignment fields for work request workflow
-- Run this in your Supabase SQL Editor

-- Add new columns to assignments table for work request tracking
ALTER TABLE assignments 
ADD COLUMN IF NOT EXISTS title text,
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS status text CHECK (status IN ('pending', 'in_progress', 'complete', 'on_hold')) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS priority text CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS due_date date,
ADD COLUMN IF NOT EXISTS requester text;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_assignments_status ON assignments(status);
CREATE INDEX IF NOT EXISTS idx_assignments_priority ON assignments(priority);
CREATE INDEX IF NOT EXISTS idx_assignments_due_date ON assignments(due_date);
CREATE INDEX IF NOT EXISTS idx_assignments_requester ON assignments(requester);

-- Add some sample data to test the new workflow
INSERT INTO assignments (
  person_id, 
  project_id, 
  title,
  description,
  status,
  priority,
  requester,
  role,
  due_date
)
SELECT 
  p.id,
  pr.id,
  'Update hurricane planning dashboard',
  'The dashboard needs to be updated with the latest hurricane season data and new shelter capacity information.',
  'pending',
  'high',
  'Jim Manson',
  'Power BI Developer',
  CURRENT_DATE + INTERVAL '7 days'
FROM people p
CROSS JOIN projects pr
WHERE p.name ILIKE '%jim%' 
  AND pr.name ILIKE '%hurricane%'
LIMIT 1;

-- Add another sample assignment
INSERT INTO assignments (
  person_id, 
  project_id, 
  title,
  description,
  status,
  priority,
  requester,
  role,
  due_date
)
SELECT 
  p.id,
  pr.id,
  'Fix map display issues',
  'Users are reporting that the map is not displaying correctly in Firefox browser.',
  'in_progress',
  'medium',
  'Regional Manager',
  'GIS Developer',
  CURRENT_DATE + INTERVAL '3 days'
FROM people p
CROSS JOIN projects pr
WHERE p.role ILIKE '%gis%'
  AND pr.name ILIKE '%map%'
LIMIT 1;