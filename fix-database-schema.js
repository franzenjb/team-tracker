#!/usr/bin/env node
/**
 * Fix database schema by adding missing enhanced fields
 */

const { createClient } = require('@supabase/supabase-js');

// Working API keys
const supabaseUrl = 'https://xnwzwppmknnyawffkpry.supabase.co';
const supabaseSecretKey = 'sb_secret_Q5KZGryQcxTYJiuMQCDMBw_0AJHA1MV';

const supabase = createClient(supabaseUrl, supabaseSecretKey);

async function fixDatabaseSchema() {
  console.log('🔧 Fixing database schema for enhanced assignments...\n');
  
  try {
    // Since we can't run DDL through the API, let's try adding the fields one by one
    console.log('1️⃣ Attempting to add enhanced fields via SQL...');
    
    // Try using the SQL endpoint if available
    const sqlCommands = [
      'ALTER TABLE assignments ADD COLUMN IF NOT EXISTS title text;',
      'ALTER TABLE assignments ADD COLUMN IF NOT EXISTS description text;',
      'ALTER TABLE assignments ADD COLUMN IF NOT EXISTS status text DEFAULT \'pending\';',
      'ALTER TABLE assignments ADD COLUMN IF NOT EXISTS priority text DEFAULT \'medium\';',
      'ALTER TABLE assignments ADD COLUMN IF NOT EXISTS due_date date;',
      'ALTER TABLE assignments ADD COLUMN IF NOT EXISTS requester text;'
    ];
    
    console.log('📝 SQL Commands needed (run these in Supabase SQL Editor):');
    sqlCommands.forEach(cmd => console.log(`  ${cmd}`));
    
    console.log('\n🔗 Go to: https://supabase.com/dashboard/project/xnwzwppmknnyawffkpry/sql');
    console.log('📋 Copy and paste the SQL commands above');
    
    // Let's also fix the current assignments to have proper data
    console.log('\n2️⃣ Checking current assignments...');
    const { data: assignments } = await supabase
      .from('assignments')
      .select('*');
    
    console.log(`Found ${assignments?.length || 0} assignments to update`);
    
    // For now, let's work with the existing schema and update the data
    console.log('\n3️⃣ Updating existing assignments with better data...');
    
    if (assignments && assignments.length > 0) {
      for (const assignment of assignments) {
        const updateData = {
          role: assignment.role || 'Power BI Developer',
          notes: assignment.notes || 'Update: Hurricane planning dashboard with 2025 data'
        };
        
        const { error } = await supabase
          .from('assignments')
          .update(updateData)
          .eq('id', assignment.id);
        
        if (error) {
          console.log(`❌ Error updating assignment ${assignment.id}:`, error.message);
        } else {
          console.log(`✅ Updated assignment ${assignment.id}`);
        }
      }
    }
    
    console.log('\n4️⃣ Testing assignment-people relationships...');
    const { data: assignmentsWithPeople, error: queryError } = await supabase
      .from('assignments')
      .select(`
        id,
        person_id,
        project_id,
        role,
        notes,
        people:person_id(name, email),
        projects:project_id(name)
      `);
    
    if (queryError) {
      console.log('❌ Query error:', queryError.message);
    } else {
      console.log('✅ Assignment relationships:');
      assignmentsWithPeople?.forEach((a, i) => {
        console.log(`  ${i+1}. ${a.people?.name || 'UNKNOWN'} → ${a.projects?.name || 'UNKNOWN'}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Schema fix failed:', error.message);
  }
}

if (require.main === module) {
  fixDatabaseSchema();
}

module.exports = { fixDatabaseSchema };