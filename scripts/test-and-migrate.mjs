import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: join(__dirname, '../.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testAndMigrate() {
  console.log('Testing Supabase connection...')

  // Test connection
  const { data: projects, error: selectError } = await supabase
    .from('projects')
    .select('id, name')
    .limit(1)

  if (selectError) {
    console.error('❌ Connection failed:', selectError.message)
    process.exit(1)
  }

  console.log('✅ Connection successful!')
  console.log(`Found ${projects.length} project(s)`)

  // Check if project_type column exists
  const { data: checkData, error: checkError } = await supabase
    .from('projects')
    .select('project_type')
    .limit(1)

  if (!checkError) {
    console.log('✅ project_type column already exists!')
    return
  }

  console.log('Column does not exist. Error:', checkError.message)
  console.log('\n⚠️  I need to add the column via SQL.')
  console.log('\nPlease run this SQL in Supabase Dashboard:')
  console.log('https://supabase.com/dashboard/project/xnwzwppmknnyawffkpry/sql/new')
  console.log('\nSQL:')
  console.log('ALTER TABLE projects ADD COLUMN IF NOT EXISTS project_type TEXT CHECK (project_type IN (\'dashboard\', \'power-bi\', \'gis-map\', \'document\', \'tableau\', \'other\'));')
}

testAndMigrate()
