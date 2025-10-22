import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST() {
  try {
    // Create admin client
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Test connection first
    const { data: testData, error: testError } = await supabaseAdmin
      .from('projects')
      .select('id')
      .limit(1)

    if (testError) {
      return NextResponse.json(
        { error: 'Could not connect to database: ' + testError.message },
        { status: 500 }
      )
    }

    // Try to check if column exists by attempting a select
    const { data: checkData, error: checkError } = await supabaseAdmin
      .from('projects')
      .select('project_type')
      .limit(1)

    if (!checkError) {
      return NextResponse.json({
        message: 'Column already exists! Your database is ready to go.'
      })
    }

    // Column doesn't exist - provide SQL instructions
    return NextResponse.json({
      error: 'Column needs to be added. Please run this SQL in your Supabase SQL Editor (https://supabase.com/dashboard/project/xnwzwppmknnyawffkpry/sql/new):',
      sql: `ALTER TABLE projects ADD COLUMN IF NOT EXISTS project_type TEXT CHECK (project_type IN ('dashboard', 'power-bi', 'gis-map', 'document', 'tableau', 'other'));`,
      dashboard_url: 'https://supabase.com/dashboard/project/xnwzwppmknnyawffkpry/sql/new'
    }, { status: 400 })

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
