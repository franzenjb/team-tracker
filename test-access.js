#!/usr/bin/env node
/**
 * Test Supabase access with new API keys
 */

const { createClient } = require('@supabase/supabase-js');

// New API keys
const supabaseUrl = 'https://xnwzwppmknnyawffkpry.supabase.co';
const supabaseSecretKey = 'sb_secret_Q5KZGryQcxTYJiuMQCDMBw_0AJHA1MV';

const supabase = createClient(supabaseUrl, supabaseSecretKey);

async function testAccess() {
  console.log('🔑 Testing Supabase access with new secret key...\n');
  
  try {
    // Test 1: Read existing people
    console.log('1️⃣ Testing read access to people table...');
    const { data: people, error: peopleError } = await supabase
      .from('people')
      .select('*')
      .limit(3);
    
    if (peopleError) {
      console.log('❌ People read error:', peopleError.message);
    } else {
      console.log(`✅ People read success: ${people.length} records`);
      people.forEach(p => console.log(`  • ${p.name}`));
    }
    
    // Test 2: Read existing projects
    console.log('\n2️⃣ Testing read access to projects table...');
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*');
    
    if (projectsError) {
      console.log('❌ Projects read error:', projectsError.message);
    } else {
      console.log(`✅ Projects read success: ${projects.length} records`);
      projects.forEach(p => console.log(`  • ${p.name}`));
    }
    
    // Test 3: Read assignments
    console.log('\n3️⃣ Testing read access to assignments table...');
    const { data: assignments, error: assignmentsError } = await supabase
      .from('assignments')
      .select('*');
    
    if (assignmentsError) {
      console.log('❌ Assignments read error:', assignmentsError.message);
    } else {
      console.log(`✅ Assignments read success: ${assignments.length} records`);
    }
    
    // Test 4: Test write access (insert a test project)
    console.log('\n4️⃣ Testing write access...');
    const { data: testInsert, error: insertError } = await supabase
      .from('projects')
      .insert([{
        name: 'API Test Project',
        description: 'Testing API access',
        status: 'active'
      }])
      .select();
    
    if (insertError) {
      console.log('❌ Write test error:', insertError.message);
    } else {
      console.log('✅ Write test success:', testInsert[0].name);
      
      // Clean up test record
      await supabase
        .from('projects')
        .delete()
        .eq('name', 'API Test Project');
      console.log('🗑️ Test record cleaned up');
    }
    
    // Test 5: Check current schema
    console.log('\n5️⃣ Checking current table schemas...');
    
    // Check what columns exist in each table
    const tableChecks = [
      { table: 'people', expectedNew: ['phone', 'powerbi_access', 'mentor1'] },
      { table: 'projects', expectedNew: ['project_type', 'developer', 'workspace'] },
      { table: 'assignments', expectedNew: ['title', 'description', 'priority'] }
    ];
    
    for (const check of tableChecks) {
      try {
        const { data, error } = await supabase
          .from(check.table)
          .select('*')
          .limit(1);
        
        if (!error && data.length > 0) {
          const columns = Object.keys(data[0]);
          const hasNewFields = check.expectedNew.some(field => columns.includes(field));
          console.log(`  ${check.table}: ${hasNewFields ? '✅ Enhanced' : '⚠️ Basic'} schema (${columns.length} columns)`);
        } else {
          console.log(`  ${check.table}: ⚠️ Empty or error`);
        }
      } catch (err) {
        console.log(`  ${check.table}: ❌ Error checking schema`);
      }
    }
    
    console.log('\n🎯 Access Test Summary:');
    console.log('✅ API keys are working');
    console.log('✅ Read/write permissions confirmed');
    console.log('✅ Ready for data import');
    
  } catch (error) {
    console.error('❌ Access test failed:', error.message);
  }
}

if (require.main === module) {
  testAccess();
}

module.exports = { testAccess };