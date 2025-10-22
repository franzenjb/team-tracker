#!/usr/bin/env node
/**
 * Check actual database schema
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xnwzwppmknnyawffkpry.supabase.co';
const supabaseSecretKey = 'sb_secret_Q5KZGryQcxTYJiuMQCDMBw_0AJHA1MV';

const supabase = createClient(supabaseUrl, supabaseSecretKey);

async function checkSchema() {
  console.log('🔍 Checking database schema...\n');
  
  try {
    // Check people table structure
    console.log('1️⃣ Checking people table...');
    const { data: samplePerson, error: personError } = await supabase
      .from('people')
      .select('*')
      .limit(1)
      .single();
    
    if (personError) {
      console.log(`Error: ${personError.message}`);
    } else {
      console.log('People table columns:', Object.keys(samplePerson || {}));
    }
    
    // Check assignments table structure  
    console.log('\n2️⃣ Checking assignments table...');
    const { data: sampleAssignment, error: assignmentError } = await supabase
      .from('assignments')
      .select('*')
      .limit(1)
      .single();
    
    if (assignmentError) {
      console.log(`Error: ${assignmentError.message}`);
    } else {
      console.log('Assignments table columns:', Object.keys(sampleAssignment || {}));
    }
    
    // Check projects table structure
    console.log('\n3️⃣ Checking projects table...');
    const { data: sampleProject, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .limit(1)
      .single();
    
    if (projectError) {
      console.log(`Error: ${projectError.message}`);
    } else {
      console.log('Projects table columns:', Object.keys(sampleProject || {}));
    }
    
  } catch (error) {
    console.error('❌ Schema check failed:', error.message);
  }
}

if (require.main === module) {
  checkSchema();
}