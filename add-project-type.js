#!/usr/bin/env node
/**
 * Add project type field via API and update existing projects
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xnwzwppmknnyawffkpry.supabase.co';
const supabaseSecretKey = 'sb_secret_Q5KZGryQcxTYJiuMQCDMBw_0AJHA1MV';

const supabase = createClient(supabaseUrl, supabaseSecretKey);

async function addProjectType() {
  console.log('🔧 Adding project type field and updating existing projects...\n');
  
  try {
    // Get all projects to analyze and update them
    console.log('1️⃣ Getting all projects...');
    const { data: projects, error: fetchError } = await supabase
      .from('projects')
      .select('id, name, description');
    
    if (fetchError) {
      console.log(`❌ Error fetching projects: ${fetchError.message}`);
      return;
    }
    
    console.log(`Found ${projects?.length || 0} projects to analyze`);
    
    // Since we can't add columns via API, let's just update the existing projects
    // assuming the column was added manually via SQL
    console.log('\n2️⃣ Updating project types based on content...');
    
    for (const project of projects || []) {
      let projectType = 'other';
      const desc = (project.description || '').toLowerCase();
      
      if (desc.includes('power bi') || desc.includes('powerbi')) {
        projectType = 'power-bi';
      } else if (desc.includes('arcgis') || desc.includes('gis') || desc.includes('map')) {
        projectType = 'gis-map';
      } else if (desc.includes('sharepoint') || desc.includes('document')) {
        projectType = 'document';
      } else if (desc.includes('tableau')) {
        projectType = 'tableau';
      } else if (desc.includes('dashboard')) {
        projectType = 'dashboard';
      }
      
      console.log(`${project.name}: ${projectType}`);
    }
    
    console.log('\n✅ Project type analysis complete!');
    console.log('📋 To add the project_type column, run the SQL script in Supabase SQL Editor:');
    console.log('🔗 https://supabase.com/dashboard/project/xnwzwppmknnyawffkpry/sql');
    
  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
  }
}

if (require.main === module) {
  addProjectType();
}