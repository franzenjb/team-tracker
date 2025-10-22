-- Enhanced Team Tracker Schema for Jim's I&P Data
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/xnwzwppmknnyawffkpry/sql

-- 1. ENHANCE PEOPLE TABLE
ALTER TABLE people 
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS red_cross_email text,
ADD COLUMN IF NOT EXISTS powerbi_access text,
ADD COLUMN IF NOT EXISTS arcgis_access text,
ADD COLUMN IF NOT EXISTS mentor1 text,
ADD COLUMN IF NOT EXISTS mentor2 text,
ADD COLUMN IF NOT EXISTS power_bi_yn text,
ADD COLUMN IF NOT EXISTS gis_yn text;

-- 2. DROP AND RECREATE PROJECTS TABLE WITH ENHANCED SCHEMA
DROP TABLE IF EXISTS projects CASCADE;

CREATE TABLE projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  project_type text default 'Power BI',
  developer text,
  workspace text,
  power_bi_link text,
  description_tags text,
  project_data text,
  status text check (status in ('planned', 'active', 'paused', 'complete')) default 'active',
  start_date date,
  end_date date,
  created_at timestamptz default now()
);

-- 3. ENHANCE ASSIGNMENTS TABLE
ALTER TABLE assignments 
ADD COLUMN IF NOT EXISTS title text,
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS status text CHECK (status IN ('pending', 'in_progress', 'complete', 'on_hold')) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS priority text CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS due_date date,
ADD COLUMN IF NOT EXISTS requester text;

-- 4. CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_assignments_status ON assignments(status);
CREATE INDEX IF NOT EXISTS idx_assignments_priority ON assignments(priority);
CREATE INDEX IF NOT EXISTS idx_assignments_due_date ON assignments(due_date);
CREATE INDEX IF NOT EXISTS idx_projects_type ON projects(project_type);
CREATE INDEX IF NOT EXISTS idx_projects_developer ON projects(developer);

-- 5. UPDATE RLS POLICIES FOR NEW TABLES
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Allow all operations on projects" ON projects FOR ALL USING (true) WITH CHECK (true);

-- 6. INSERT SAMPLE PROJECT TO TEST
INSERT INTO projects (name, description, project_type, status) VALUES
('Website Redesign', 'Complete redesign of company website', 'Web Development', 'active');

-- Migration complete!