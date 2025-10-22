#!/usr/bin/env node
/**
 * Fix assignments now that Jim is in the database
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xnwzwppmknnyawffkpry.supabase.co';
const supabaseSecretKey = 'sb_secret_Q5KZGryQcxTYJiuMQCDMBw_0AJHA1MV';

const supabase = createClient(supabaseUrl, supabaseSecretKey);

async function fixWithJim() {
  console.log('🔧 Fixing assignments with Jim Manson...\n');
  
  try {
    // 1. Find Jim
    console.log('1️⃣ Finding Jim Manson...');
    const { data: jim, error: jimError } = await supabase
      .from('people')
      .select('id, name, email')
      .ilike('name', '%jim%')
      .single();
    
    if (jimError) {
      console.log(`❌ Error finding Jim: ${jimError.message}`);
      return;
    }
    
    console.log(`✅ Found: ${jim.name} (${jim.id})`);
    
    // 2. Get all assignments
    console.log('\n2️⃣ Getting all assignments...');
    const { data: assignments, error: assignError } = await supabase
      .from('assignments')
      .select('id, person_id, project_id, role, notes');
    
    if (assignError) {
      console.log(`❌ Error getting assignments: ${assignError.message}`);
      return;
    }
    
    console.log(`Found ${assignments?.length || 0} assignments`);
    
    // 3. Fix each assignment
    console.log('\n3️⃣ Updating assignments...');
    for (const assignment of assignments || []) {
      const { error: updateError } = await supabase
        .from('assignments')
        .update({ 
          person_id: jim.id,
          role: 'Power BI Developer',
          notes: 'Hurricane planning dashboard - update with 2025 shelter capacity and evacuation data'
        })
        .eq('id', assignment.id);
      
      if (updateError) {
        console.log(`❌ Error updating ${assignment.id}: ${updateError.message}`);
      } else {
        console.log(`✅ Updated assignment ${assignment.id}`);
      }
    }
    
    // 4. Test the results
    console.log('\n4️⃣ Testing updated assignments...');
    const { data: finalTest, error: testError } = await supabase
      .from('assignments')
      .select(`
        id,
        role,
        notes,
        people:person_id(name, email),
        projects:project_id(name)
      `);
    
    if (testError) {
      console.log(`❌ Test error: ${testError.message}`);
    } else {
      console.log('\n✅ FINAL ASSIGNMENTS:');
      finalTest?.forEach((a, i) => {
        console.log(`  ${i+1}. ${a.people?.name || 'ERROR'} working on ${a.projects?.name || 'ERROR'}`);
        console.log(`      Role: ${a.role || 'None'}`);
        console.log(`      Task: ${a.notes || 'None'}`);
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('❌ Fix failed:', error.message);
  }
}

if (require.main === module) {
  fixWithJim();
}