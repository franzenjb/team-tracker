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

// Expected schema from types.ts
const expectedSchema = {
  people: ['id', 'name', 'role', 'email', 'skills', 'notes', 'created_at'],
  projects: ['id', 'name', 'status', 'project_type', 'description', 'start_date', 'end_date', 'created_at'],
  assignments: ['id', 'person_id', 'project_id', 'title', 'description', 'status', 'priority', 'role', 'percent', 'start_date', 'end_date', 'due_date', 'requester', 'notes', 'created_at'],
  project_notes: ['id', 'project_id', 'person_id', 'content', 'created_at']
}

async function auditSchema() {
  console.log('🔍 COMPREHENSIVE SCHEMA AUDIT\n')
  console.log('Comparing database schema against types.ts definitions...\n')

  const allMissingColumns = []

  for (const [tableName, expectedColumns] of Object.entries(expectedSchema)) {
    console.log(`\n📋 Table: ${tableName}`)
    console.log('=' + '='.repeat(50))

    // Query actual columns from database
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = '${tableName}'
        ORDER BY ordinal_position;
      `
    })

    // If rpc doesn't work, try direct query
    if (error) {
      console.log('   ⚠️  Cannot query schema directly, trying alternative...')

      // Try to select from the table to see what columns exist
      const { data: sampleData, error: selectError } = await supabase
        .from(tableName)
        .select('*')
        .limit(1)

      if (selectError) {
        console.log(`   ❌ Error querying ${tableName}:`, selectError.message)
        continue
      }

      const actualColumns = sampleData && sampleData.length > 0
        ? Object.keys(sampleData[0])
        : []

      console.log(`   Actual columns (${actualColumns.length}):`, actualColumns.join(', '))
      console.log(`   Expected columns (${expectedColumns.length}):`, expectedColumns.join(', '))

      // Find missing columns
      const missing = expectedColumns.filter(col => !actualColumns.includes(col))

      if (missing.length > 0) {
        console.log(`   ❌ MISSING COLUMNS (${missing.length}):`, missing.join(', '))
        allMissingColumns.push({ table: tableName, columns: missing })
      } else {
        console.log('   ✅ All expected columns exist!')
      }

      // Find extra columns (not in types.ts)
      const extra = actualColumns.filter(col => !expectedColumns.includes(col))
      if (extra.length > 0) {
        console.log(`   ℹ️  Extra columns not in types.ts:`, extra.join(', '))
      }
    }
  }

  console.log('\n\n' + '='.repeat(70))
  console.log('📊 AUDIT SUMMARY')
  console.log('='.repeat(70))

  if (allMissingColumns.length === 0) {
    console.log('\n✅ SUCCESS! All tables match types.ts definitions perfectly!')
  } else {
    console.log(`\n❌ FOUND ${allMissingColumns.length} TABLE(S) WITH MISSING COLUMNS:\n`)

    allMissingColumns.forEach(({ table, columns }) => {
      console.log(`   ${table}:`)
      columns.forEach(col => console.log(`      - ${col}`))
      console.log('')
    })

    console.log('\n🔧 RECOMMENDED SQL MIGRATION:\n')
    console.log('-- Run this SQL in Supabase SQL Editor to fix all schema issues at once')
    console.log('-- ========================================================================\n')

    allMissingColumns.forEach(({ table, columns }) => {
      columns.forEach(col => {
        // Determine appropriate data type based on column name and table
        let dataType = 'TEXT'
        let constraint = ''

        if (col === 'skills') {
          dataType = 'TEXT[]' // Array type
        } else if (col.includes('date')) {
          dataType = 'TIMESTAMPTZ'
        } else if (col === 'percent') {
          dataType = 'INTEGER'
        } else if (col === 'status' && table === 'projects') {
          dataType = 'TEXT'
          constraint = " CHECK (status IN ('planned', 'active', 'paused', 'complete'))"
        } else if (col === 'status' && table === 'assignments') {
          dataType = 'TEXT'
          constraint = " CHECK (status IN ('pending', 'in_progress', 'complete', 'on_hold'))"
        } else if (col === 'priority') {
          dataType = 'TEXT'
          constraint = " CHECK (priority IN ('low', 'medium', 'high', 'urgent'))"
        }

        console.log(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS ${col} ${dataType}${constraint};`)
      })
    })

    console.log('\n-- ========================================================================')
  }
}

auditSchema()
