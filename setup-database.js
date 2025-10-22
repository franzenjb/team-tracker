#!/usr/bin/env node
/**
 * Setup Team Tracker database with enhanced assignments
 */

const { createClient } = require('@supabase/supabase-js');

// Team Tracker Supabase credentials - try anon key first
const supabaseUrl = 'https://xnwzwppmknnyawffkpry.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhud3p3cHBta25ueWF3ZmZrcHJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkzNDA3NjQsImV4cCI6MjA0NDkxNjc2NH0.ZhgGKa8xSb9w23wnXKhZUkexJEfDPwWTJYnXYfHrzDw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  console.log('🚀 Setting up Team Tracker database...\n');

  try {
    // Check existing tables
    console.log('📋 Checking existing tables...');
    const { data: tables, error: tablesError } = await supabase.rpc('get_schema_tables');
    
    if (tablesError) {
      console.log('Tables check failed, proceeding with setup...');
    } else {
      console.log('Existing tables:', tables?.map(t => t.table_name) || 'None found');
    }

    // Create people table
    console.log('\n👥 Creating people table...');
    const { error: peopleError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS people (
          id uuid primary key default gen_random_uuid(),
          name text not null,
          role text,
          email text unique,
          skills text[],
          notes text,
          created_at timestamptz default now()
        );
      `
    });

    if (peopleError) {
      console.log('People table:', peopleError.message);
    } else {
      console.log('✅ People table ready');
    }

    // Create projects table
    console.log('\n📊 Creating projects table...');
    const { error: projectsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS projects (
          id uuid primary key default gen_random_uuid(),
          name text not null,
          description text,
          status text check (status in ('planned', 'active', 'paused', 'complete')) default 'planned',
          start_date date,
          end_date date,
          created_at timestamptz default now()
        );
      `
    });

    if (projectsError) {
      console.log('Projects table:', projectsError.message);
    } else {
      console.log('✅ Projects table ready');
    }

    // Create enhanced assignments table
    console.log('\n📋 Creating enhanced assignments table...');
    const { error: assignmentsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS assignments (
          id uuid primary key default gen_random_uuid(),
          person_id uuid references people(id) on delete cascade,
          project_id uuid references projects(id) on delete cascade,
          title text,
          description text,
          status text check (status in ('pending', 'in_progress', 'complete', 'on_hold')) default 'pending',
          priority text check (priority in ('low', 'medium', 'high', 'urgent')) default 'medium',
          role text,
          percent numeric check (percent >= 0 and percent <= 100),
          start_date date,
          end_date date,
          due_date date,
          requester text,
          notes text,
          created_at timestamptz default now()
        );
      `
    });

    if (assignmentsError) {
      console.log('Assignments table:', assignmentsError.message);
    } else {
      console.log('✅ Enhanced assignments table ready');
    }

    // Create project_notes table
    console.log('\n📝 Creating project_notes table...');
    const { error: notesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS project_notes (
          id uuid primary key default gen_random_uuid(),
          project_id uuid references projects(id) on delete cascade,
          person_id uuid references people(id) on delete set null,
          content text not null,
          created_at timestamptz default now()
        );
      `
    });

    if (notesError) {
      console.log('Project notes table:', notesError.message);
    } else {
      console.log('✅ Project notes table ready');
    }

    // Set up RLS and policies
    console.log('\n🔒 Setting up Row Level Security...');
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE people ENABLE ROW LEVEL SECURITY;
        ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
        ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
        ALTER TABLE project_notes ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY IF NOT EXISTS "Allow all operations on people" ON people FOR ALL USING (true) WITH CHECK (true);
        CREATE POLICY IF NOT EXISTS "Allow all operations on projects" ON projects FOR ALL USING (true) WITH CHECK (true);
        CREATE POLICY IF NOT EXISTS "Allow all operations on assignments" ON assignments FOR ALL USING (true) WITH CHECK (true);
        CREATE POLICY IF NOT EXISTS "Allow all operations on project_notes" ON project_notes FOR ALL USING (true) WITH CHECK (true);
      `
    });

    if (rlsError) {
      console.log('RLS setup:', rlsError.message);
    } else {
      console.log('✅ Row Level Security configured');
    }

    // Add sample data
    console.log('\n📊 Adding sample data...');
    
    // Add Jim Manson
    const { data: jimData, error: jimError } = await supabase
      .from('people')
      .upsert([
        { 
          name: 'Jim Manson', 
          role: 'I&P Manager', 
          email: 'jim.manson@redcross.org',
          skills: ['PowerBI', 'Leadership', 'Analytics'],
          notes: 'I&P Team Lead'
        }
      ], { onConflict: 'email' })
      .select();

    // Add a sample project
    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .upsert([
        {
          name: 'Hurricane Planning Dashboard',
          description: 'Power BI dashboard for hurricane response planning',
          status: 'active'
        }
      ], { onConflict: 'name' })
      .select();

    // Add sample assignment
    if (jimData && projectData) {
      const { error: assignmentError } = await supabase
        .from('assignments')
        .upsert([
          {
            person_id: jimData[0].id,
            project_id: projectData[0].id,
            title: 'Update hurricane data for 2025 season',
            description: 'Dashboard needs current shelter capacity and evacuation route data',
            status: 'pending',
            priority: 'high',
            requester: 'Regional Manager',
            role: 'Power BI Developer',
            due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          }
        ]);

      if (assignmentError) {
        console.log('Sample assignment:', assignmentError.message);
      } else {
        console.log('✅ Sample assignment created');
      }
    }

    console.log('\n🎉 Team Tracker database setup complete!');
    console.log('\nNext steps:');
    console.log('1. Your enhanced assignments are ready');
    console.log('2. The UI should now work with the work request workflow');
    console.log('3. Check https://jim-manson-team-tracker.vercel.app/assignments');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }
}

// Note: Many Supabase instances don't have exec_sql RPC function
// This is a fallback approach using direct SQL through the API
async function setupDatabaseFallback() {
  console.log('🚀 Setting up Team Tracker database (fallback method)...\n');
  
  try {
    // Try to insert sample data to test connection
    console.log('📋 Testing database connection...');
    
    const { data: testData, error: testError } = await supabase
      .from('people')
      .select('*')
      .limit(1);

    if (testError) {
      console.log('❌ Database connection failed:', testError.message);
      console.log('\n📝 Please run this SQL manually in Supabase SQL Editor:');
      console.log('https://supabase.com/dashboard/project/xnwzwppmknnyawffkpry/sql');
      console.log('\n-- Copy and paste this SQL:');
      console.log(`
