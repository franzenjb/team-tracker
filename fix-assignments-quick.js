#!/usr/bin/env node
/**
 * Quick fix for assignments - assign to Bob Burris
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xnwzwppmknnyawffkpry.supabase.co';
const supabaseSecretKey = 'sb_secret_Q5KZGryQcxTYJiuMQCDMBw_0AJHA1MV';

const supabase = createClient(supabaseUrl, supabaseSecretKey);

async function quickFixAssignments() {
  console.log('🔧 Quick fix: Assigning work to Bob Burris...\n');
  
  try {
    // Get Bob's ID
    const { data: bob } = await supabase
      .from('people')
      .select('id, name')
      .eq('email', 'bob.burris@redcross.org')
      .single();
    
    if (!bob) {
      console.log('❌ Bob not found');
      return;
    }
    
    console.log(`✅ Found: ${bob.name} (${bob.id})`);
    
    // Update all assignments to Bob with proper work details
    const { data: updated, error } = await supabase
      .from('assignments')
      .update({
        person_id: bob.id,
        role: 'Power BI Developer',
        notes: 'Update hurricane planning dashboard with 2025 data and shelter capacity information'
      })
      .select();
    
    if (error) {
      console.log(`❌ Error: ${error.message}`);
    } else {
      console.log(`✅ Updated ${updated?.length || 0} assignments`);
    }
    
    // Test the results
    const { data: test } = await supabase
      .from('assignments')
      .select(`
        id,
        role,
        notes,
        people:person_id(name),
        projects:project_id(name)
      `);
    
    console.log('\n📋 Current assignments:');
    test?.forEach((a, i) => {
      console.log(`  ${i+1}. ${a.people?.name} working on ${a.projects?.name}`);
      console.log(`      Role: ${a.role}`);
      console.log(`      Task: ${a.notes}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Fix failed:', error.message);
  }
}

if (require.main === module) {
  quickFixAssignments();
}