-- COMPLETE FIX for Team Tracker Enhanced Assignments
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/xnwzwppmknnyawffkpry/sql

-- 1. Add missing enhanced fields to assignments table
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS title text;
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending';
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS priority text DEFAULT 'medium';
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS due_date date;
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS requester text;

-- 2. Update existing assignments with proper data
UPDATE assignments 
SET 
  title = 'Update hurricane planning dashboard with 2025 data',
  description = 'Need to update the Power BI dashboard with latest hurricane shelter capacity and evacuation route data for the 2025 season.',
  status = 'pending',
  priority = 'high',
  requester = 'Regional Manager',
  role = 'Power BI Developer',
  due_date = CURRENT_DATE + INTERVAL '7 days'
WHERE title IS NULL;

-- 3. Fix assignment-people relationships by linking to Jim Manson
UPDATE assignments 
SET person_id = (
  SELECT id FROM people WHERE name ILIKE '%jim%manson%' LIMIT 1
)
WHERE person_id IS NULL OR person_id NOT IN (SELECT id FROM people);

-- 4. Verify the fixes
SELECT 
  a.id,
  a.title,
  a.status,
  a.priority,
  p.name as person_name,
  pr.name as project_name
FROM assignments a
LEFT JOIN people p ON a.person_id = p.id
LEFT JOIN projects pr ON a.project_id = pr.id;

-- Migration complete!