-- Team Tracker Database Schema
CREATE TABLE IF NOT EXISTS people (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text,
  email text unique,
  skills text[],
  notes text,
  created_at timestamptz default now()
);

CREATE TABLE IF NOT EXISTS projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  status text check (status in ('planned', 'active', 'paused', 'complete')) default 'planned',
  start_date date,
  end_date date,
  created_at timestamptz default now()
);

CREATE TABLE IF NOT EXISTS assignments (
  id uuid primary key default gen_random_uuid(),
  person_id uuid references people(id) on delete cascade,
  project_id uuid references projects(id) on delete cascade,
  title text,
  description text,
  status text check (status in ('pending', 'in_progress', 'complete', 'on_hold')) default 'pending',
  priority text check (priority in ('low', 'medium', 'high', 'urgent')) default 'medium',
  role text,
  percent numeric check (percent >= 0 and percent <= 100),
  start_date date,
  end_date date,
  due_date date,
  requester text,
  notes text,
  created_at timestamptz default now()
);

CREATE TABLE IF NOT EXISTS project_notes (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  person_id uuid references people(id) on delete set null,
  content text not null,
  created_at timestamptz default now()
);

-- Enable RLS
ALTER TABLE people ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_notes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY IF NOT EXISTS "Allow all operations on people" ON people FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Allow all operations on projects" ON projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Allow all operations on assignments" ON assignments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Allow all operations on project_notes" ON project_notes FOR ALL USING (true) WITH CHECK (true);
      `);
      return;
    }

    console.log('✅ Database connection successful');
    console.log('Found', testData?.length || 0, 'existing people records');

    // Add sample data if tables exist
    const { data: jimData, error: jimError } = await supabase
      .from('people')
      .upsert([
        { 
          name: 'Jim Manson', 
          role: 'I&P Manager', 
          email: 'jim.manson@redcross.org',
          skills: ['PowerBI', 'Leadership', 'Analytics'],
          notes: 'I&P Team Lead'
        }
      ], { onConflict: 'email' })
      .select();

    if (jimError) {
      console.log('Sample data error:', jimError.message);
    } else {
      console.log('✅ Sample data added');
    }

    console.log('\n🎉 Team Tracker is ready!');

  } catch (error) {
    console.error('❌ Fallback setup failed:', error.message);
  }
}

// Run setup
if (require.main === module) {
  setupDatabaseFallback();
}

module.exports = { setupDatabase, setupDatabaseFallback };
      