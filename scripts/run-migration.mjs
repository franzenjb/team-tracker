import pg from 'pg'
const { Client } = pg

const client = new Client({
  host: 'db.xnwzwppmknnyawffkpry.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'mJ%PQGvQYo%6Z2Ez',
  ssl: { rejectUnauthorized: false }
})

async function runMigration() {
  try {
    await client.connect()
    console.log('Connected to database...')

    // Add the project_type column
    await client.query(`
      ALTER TABLE projects
      ADD COLUMN IF NOT EXISTS project_type TEXT
      CHECK (project_type IN ('dashboard', 'power-bi', 'gis-map', 'document', 'tableau', 'other'));
    `)

    console.log('✅ Added project_type column')

    // Update existing projects
    const result = await client.query(`
      UPDATE projects
      SET project_type = 'other'
      WHERE project_type IS NULL;
    `)

    console.log(`✅ Updated ${result.rowCount} existing projects with default type 'other'`)
    console.log('✅ Migration complete!')

  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    process.exit(1)
  } finally {
    await client.end()
  }
}

runMigration()
