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

async function checkProjects() {
  console.log('Checking all projects in database...\n')

  const { data: projects, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    console.error('Error:', error)
    return
  }

  console.log(`Found ${projects.length} recent projects:\n`)

  projects.forEach((p, i) => {
    console.log(`${i + 1}. ${p.name}`)
    console.log(`   Type: ${p.project_type || 'none'}`)
    console.log(`   Status: ${p.status}`)
    console.log(`   Created: ${p.created_at}`)
    console.log('')
  })

  // Check for volunteer recruitment specifically
  const volunteerProjects = projects.filter(p =>
    p.name?.toLowerCase().includes('volunteer') ||
    p.name?.toLowerCase().includes('recruitment')
  )

  if (volunteerProjects.length > 0) {
    console.log(`\n✅ Found ${volunteerProjects.length} volunteer recruitment project(s)!`)
    volunteerProjects.forEach(p => {
      console.log(`   ID: ${p.id}`)
      console.log(`   Name: ${p.name}`)
    })
  } else {
    console.log('\n❌ No volunteer recruitment projects found.')
  }
}

checkProjects()
