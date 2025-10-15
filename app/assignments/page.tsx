'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Assignment, Person, Project } from '@/lib/types'

type AssignmentWithDetails = Assignment & {
  people?: Person
  projects?: Project
}

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<AssignmentWithDetails[]>([])
  const [people, setPeople] = useState<Person[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    person_id: '',
    project_id: '',
    role: '',
    percent: '',
    start_date: '',
    end_date: '',
    notes: '',
  })
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)

    const [assignmentsResult, peopleResult, projectsResult] = await Promise.all([
      supabase
        .from('assignments')
        .select(`
          *,
          people(*),
          projects(*)
        `)
        .order('created_at', { ascending: false }),
      supabase.from('people').select('*').order('name'),
      supabase.from('projects').select('*').order('name'),
    ])

    if (assignmentsResult.data) setAssignments(assignmentsResult.data)
    if (peopleResult.data) setPeople(peopleResult.data)
    if (projectsResult.data) setProjects(projectsResult.data)

    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const data = {
      person_id: formData.person_id,
      project_id: formData.project_id,
      role: formData.role || null,
      percent: formData.percent ? parseFloat(formData.percent) : null,
      start_date: formData.start_date || null,
      end_date: formData.end_date || null,
      notes: formData.notes || null,
    }

    if (editingId) {
      const { error } = await supabase
        .from('assignments')
        .update(data as any)
        .eq('id', editingId)

      if (error) {
        alert('Error updating assignment: ' + error.message)
        return
      }
    } else {
      const { error } = await supabase
        .from('assignments')
        .insert([data] as any)

      if (error) {
        alert('Error creating assignment: ' + error.message)
        return
      }
    }

    resetForm()
    loadData()
  }

  function handleEdit(assignment: AssignmentWithDetails) {
    setFormData({
      person_id: assignment.person_id,
      project_id: assignment.project_id,
      role: assignment.role || '',
      percent: assignment.percent?.toString() || '',
      start_date: assignment.start_date || '',
      end_date: assignment.end_date || '',
      notes: assignment.notes || '',
    })
    setEditingId(assignment.id)
    setShowForm(true)
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this assignment?')) return

    const { error } = await supabase
      .from('assignments')
      .delete()
      .eq('id', id)

    if (error) {
      alert('Error deleting assignment: ' + error.message)
    } else {
      loadData()
    }
  }

  function resetForm() {
    setFormData({
      person_id: '',
      project_id: '',
      role: '',
      percent: '',
      start_date: '',
      end_date: '',
      notes: '',
    })
    setEditingId(null)
    setShowForm(false)
  }

  if (loading) {
    return <div className="px-4 sm:px-6 lg:px-8">Loading...</div>
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Assignments</h1>
          <p className="mt-2 text-sm text-gray-700">
            Link people to projects and track their assignments
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className="block rounded-md bg-purple-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-purple-500"
          >
            {showForm ? 'Hide Form' : 'Add Assignment'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="mt-8 bg-white shadow sm:rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {editingId ? 'Edit Assignment' : 'Add New Assignment'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="person_id" className="block text-sm font-medium text-gray-700">
                  Person *
                </label>
                <select
                  id="person_id"
                  required
                  value={formData.person_id}
                  onChange={(e) => setFormData({ ...formData, person_id: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500"
                >
                  <option value="">Select a person</option>
                  {people.map((person) => (
                    <option key={person.id} value={person.id}>
                      {person.name} {person.role && `(${person.role})`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="project_id" className="block text-sm font-medium text-gray-700">
                  Project *
                </label>
                <select
                  id="project_id"
                  required
                  value={formData.project_id}
                  onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500"
                >
                  <option value="">Select a project</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name} ({project.status})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                  Role on Project
                </label>
                <input
                  type="text"
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500"
                  placeholder="e.g., Lead Developer"
                />
              </div>

              <div>
                <label htmlFor="percent" className="block text-sm font-medium text-gray-700">
                  Time Allocation (%)
                </label>
                <input
                  type="number"
                  id="percent"
                  min="0"
                  max="100"
                  value={formData.percent}
                  onChange={(e) => setFormData({ ...formData, percent: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500"
                  placeholder="50"
                />
              </div>
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
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500"
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
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                Notes
              </label>
              <textarea
                id="notes"
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="inline-flex justify-center rounded-md border border-transparent bg-purple-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-purple-700"
              >
                {editingId ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="mt-8">
        {assignments.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">No assignments yet. Link people to projects above!</p>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                    Person
                  </th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Project
                  </th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Role
                  </th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Allocation
                  </th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Dates
                  </th>
                  <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {assignments.map((assignment) => (
                  <tr key={assignment.id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                      {assignment.people?.name || 'Unknown'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {assignment.projects?.name || 'Unknown'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {assignment.role || '-'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {assignment.percent ? `${assignment.percent}%` : '-'}
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-500">
                      {assignment.start_date && (
                        <div>{new Date(assignment.start_date).toLocaleDateString()}</div>
                      )}
                      {assignment.end_date && (
                        <div className="text-xs text-gray-400">
                          to {new Date(assignment.end_date).toLocaleDateString()}
                        </div>
                      )}
                      {!assignment.start_date && !assignment.end_date && '-'}
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <button
                        onClick={() => handleEdit(assignment)}
                        className="text-purple-600 hover:text-purple-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(assignment.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
