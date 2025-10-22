#!/usr/bin/env node
/**
 * Complete I&P Data Import - All Three CSV Files
 * Merges: Team Members + Projects + Project Requests
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Team Tracker Supabase credentials - WORKING KEYS
const supabaseUrl = 'https://xnwzwppmknnyawffkpry.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhud3p3cHBta25ueWF3ZmZrcHJ5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDQ4OTU1OSwiZXhwIjoyMDc2MDY1NTU5fQ.TlIAqsKeFlJTJi4wVrzQBOlTR9cGdBpv6cuLavTRu_s';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Parse CSV helper
function parseCSV(csvText, skipLines = 2) {
  const lines = csvText.split('\n');
  const results = [];
  
  for (let i = skipLines; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const fields = [];
    let current = '';
    let inQuotes = false;
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        fields.push(current.replace(/"/g, ''));
        current = '';
      } else {
        current += char;
      }
    }
    fields.push(current.replace(/"/g, ''));
    
    if (fields.length > 1 && fields[0]) {
      results.push(fields);
    }
  }
  
  return results;
}

async function enhanceDatabase() {
  console.log('🔧 Enhancing database schema...\n');
  
  try {
    // Create enhanced projects table with Power BI fields
    console.log('📊 Creating enhanced projects table...');
    const { error: projectsError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Drop existing projects table to recreate with enhanced schema
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
      `
    });
    
    if (projectsError) {
      console.log('Projects table enhancement:', projectsError.message);
    } else {
      console.log('✅ Enhanced projects table created');
    }
    
    // Create enhanced people table
    console.log('👥 Enhancing people table...');
    const { error: peopleError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Add new columns to people table
        ALTER TABLE people 
        ADD COLUMN IF NOT EXISTS phone text,
        ADD COLUMN IF NOT EXISTS red_cross_email text,
        ADD COLUMN IF NOT EXISTS powerbi_access text,
        ADD COLUMN IF NOT EXISTS arcgis_access text,
        ADD COLUMN IF NOT EXISTS mentor1 text,
        ADD COLUMN IF NOT EXISTS mentor2 text,
        ADD COLUMN IF NOT EXISTS power_bi_yn text,
        ADD COLUMN IF NOT EXISTS gis_yn text;
      `
    });
    
    if (peopleError) {
      console.log('People table enhancement:', peopleError.message);
    } else {
      console.log('✅ Enhanced people table with new fields');
    }
    
    // Create enhanced assignments table (already has enhanced fields)
    console.log('📋 Ensuring assignments table has enhanced fields...');
    const { error: assignmentsError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Ensure assignments table has all enhanced fields
        ALTER TABLE assignments 
        ADD COLUMN IF NOT EXISTS title text,
        ADD COLUMN IF NOT EXISTS description text,
        ADD COLUMN IF NOT EXISTS status text CHECK (status IN ('pending', 'in_progress', 'complete', 'on_hold')) DEFAULT 'pending',
        ADD COLUMN IF NOT EXISTS priority text CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
        ADD COLUMN IF NOT EXISTS due_date date,
        ADD COLUMN IF NOT EXISTS requester text;
        
        -- Create indexes
        CREATE INDEX IF NOT EXISTS idx_assignments_status ON assignments(status);
        CREATE INDEX IF NOT EXISTS idx_assignments_priority ON assignments(priority);
      `
    });
    
    if (assignmentsError) {
      console.log('Assignments table enhancement:', assignmentsError.message);
    } else {
      console.log('✅ Enhanced assignments table confirmed');
    }
    
  } catch (error) {
    console.error('❌ Database enhancement failed:', error.message);
  }
}

async function importTeamMembers() {
  console.log('\n👥 Importing enhanced team members...');
  
  try {
    const csvData = fs.readFileSync('/Users/jefffranzen/Desktop/JIM/IP Team Members.csv', 'utf-8');
    const rows = parseCSV(csvData);
    
    console.log(`📋 Found ${rows.length} team members to import`);
    
    // Clear existing people
    const { error: deleteError } = await supabase
      .from('people')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    
    if (deleteError) {
      console.log('Clear people warning:', deleteError.message);
    }
    
    const peopleToInsert = rows.map(row => ({
      name: row[0] || 'Unknown',
      email: row[1] || null,
      notes: row[2] || null,
      power_bi_yn: row[3] || null,
      gis_yn: row[4] || null,
      red_cross_email: row[5] || null,
      powerbi_access: row[6] || null,
      arcgis_access: row[7] || null,
      mentor1: row[8] || null,
      mentor2: row[9] || null,
      phone: row[10] || null,
      // Map skills based on Power BI and GIS columns
      skills: [
        row[3] && row[3].toLowerCase().includes('y') ? 'Power BI' : null,
        row[4] && row[4].toLowerCase().includes('y') ? 'GIS' : null,
        row[4] && row[4].toLowerCase().includes('arcgis') ? 'GIS' : null,
        row[3] && row[3].toLowerCase().includes('powerbi') ? 'Power BI' : null
      ].filter(Boolean),
      // Set role based on skills
      role: (() => {
        const skills = [];
        if (row[3] && (row[3].toLowerCase().includes('y') || row[3].toLowerCase().includes('powerbi'))) skills.push('Power BI');
        if (row[4] && (row[4].toLowerCase().includes('y') || row[4].toLowerCase().includes('gis') || row[4].toLowerCase().includes('arcgis'))) skills.push('GIS');
        return skills.join(', ') || 'I&P Team Member';
      })()
    }));
    
    const { data, error } = await supabase
      .from('people')
      .insert(peopleToInsert)
      .select();
    
    if (error) {
      console.log('❌ Team members import error:', error.message);
    } else {
      console.log(`✅ Imported ${data.length} team members`);
    }
    
  } catch (error) {
    console.error('❌ Team members import failed:', error.message);
  }
}

async function importProjects() {
  console.log('\n📊 Importing I&P projects...');
  
  try {
    const csvData = fs.readFileSync('/Users/jefffranzen/Desktop/JIM/I&P Projects.csv', 'utf-8');
    const rows = parseCSV(csvData);
    
    console.log(`📋 Found ${rows.length} projects to import`);
    
    const projectsToInsert = rows.map(row => ({
      project_type: row[0] || 'Power BI',
      name: row[1] || 'Untitled Project',
      project_data: row[2] || null,
      developer: row[3] || null,
      description_tags: row[5] || null,
      description: row[6] || null,
      power_bi_link: row[7] || null,
      workspace: row[8] || null,
      status: 'active'
    }));
    
    const { data, error } = await supabase
      .from('projects')
      .insert(projectsToInsert)
      .select();
    
    if (error) {
      console.log('❌ Projects import error:', error.message);
    } else {
      console.log(`✅ Imported ${data.length} projects`);
    }
    
  } catch (error) {
    console.error('❌ Projects import failed:', error.message);
  }
}

async function importProjectRequests() {
  console.log('\n📋 Importing project requests as assignments...');
  
  try {
    const csvData = fs.readFileSync('/Users/jefffranzen/Desktop/JIM/I&P Project Request.csv', 'utf-8');
    const rows = parseCSV(csvData);
    
    console.log(`📋 Found ${rows.length} project requests to import`);
    
    // Get Jim Manson's ID
    const { data: jimData } = await supabase
      .from('people')
      .select('id')
      .eq('name', 'Jim Manson')
      .single();
    
    // Get projects for linking
    const { data: projectsData } = await supabase
      .from('projects')
      .select('id, name');
    
    const assignmentsToInsert = rows.map(row => {
      const projectName = row[2];
      const matchingProject = projectsData?.find(p => p.name.includes(projectName)) || projectsData?.[0];
      
      return {
        person_id: jimData?.id || null,
        project_id: matchingProject?.id || null,
        title: `Update: ${projectName}`,
        description: row[3] || 'Project update request',
        requester: row[0] || 'Jim Manson',
        status: 'pending',
        priority: 'medium',
        role: 'Power BI Developer',
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };
    });
    
    const { data, error } = await supabase
      .from('assignments')
      .insert(assignmentsToInsert)
      .select();
    
    if (error) {
      console.log('❌ Project requests import error:', error.message);
    } else {
      console.log(`✅ Imported ${data.length} project requests as assignments`);
    }
    
  } catch (error) {
    console.error('❌ Project requests import failed:', error.message);
  }
}

async function showSummary() {
  console.log('\n📊 Import Summary:');
  
  try {
    const { data: people } = await supabase.from('people').select('*');
    const { data: projects } = await supabase.from('projects').select('*');
    const { data: assignments } = await supabase.from('assignments').select('*');
    
    console.log(`👥 People: ${people?.length || 0}`);
    console.log(`📊 Projects: ${projects?.length || 0}`);
    console.log(`📋 Assignments: ${assignments?.length || 0}`);
    
    console.log('\n📋 Sample Projects:');
    projects?.slice(0, 5).forEach(p => console.log(`  • ${p.name}`));
    
    console.log('\n👥 Sample Team Members:');
    people?.slice(0, 5).forEach(p => console.log(`  • ${p.name} (${p.role})`));
    
  } catch (error) {
    console.error('❌ Summary failed:', error.message);
  }
}

async function main() {
  console.log('🚀 Starting Complete I&P Data Import...\n');
  
  await enhanceDatabase();
  await importTeamMembers();
  await importProjects();
  await importProjectRequests();
  await showSummary();
  
  console.log('\n🎉 Complete data import finished!');
  console.log('🔗 Check your app: https://team-tracker-odx44isun-jbf-2539-e1ec6bfb.vercel.app');
}

if (require.main === module) {
  main();
}

module.exports = { main };