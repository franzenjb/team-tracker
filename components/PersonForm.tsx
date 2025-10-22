'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Person } from '@/lib/types'

type PersonFormProps = {
  person?: Person
  onSuccess?: () => void
  onCancel?: () => void
}

const AVAILABLE_SKILLS = [
  'Power BI',
  'GIS', 
  'DA',
  'Situational awareness',
  'Data',
  'General Information and planning'
]

const AVAILABLE_ROLES = [
  'I&P Team Member',
  'Power BI Developer',
  'GIS Specialist',
  'Data Analyst',
  'Manager',
  'Coordinator',
  'Volunteer',
  'Consultant'
]

export default function PersonForm({ person, onSuccess, onCancel }: PersonFormProps) {
  const [formData, setFormData] = useState({
    name: person?.name || '',
    roles: person?.role ? person.role.split(', ') : [],
    email: person?.email || '',
    skills: person?.skills || [],
    notes: person?.notes || '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSkillToggle = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }))
  }

  const handleRoleToggle = (role: string) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter(r => r !== role)
        : [...prev.roles, role]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const data = {
        name: formData.name,
        role: formData.roles.length > 0 ? formData.roles.join(', ') : null,
        email: formData.email || null,
        skills: formData.skills.length > 0 ? formData.skills : null,
        notes: formData.notes || null,
      }

      if (person?.id) {
        // Update existing person
        const { error } = await supabase
          .from('people')
          .update(data)
          .eq('id', person.id)

        if (error) throw error
      } else {
        // Create new person
        const { error } = await supabase
          .from('people')
          .insert([data])

        if (error) throw error
      }

      setFormData({ name: '', roles: [], email: '', skills: [], notes: '' })
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
          Name *
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
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Roles
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {AVAILABLE_ROLES.map((role) => (
            <label key={role} className="flex items-center">
              <input
                type="checkbox"
                checked={formData.roles.includes(role)}
                onChange={() => handleRoleToggle(role)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">{role}</span>
            </label>
          ))}
        </div>
        {formData.roles.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {formData.roles.map((role) => (
              <span
                key={role}
                className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700"
              >
                {role}
              </span>
            ))}
          </div>
        )}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          type="email"
          id="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Skills
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {AVAILABLE_SKILLS.map((skill) => (
            <label key={skill} className="flex items-center">
              <input
                type="checkbox"
                checked={formData.skills.includes(skill)}
                onChange={() => handleSkillToggle(skill)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">{skill}</span>
            </label>
          ))}
        </div>
        {formData.skills.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {formData.skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700"
              >
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
          Notes
        </label>
        <textarea
          id="notes"
          rows={3}
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
        />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? 'Saving...' : person ? 'Update' : 'Create'}
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
