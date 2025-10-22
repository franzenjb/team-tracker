'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Project } from '@/lib/types'
import { extractPowerBILink, cleanDescription } from '@/lib/utils'

type ProjectFormProps = {
  project?: Project
  onSuccess?: () => void
  onCancel?: () => void
}

export default function ProjectForm({ project, onSuccess, onCancel }: ProjectFormProps) {
  const [formData, setFormData] = useState({
    name: project?.name || '',
    description: project?.description || '',
    powerbi_url: '',
    status: project?.status || 'planned',
    start_date: project?.start_date || '',
    end_date: project?.end_date || '',
  })

  // Extract Power BI URL from description on component load
  useEffect(() => {
    if (project?.description) {
      const extractedUrl = extractPowerBILink(project.description)
      const cleanDesc = cleanDescription(project.description)
      setFormData(prev => ({
        ...prev,
        description: cleanDesc,
        powerbi_url: extractedUrl || ''
      }))
    }
  }, [project])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Combine description and Power BI URL into the description field
      let combinedDescription = formData.description || ''
      if (formData.powerbi_url) {
        combinedDescription += (combinedDescription ? ' | ' : '') + `Power BI Link: ${formData.powerbi_url}`
      }

      const data = {
        name: formData.name,
        description: combinedDescription || null,
        status: formData.status as 'planned' | 'active' | 'paused' | 'complete',
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
      }

      if (project?.id) {
        // Update existing project
        const { error } = await supabase
          .from('projects')
          .update(data)
          .eq('id', project.id)

        if (error) throw error
      } else {
        // Create new project
        const { error } = await supabase
          .from('projects')
          .insert([data])

        if (error) throw error
      }

      setFormData({ name: '', description: '', powerbi_url: '', status: 'planned', start_date: '', end_date: '' })
      onSuccess?.()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Project Name *
        </label>
        <input
          type="text"
          id="name"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          rows={3}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          placeholder="Project description (without Power BI link)"
        />
      </div>

      <div>
        <label htmlFor="powerbi_url" className="block text-sm font-medium text-gray-700">
          Power BI Dashboard URL
        </label>
        <div className="mt-1">
          <input
            type="url"
            id="powerbi_url"
            value={formData.powerbi_url}
            onChange={(e) => setFormData({ ...formData, powerbi_url: e.target.value })}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            placeholder="https://app.powerbi.com/..."
          />
          {formData.powerbi_url && (
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <span className="text-xl mt-0.5">📊</span>
                <div className="flex-1">
                  <div className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">
                    Power BI Dashboard Preview
                  </div>
                  <a 
                    href={formData.powerbi_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Open Dashboard →
                  </a>
                  <div className="text-xs text-blue-600 mt-1 break-all opacity-75">
                    {formData.powerbi_url}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
          Status
        </label>
        <select
          id="status"
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value as 'planned' | 'active' | 'paused' | 'complete' })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
        >
          <option value="planned">Planned</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="complete">Complete</option>
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">
            Start Date
          </label>
          <input
            type="date"
            id="start_date"
            value={formData.start_date}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">
            End Date
          </label>
          <input
            type="date"
            id="end_date"
            value={formData.end_date}
            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex justify-center rounded-md border border-transparent bg-green-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? 'Saving...' : project ? 'Update' : 'Create'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
