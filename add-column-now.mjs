import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://xnwzwppmknnyawffkpry.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhud3p3cHBta25ueWF3ZmZrcHJ5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDQ4OTU1OSwiZXhwIjoyMDc2MDY1NTU5fQ.TlIAqsKeFlJTJi4wVrzQBOlTR9cGdBpv6cuLavTRu_s'
)

// Use the REST API to execute raw SQL
const response = await fetch('https://xnwzwppmknnyawffkpry.supabase.co/rest/v1/rpc/query', {
  method: 'POST',
  headers: {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhud3p3cHBta25ueWF3ZmZrcHJ5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDQ4OTU1OSwiZXhwIjoyMDc2MDY1NTU5fQ.TlIAqsKeFlJTJi4wVrzQBOlTR9cGdBpv6cuLavTRu_s',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhud3p3cHBta25ueWF3ZmZrcHJ5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDQ4OTU1OSwiZXhwIjoyMDc2MDY1NTU5fQ.TlIAqsKeFlJTJi4wVrzQBOlTR9cGdBpv6cuLavTRu_s',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    query: `ALTER TABLE projects ADD COLUMN IF NOT EXISTS project_type TEXT CHECK (project_type IN ('dashboard', 'power-bi', 'gis-map', 'document', 'tableau', 'other'));`
  })
})

// Try direct insert approach - add the column using a dummy update
console.log('Attempting to add project_type column via database update...')

const { data, error } = await supabase
  .from('projects')
  .update({ project_type: 'other' })
  .eq('id', '00000000-0000-0000-0000-000000000000') // Non-existent ID

if (error && error.message.includes('column')) {
  console.log('Column does not exist, as expected.')
  console.log('\n✅ SOLUTION: Visit this URL and paste the SQL:')
  console.log('https://supabase.com/dashboard/project/xnwzwppmknnyawffkpry/sql/new')
  console.log('\nSQL to run:')
  console.log('ALTER TABLE projects ADD COLUMN IF NOT EXISTS project_type TEXT CHECK (project_type IN (\'dashboard\', \'power-bi\', \'gis-map\', \'document\', \'tableau\', \'other\'));')
} else {
  console.log('✅ Column already exists!')
}
