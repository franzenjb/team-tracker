'use client'

import { useState } from 'react'
import { ExportOptions } from '@/lib/pdfExport'

interface ExportDialogProps {
  isOpen: boolean
  onClose: () => void
  onExport: (options: ExportOptions) => void
}

export default function ExportDialog({ isOpen, onClose, onExport }: ExportDialogProps) {
  const [options, setOptions] = useState<ExportOptions>({
    groupBy: 'projectType',
    sortBy: 'name',
    includeSkills: true,
    includeRoles: true,
    includeNotes: true
  })

  if (!isOpen) return null

  const handleExport = () => {
    onExport(options)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Export PDF Options</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          {/* Group By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Group By
            </label>
            <select
              value={options.groupBy}
              onChange={(e) => setOptions({ ...options, groupBy: e.target.value as any })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            >
              <option value="none">No Grouping (Flat List)</option>
              <option value="projectType">Project Type</option>
              <option value="person">Person</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">
              {options.groupBy === 'projectType' && 'Projects will be organized by type (Dashboard, Power BI, GIS, etc.)'}
              {options.groupBy === 'person' && 'Each person will have their own section with their projects'}
              {options.groupBy === 'none' && 'All people and projects in simple tables'}
            </p>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <select
              value={options.sortBy}
              onChange={(e) => setOptions({ ...options, sortBy: e.target.value as any })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            >
              <option value="name">Name (A-Z)</option>
              <option value="date">Date (Newest First)</option>
              <option value="projectType">Project Type</option>
            </select>
          </div>

          {/* Include Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Include in Export
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={options.includeSkills}
                  onChange={(e) => setOptions({ ...options, includeSkills: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Skills</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={options.includeRoles}
                  onChange={(e) => setOptions({ ...options, includeRoles: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Roles</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={options.includeNotes}
                  onChange={(e) => setOptions({ ...options, includeNotes: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Notes</span>
              </label>
            </div>
          </div>

          {/* Preview Info */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-start">
              <svg className="h-5 w-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Export Preview</h3>
                <div className="mt-2 text-xs text-blue-700">
                  <p>Your PDF will include:</p>
                  <ul className="mt-1 list-disc list-inside space-y-1">
                    <li>Professional header with date and summary stats</li>
                    <li>Red Cross branded section headers</li>
                    <li>Clickable resource URLs</li>
                    <li>Clean formatting with proper spacing</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            className="flex-1 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Generate PDF
          </button>
        </div>
      </div>
    </div>
  )
}
