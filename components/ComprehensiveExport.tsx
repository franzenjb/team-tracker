'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import ExportDialog from './ExportDialog'
import { generatePDF, ExportOptions } from '@/lib/pdfExport'

export default function ComprehensiveExport() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleExport(options: ExportOptions) {
    setLoading(true)

    try {
      // Fetch all data
      const [peopleResult, projectsResult, assignmentsResult] = await Promise.all([
        supabase.from('people').select('*').order('name'),
        supabase.from('projects').select('*').order('created_at', { ascending: false }),
        supabase.from('assignments').select('*')
      ])

      if (peopleResult.error) throw peopleResult.error
      if (projectsResult.error) throw projectsResult.error
      if (assignmentsResult.error) throw assignmentsResult.error

      const people = peopleResult.data || []
      const projects = projectsResult.data || []
      const assignments = assignmentsResult.data || []

      // Generate PDF
      generatePDF(people, projects, assignments, options)
    } catch (error) {
      console.error('Error exporting PDF:', error)
      alert('Failed to export PDF. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsDialogOpen(true)}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        {loading ? 'Generating...' : 'Export PDF Report'}
      </button>

      <ExportDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onExport={handleExport}
      />
    </>
  )
}
