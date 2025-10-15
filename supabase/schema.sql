-- TEAM TRACKER DATABASE SCHEMA
-- Run this in your Supabase SQL Editor to create all tables

-- Create people table
create table if not exists people (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text,
  email text unique,
  skills text[],
  notes text,
  created_at timestamptz default now()
);

-- Create projects table
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  status text check (status in ('planned', 'active', 'paused', 'complete')) default 'planned',
  start_date date,
  end_date date,
  created_at timestamptz default now()
);

-- Create assignments table (links people to projects)
create table if not exists assignments (
  id uuid primary key default gen_random_uuid(),
  person_id uuid references people(id) on delete cascade,
  project_id uuid references projects(id) on delete cascade,
  role text,
  percent numeric check (percent >= 0 and percent <= 100),
  start_date date,
  end_date date,
  notes text,
  created_at timestamptz default now()
);

-- Create project_notes table
create table if not exists project_notes (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  person_id uuid references people(id) on delete set null,
  content text not null,
  created_at timestamptz default now()
);

-- Enable Row-Level Security (RLS)
-- For now, we'll allow all operations. You can restrict this later.
alter table people enable row level security;
alter table projects enable row level security;
alter table assignments enable row level security;
alter table project_notes enable row level security;

-- Create policies to allow all operations (you can make these more restrictive later)
create policy "Allow all operations on people" on people for all using (true) with check (true);
create policy "Allow all operations on projects" on projects for all using (true) with check (true);
create policy "Allow all operations on assignments" on assignments for all using (true) with check (true);
create policy "Allow all operations on project_notes" on project_notes for all using (true) with check (true);

-- Create indexes for better query performance
create index if not exists idx_assignments_person_id on assignments(person_id);
create index if not exists idx_assignments_project_id on assignments(project_id);
create index if not exists idx_project_notes_project_id on project_notes(project_id);
create index if not exists idx_project_notes_person_id on project_notes(person_id);

-- Insert some sample data (optional - remove if you don't want sample data)
insert into people (name, role, email, skills, notes) values
  ('John Doe', 'Developer', 'john@example.com', ARRAY['JavaScript', 'React', 'Node.js'], 'Senior developer with 5 years experience'),
  ('Jane Smith', 'Designer', 'jane@example.com', ARRAY['Figma', 'Photoshop', 'UI/UX'], 'Creative designer'),
  ('Bob Johnson', 'Project Manager', 'bob@example.com', ARRAY['Agile', 'Scrum', 'Leadership'], 'Experienced PM')
on conflict do nothing;

insert into projects (name, description, status, start_date, end_date) values
  ('Website Redesign', 'Complete redesign of company website', 'active', '2025-01-01', '2025-03-31'),
  ('Mobile App', 'New mobile application for customers', 'planned', '2025-02-01', '2025-06-30'),
  ('Database Migration', 'Migrate to new database system', 'active', '2025-01-15', '2025-02-28')
on conflict do nothing;
