import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: join(__dirname, '.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function createAssignment() {
  // Get Jim Manson's person ID
  const { data: people } = await supabase
    .from('people')
    .select('id, name')
    .eq('name', 'Jim Manson')
    .single()

  if (!people) {
    console.error('Jim Manson not found!')
    return
  }

  console.log(`Found person: ${people.name} (${people.id})`)

  // Get Volunteer Recruitment project ID
  const { data: project } = await supabase
    .from('projects')
    .select('id, name')
    .ilike('name', '%Volunteer Recruitment%')
    .single()

  if (!project) {
    console.error('Volunteer Recruitment project not found!')
    return
  }

  console.log(`Found project: ${project.name} (${project.id})`)

  // Create the assignment
  const { data: assignment, error } = await supabase
    .from('assignments')
    .insert([
      {
        person_id: people.id,
        project_id: project.id,
        title: 'Volunteer recruitment and onboarding coordination',
        description: 'Track volunteer engagement and onboarding processes',
        status: 'pending',
        priority: 'medium',
        role: 'Project Coordinator',
        notes: 'Initial setup for volunteer recruitment tracking'
      }
    ])
    .select()

  if (error) {
    console.error('Error creating assignment:', error)
    return
  }

  console.log('\n✅ Assignment created successfully!')
  console.log('Assignment ID:', assignment[0].id)
}

createAssignment()
