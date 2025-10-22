-- Enhanced Assignment Migration for Team Tracker
-- Run this to add work request workflow fields

-- Add enhanced fields to assignments table
ALTER TABLE assignments 
ADD COLUMN IF NOT EXISTS title text,
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS status text CHECK (status IN ('pending', 'in_progress', 'complete', 'on_hold')) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS priority text CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS due_date date,
ADD COLUMN IF NOT EXISTS requester text;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_assignments_status ON assignments(status);
CREATE INDEX IF NOT EXISTS idx_assignments_priority ON assignments(priority);
CREATE INDEX IF NOT EXISTS idx_assignments_due_date ON assignments(due_date);

-- Add sample assignment data
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
  'Update hurricane planning dashboard with 2025 data',
  'Need to update the Power BI dashboard with latest hurricane shelter capacity and evacuation route data for the 2025 season.',
  'pending',
  'high',
  'Regional Manager',
  'Power BI Developer',
  CURRENT_DATE + INTERVAL '7 days'
FROM people p, projects pr
WHERE p.name = 'Jim Manson' 
  AND pr.name = 'Website Redesign'
LIMIT 1;