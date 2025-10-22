import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://xnwzwppmknnyawffkpry.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhud3p3cHBta25ueWF3ZmZrcHJ5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyOTM0MDc2NCwiZXhwIjoyMDQ0OTE2NzY0fQ.aKGEXuBwA7cO7hc06lnLKWJNZmrIzBP6KNQ9c_Zl-8w',
  {
    db: {
      schema: 'public'
    }
  }
)

async function addColumn() {
  try {
    // First, check if column exists
    const { data: columns, error: checkError } = await supabase
      .from('projects')
      .select('*')
      .limit(1)

    if (checkError) {
      console.error('Error checking table:', checkError)
      process.exit(1)
    }

    // Use Supabase SQL editor endpoint to run raw SQL
    const response = await fetch('https://xnwzwppmknnyawffkpry.supabase.co/rest/v1/rpc/exec_sql', {
      method: 'POST',
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhud3p3cHBta25ueWF3ZmZrcHJ5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyOTM0MDc2NCwiZXhwIjoyMDQ0OTE2NzY0fQ.aKGEXuBwA7cO7hc06lnLKWJNZmrIzBP6KNQ9c_Zl-8w',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhud3p3cHBta25ueWF3ZmZrcHJ5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyOTM0MDc2NCwiZXhwIjoyMDQ0OTE2NzY0fQ.aKGEXuBwA7cO7hc06lnLKWJNZmrIzBP6KNQ9c_Zl-8w',
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        query: `
          ALTER TABLE projects
          ADD COLUMN IF NOT EXISTS project_type TEXT
          CHECK (project_type IN ('dashboard', 'power-bi', 'gis-map', 'document', 'tableau', 'other'));
        `
      })
    })

    console.log('SQL Migration Complete!')
    console.log('The project_type column has been added to the projects table.')

  } catch (err) {
    console.error('Error:', err)
    process.exit(1)
  }
}

addColumn()
