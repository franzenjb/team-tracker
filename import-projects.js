#!/usr/bin/env node
/**
 * Import Jim's I&P Projects from CSV with enhanced schema
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Team Tracker Supabase credentials
const supabaseUrl = 'https://xnwzwppmknnyawffkpry.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhud3p3cHBta25ueWF3ZmZrcHJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkzNDA3NjQsImV4cCI6MjA0NDkxNjc2NH0.ZhgGKa8xSb9w23wnXKhZUkexJEfDPwWTJYnXYfHrzDw';

const supabase = createClient(supabaseUrl, supabaseKey);

// Parse CSV data manually (avoiding external dependencies)
function parseCSV(csvText) {
  const lines = csvText.split('\n');
  const projects = [];
  
  // Skip header lines (lines 0-1 are metadata, line 2 is headers)
  for (let i = 3; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Split by comma but handle quoted values
    const fields = [];
    let current = '';
    let inQuotes = false;
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        fields.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    fields.push(current); // Add the last field
    
    if (fields.length >= 9) {
      projects.push({
        project_type: fields[0]?.replace(/"/g, '') || 'Power BI',
        name: fields[1]?.replace(/"/g, '') || 'Untitled Project',
        project_data: fields[2]?.replace(/"/g, '') || null,
        developer: fields[3]?.replace(/"/g, '') || null,
        project_created: fields[4]?.replace(/"/g, '') || null,
        description_tags: fields[5]?.replace(/"/g, '') || null,
        project_description: fields[6]?.replace(/"/g, '') || null,
        power_bi_link: fields[7]?.replace(/"/g, '') || null,
        workspace: fields[8]?.replace(/"/g, '') || null
      });
    }
  }
  
  return projects;
}

async function enhanceProjectsTable() {
  console.log('🔧 Enhancing projects table schema...\n');
  
  // First, let's try to add new columns to the existing projects table
  try {
    // Note: We can't easily modify existing tables via API, so we'll work with what we have
    // and add the data in a way that fits the current schema
    
    console.log('✅ Using existing projects table structure');
    console.log('📝 Will map CSV fields to existing schema');
    
  } catch (error) {
    console.log('⚠️ Table enhancement:', error.message);
  }
}

async function importProjects() {
  console.log('📊 Importing Jim\'s I&P Projects...\n');
  
  try {
    // Read the CSV file
    const csvPath = '/Users/jefffranzen/Desktop/JIM/I&P Projects.csv';
    const csvData = fs.readFileSync(csvPath, 'utf-8');
    
    // Parse the CSV
    const projects = parseCSV(csvData);
    console.log(`📋 Found ${projects.length} projects to import`);
    
    // Clear existing projects first (except our test project)
    console.log('🗑️ Clearing existing projects...');
    const { error: deleteError } = await supabase
      .from('projects')
      .delete()
      .neq('name', 'Website Redesign'); // Keep the test project
    
    if (deleteError) {
      console.log('Delete warning:', deleteError.message);
    }
    
    // Import projects in batches
    const batchSize = 10;
    let imported = 0;
    
    for (let i = 0; i < projects.length; i += batchSize) {
      const batch = projects.slice(i, i + batchSize);
      
      // Map CSV fields to our current schema
      const projectsToInsert = batch.map(project => ({
        name: project.name,
        description: [
          project.project_description,
          project.description_tags,
          project.developer ? `Developer: ${project.developer}` : null,
          project.workspace ? `Workspace: ${project.workspace}` : null,
          project.power_bi_link ? `Link: ${project.power_bi_link}` : null
        ].filter(Boolean).join(' | '),
        status: 'active', // Assume all imported projects are active
        start_date: null, // CSV doesn't have start dates
        end_date: null    // CSV doesn't have end dates
      }));
      
      const { data, error } = await supabase
        .from('projects')
        .insert(projectsToInsert)
        .select();
      
      if (error) {
        console.log(`❌ Batch ${Math.floor(i/batchSize) + 1} error:`, error.message);
      } else {
        imported += data.length;
        console.log(`✅ Imported batch ${Math.floor(i/batchSize) + 1}: ${data.length} projects`);
      }
    }
    
    console.log(`\n🎉 Successfully imported ${imported} projects!`);
    
    // Show summary
    const { data: allProjects, error: countError } = await supabase
      .from('projects')
      .select('*');
    
    if (!countError) {
      console.log(`📊 Total projects in database: ${allProjects.length}`);
      console.log('\n📋 Sample projects:');
      allProjects.slice(0, 5).forEach(project => {
        console.log(`  • ${project.name}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Import failed:', error.message);
  }
}

async function main() {
  console.log('🚀 Starting I&P Projects import...\n');
  
  await enhanceProjectsTable();
  await importProjects();
  
  console.log('\n✅ Import complete!');
  console.log('🔗 Check your app: https://team-tracker-odx44isun-jbf-2539-e1ec6bfb.vercel.app/projects');
}

if (require.main === module) {
  main();
}

module.exports = { importProjects };