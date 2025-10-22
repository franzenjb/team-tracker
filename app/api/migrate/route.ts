import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Check current schema
    const { data: existingProjects, error: selectError } = await supabaseAdmin
      .from('projects')
      .select('*')
      .limit(1)

    if (selectError) {
      return NextResponse.json({ error: selectError.message }, { status: 500 })
    }

    // Check if project_type column exists
    if (existingProjects && existingProjects.length > 0) {
      const firstProject = existingProjects[0]
      if ('project_type' in firstProject) {
        return NextResponse.json({ message: 'Column already exists!' })
      }
    }

    // The column doesn't exist, we need to add it
    // Unfortunately, Supabase client doesn't support ALTER TABLE directly
    // User needs to run this in Supabase SQL Editor
    return NextResponse.json({
      status: 'needs_manual_migration',
      message: 'Please run the following SQL in your Supabase SQL Editor:',
      sql: `
ALTER TABLE projects
ADD COLUMN project_type TEXT
CHECK (project_type IN ('dashboard', 'power-bi', 'gis-map', 'document', 'tableau', 'other'));

UPDATE projects
SET project_type = 'other'
WHERE project_type IS NULL;
      `.trim()
    })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
