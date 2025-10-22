#!/usr/bin/env node
/**
 * Test current app functionality to identify issues
 */

const { createClient } = require('@supabase/supabase-js');

// Working API keys
const supabaseUrl = 'https://xnwzwppmknnyawffkpry.supabase.co';
const supabaseSecretKey = 'sb_secret_Q5KZGryQcxTYJiuMQCDMBw_0AJHA1MV';

const supabase = createClient(supabaseUrl, supabaseSecretKey);

async function testCurrentState() {
  console.log('🔍 Testing current Team Tracker functionality...\n');
  
  try {
    // Test 1: Check current assignments
    console.log('1️⃣ Testing assignments with person/project names...');
    const { data: assignments, error: assignmentsError } = await supabase
      .from('assignments')
      .select(`
        *,
        people(name, email),
        projects(name)
      `)
      .limit(5);
    
    if (assignmentsError) {
      console.log('❌ Assignments query error:', assignmentsError.message);
    } else {
      console.log(`✅ Found ${assignments.length} assignments`);
      assignments.forEach((a, i) => {
        console.log(`  ${i+1}. ${a.people?.name || 'UNKNOWN'} → ${a.projects?.name || 'UNKNOWN'}`);
        console.log(`     Title: ${a.title || 'No title'}`);
        console.log(`     Status: ${a.status || 'No status'}`);
      });
    }
    
    // Test 2: Check assignments table schema
    console.log('\n2️⃣ Checking assignments table schema...');
    const { data: sampleAssignment } = await supabase
      .from('assignments')
      .select('*')
      .limit(1);
    
    if (sampleAssignment && sampleAssignment.length > 0) {
      const columns = Object.keys(sampleAssignment[0]);
      console.log('✅ Assignment columns:', columns.join(', '));
      
      // Check for enhanced fields
      const enhancedFields = ['title', 'description', 'status', 'priority', 'due_date', 'requester'];
      const missingFields = enhancedFields.filter(field => !columns.includes(field));
      
      if (missingFields.length > 0) {
        console.log('⚠️ Missing enhanced fields:', missingFields.join(', '));
      } else {
        console.log('✅ All enhanced assignment fields present');
      }
    }
    
    // Test 3: Check people data
    console.log('\n3️⃣ Testing people data...');
    const { data: people } = await supabase
      .from('people')
      .select('*')
      .limit(5);
    
    console.log(`✅ Found ${people?.length || 0} people`);
    people?.forEach((p, i) => {
      console.log(`  ${i+1}. ${p.name} (${p.role || 'No role'}) - ${p.email || 'No email'}`);
    });
    
    // Test 4: Test assignment creation
    console.log('\n4️⃣ Testing assignment creation...');
    const testPersonId = people?.[0]?.id;
    const { data: projects } = await supabase.from('projects').select('*').limit(1);
    const testProjectId = projects?.[0]?.id;
    
    if (testPersonId && testProjectId) {
      const testAssignment = {
        person_id: testPersonId,
        project_id: testProjectId,
        title: 'TEST: Assignment functionality',
        description: 'Testing if assignment creation works',
        status: 'pending',
        priority: 'low',
        requester: 'Test Script',
        role: 'Tester'
      };
      
      const { data: newAssignment, error: createError } = await supabase
        .from('assignments')
        .insert([testAssignment])
        .select();
      
      if (createError) {
        console.log('❌ Assignment creation error:', createError.message);
        console.log('🔧 This suggests database schema issues');
      } else {
        console.log('✅ Assignment creation successful');
        
        // Clean up test assignment
        await supabase
          .from('assignments')
          .delete()
          .eq('id', newAssignment[0].id);
        console.log('🗑️ Test assignment cleaned up');
      }
    } else {
      console.log('⚠️ No people or projects found for testing');
    }
    
    console.log('\n📋 SUMMARY:');
    console.log('- Check assignment form saving issues');
    console.log('- Verify people editing works');
    console.log('- Test "Unknown" assignments display');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

if (require.main === module) {
  testCurrentState();
}

module.exports = { testCurrentState };