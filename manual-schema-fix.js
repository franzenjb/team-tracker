#!/usr/bin/env node
/**
 * Manual fix for assignment relationships and testing
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xnwzwppmknnyawffkpry.supabase.co';
const supabaseSecretKey = 'sb_secret_Q5KZGryQcxTYJiuMQCDMBw_0AJHA1MV';

const supabase = createClient(supabaseUrl, supabaseSecretKey);

async function fixAssignmentRelationships() {
  console.log('🔧 Fixing assignment-people relationships...\n');
  
  try {
    // 1. Get Jim Manson's ID
    console.log('1️⃣ Finding Jim Manson...');
    const { data: people } = await supabase
      .from('people')
      .select('id, name, email')
      .ilike('name', '%jim%manson%');
    
    if (!people || people.length === 0) {
      console.log('❌ Jim Manson not found. Let me check all people...');
      const { data: allPeople } = await supabase
        .from('people')
        .select('id, name, email')
        .limit(10);
      
      console.log('Available people:');
      allPeople?.forEach(p => console.log(`  - ${p.name} (${p.email})`));
      return;
    }
    
    const jimId = people[0].id;
    console.log(`✅ Found Jim: ${people[0].name} (${jimId})`);
    
    // 2. Update assignments to link to Jim
    console.log('\n2️⃣ Updating assignments to link to Jim...');
    const { data: assignments } = await supabase
      .from('assignments')
      .select('id, person_id, project_id, role');
    
    console.log(`Found ${assignments?.length || 0} assignments`);
    
    for (const assignment of assignments || []) {
      if (!assignment.person_id || assignment.person_id === 'null') {
        console.log(`Updating assignment ${assignment.id}...`);
        const { error } = await supabase
          .from('assignments')
          .update({ person_id: jimId })
          .eq('id', assignment.id);
        
        if (error) {
          console.log(`❌ Error: ${error.message}`);
        } else {
          console.log(`✅ Linked assignment to Jim`);
        }
      }
    }
    
    // 3. Test the relationships
    console.log('\n3️⃣ Testing updated relationships...');
    const { data: updatedAssignments, error } = await supabase
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
    
    if (error) {
      console.log(`❌ Query error: ${error.message}`);
    } else {
      console.log('✅ Updated assignment relationships:');
      updatedAssignments?.forEach((a, i) => {
        console.log(`  ${i+1}. ${a.people?.name || 'UNKNOWN'} → ${a.projects?.name || 'UNKNOWN'}`);
        console.log(`      Role: ${a.role || 'Not specified'}`);
        console.log(`      Notes: ${a.notes || 'None'}`);
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('❌ Fix failed:', error.message);
  }
}

if (require.main === module) {
  fixAssignmentRelationships();
}

module.exports = { fixAssignmentRelationships };