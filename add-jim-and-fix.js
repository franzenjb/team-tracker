#!/usr/bin/env node
/**
 * Add Jim Manson to database and fix assignments properly
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xnwzwppmknnyawffkpry.supabase.co';
const supabaseSecretKey = 'sb_secret_Q5KZGryQcxTYJiuMQCDMBw_0AJHA1MV';

const supabase = createClient(supabaseUrl, supabaseSecretKey);

async function addJimAndFix() {
  console.log('🔧 Adding Jim Manson and fixing assignments...\n');
  
  try {
    // 1. Add Jim Manson to the database
    console.log('1️⃣ Adding Jim Manson to people table...');
    const { data: jim, error: jimError } = await supabase
      .from('people')
      .insert({
        name: 'Jim Manson',
        email: 'jim.manson@redcross.org',
        role: 'Manager',
        skills: 'Project Management, Power BI, Data Analytics',
        contact_info: 'Main contact for I&P projects'
      })
      .select()
      .single();
    
    if (jimError && !jimError.message.includes('duplicate')) {
      console.log(`❌ Error adding Jim: ${jimError.message}`);
      return;
    }
    
    let jimId;
    if (jim) {
      jimId = jim.id;
      console.log(`✅ Added Jim Manson (${jimId})`);
    } else {
      // Jim might already exist, find him
      const { data: existingJim } = await supabase
        .from('people')
        .select('id, name')
        .ilike('name', '%jim%manson%')
        .single();
      
      if (existingJim) {
        jimId = existingJim.id;
        console.log(`✅ Found existing Jim Manson (${jimId})`);
      } else {
        console.log('❌ Could not find or create Jim Manson');
        return;
      }
    }
    
    // 2. Get all assignments and fix them
    console.log('\n2️⃣ Fixing assignment relationships...');
    const { data: assignments } = await supabase
      .from('assignments')
      .select('id, person_id, project_id');
    
    console.log(`Found ${assignments?.length || 0} assignments to fix`);
    
    // Fix each assignment individually
    for (const assignment of assignments || []) {
      const { error: updateError } = await supabase
        .from('assignments')
        .update({ 
          person_id: jimId,
          role: 'Power BI Developer',
          notes: 'Hurricane planning dashboard update - 2025 data refresh required'
        })
        .eq('id', assignment.id);
      
      if (updateError) {
        console.log(`❌ Error updating ${assignment.id}: ${updateError.message}`);
      } else {
        console.log(`✅ Fixed assignment ${assignment.id}`);
      }
    }
    
    // 3. Test the final result
    console.log('\n3️⃣ Testing final assignments...');
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
    console.error('❌ Complete failure:', error.message);
  }
}

if (require.main === module) {
  addJimAndFix();
}