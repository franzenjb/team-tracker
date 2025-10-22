'use client'

import { useState } from 'react'

export default function MigrationPage() {
  const [status, setStatus] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [running, setRunning] = useState(false)

  async function runMigration() {
    setRunning(true)
    setError('')
    setStatus('Running migration...')

    try {
      const response = await fetch('/api/run-migration', {
        method: 'POST'
      })

      const result = await response.json()

      if (response.ok) {
        setStatus(`✅ Success! ${result.message}`)
      } else {
        setError(`❌ Error: ${result.error}`)
      }
    } catch (err: any) {
      setError(`❌ Error: ${err.message}`)
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Database Migration</h1>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Add project_type Column</h2>
          <p className="text-gray-600 mb-4">
            This migration will add the <code className="bg-gray-100 px-2 py-1 rounded">project_type</code> column
            to your projects table, allowing you to categorize projects as Dashboard, Power BI, GIS/Map, Document, Tableau, or Other.
          </p>

          <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-4">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> You only need to run this once. If you've already run it, running it again won't cause any issues.
            </p>
          </div>
        </div>

        <button
          onClick={runMigration}
          disabled={running}
          className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {running ? 'Running Migration...' : 'Run Migration Now'}
        </button>

        {status && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
            <p className="text-green-800">{status}</p>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
            <p className="text-red-800">{error}</p>
            <p className="text-sm text-red-600 mt-2">
              If this error persists, you can manually run this SQL in your Supabase SQL Editor:
            </p>
            <pre className="mt-2 p-3 bg-gray-900 text-gray-100 rounded text-xs overflow-x-auto">
{`ALTER TABLE projects
ADD COLUMN IF NOT EXISTS project_type TEXT
CHECK (project_type IN ('dashboard', 'power-bi', 'gis-map', 'document', 'tableau', 'other'));`}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
