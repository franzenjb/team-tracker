import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: join(__dirname, '.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function checkAssignments() {
  console.log('Checking all assignments in database...\n')

  // Get all assignments
  const { data: assignments, error } = await supabase
    .from('assignments')
    .select(`
      *,
      people:person_id(name, email),
      projects:project_id(name)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error:', error)
    return
  }

  console.log(`Found ${assignments.length} total assignments:\n`)

  assignments.forEach((a, i) => {
    console.log(`${i + 1}. ${a.people?.name || 'Unknown'} → ${a.projects?.name || 'Unknown'}`)
    console.log(`   Status: ${a.status || 'none'}`)
    console.log(`   Title: ${a.title || 'none'}`)
    console.log(`   Created: ${a.created_at}`)
    console.log('')
  })

  // Check for volunteer recruitment specifically
  const volunteerAssignments = assignments.filter(a =>
    a.projects?.name?.toLowerCase().includes('volunteer') ||
    a.projects?.name?.toLowerCase().includes('recruitment')
  )

  if (volunteerAssignments.length > 0) {
    console.log(`\n✅ Found ${volunteerAssignments.length} volunteer recruitment assignment(s)!`)
  } else {
    console.log('\n❌ No volunteer recruitment assignments found.')
  }
}

checkAssignments()
