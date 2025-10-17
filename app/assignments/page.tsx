'use client'

import { useEffect, useState, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { Assignment, Person, Project } from '@/lib/types'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

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

  // Search & Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [personFilter, setPersonFilter] = useState('')
  const [projectFilter, setProjectFilter] = useState('')

  // Sort state
  const [sortField, setSortField] = useState<'person' | 'project' | 'role' | 'percent' | 'start_date'>('person')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

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
        .update(data)
        .eq('id', editingId)

      if (error) {
        alert('Error updating assignment: ' + error.message)
        return
      }
    } else {
      const { error } = await supabase
        .from('assignments')
        .insert([data])

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

  // Filter and search logic
  const filteredAssignments = useMemo(() => {
    return assignments.filter(assignment => {
      const matchesSearch = searchTerm === '' ||
        assignment.people?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignment.projects?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignment.role?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesPerson = personFilter === '' || assignment.person_id === personFilter
      const matchesProject = projectFilter === '' || assignment.project_id === projectFilter

      return matchesSearch && matchesPerson && matchesProject
    })
  }, [assignments, searchTerm, personFilter, projectFilter])

  // Sort logic
  const sortedAssignments = useMemo(() => {
    const sorted = [...filteredAssignments]
    sorted.sort((a, b) => {
      let aVal: any
      let bVal: any

      switch (sortField) {
        case 'person':
          aVal = a.people?.name
          bVal = b.people?.name
          break
        case 'project':
          aVal = a.projects?.name
          bVal = b.projects?.name
          break
        case 'role':
          aVal = a.role
          bVal = b.role
          break
        case 'percent':
          aVal = a.percent
          bVal = b.percent
          break
        case 'start_date':
          aVal = a.start_date
          bVal = b.start_date
          break
        default:
          aVal = a.people?.name
          bVal = b.people?.name
      }

      if (aVal === null || aVal === undefined) return 1
      if (bVal === null || bVal === undefined) return -1

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal)
      }

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal
      }

      return 0
    })
    return sorted
  }, [filteredAssignments, sortField, sortDirection])

  // CSV Export function
  function exportToCSV() {
    const headers = ['Person', 'Project', 'Role', 'Allocation %', 'Start Date', 'End Date', 'Notes']
    const rows = sortedAssignments.map(assignment => [
      assignment.people?.name || '',
      assignment.projects?.name || '',
      assignment.role || '',
      assignment.percent?.toString() || '',
      assignment.start_date || '',
      assignment.end_date || '',
      assignment.notes || ''
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `assignments-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  // PDF Export function
  function exportToPDF() {
    const doc = new jsPDF()

    // Add title
    doc.setFontSize(18)
    doc.text("Jim's Team Tracker - Assignments", 14, 20)

    // Add date
    doc.setFontSize(10)
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28)

    // Add table
    autoTable(doc, {
      startY: 35,
      head: [['Person', 'Project', 'Role', 'Allocation %', 'Start Date']],
      body: sortedAssignments.map(assignment => [
        assignment.people?.name || '-',
        assignment.projects?.name || '-',
        assignment.role || '-',
        assignment.percent ? `${assignment.percent}%` : '-',
        assignment.start_date ? new Date(assignment.start_date).toLocaleDateString() : '-'
      ]),
      theme: 'striped',
      headStyles: { fillColor: [147, 51, 234] }, // purple-600
    })

    // Save the PDF
    doc.save(`assignments-${new Date().toISOString().split('T')[0]}.pdf`)
  }

  // Handle sort
  function handleSort(field: typeof sortField) {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
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
        <div className="mt-4 sm:ml-16 sm:mt-0 flex gap-2">
          <button
            type="button"
            onClick={exportToCSV}
            className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            Export CSV
          </button>
          <button
            type="button"
            onClick={exportToPDF}
            className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            Export PDF
          </button>
          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className="rounded-md bg-purple-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-purple-500"
          >
            {showForm ? 'Hide Form' : 'Add Assignment'}
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="mt-6 flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search by person, project, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500"
          />
        </div>
        <div className="w-48">
          <select
            value={personFilter}
            onChange={(e) => setPersonFilter(e.target.value)}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500"
          >
            <option value="">All People</option>
            {people.map(person => (
              <option key={person.id} value={person.id}>{person.name}</option>
            ))}
          </select>
        </div>
        <div className="w-48">
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500"
          >
            <option value="">All Projects</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </select>
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
        {sortedAssignments.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">
              {assignments.length === 0
                ? 'No assignments yet. Link people to projects above!'
                : 'No results found. Try adjusting your search or filters.'}
            </p>
          </div>
        ) : (
          <>
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('person')}
                    >
                      <div className="flex items-center gap-2">
                        Person
                        {sortField === 'person' && (
                          <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                    <th
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('project')}
                    >
                      <div className="flex items-center gap-2">
                        Project
                        {sortField === 'project' && (
                          <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                    <th
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('role')}
                    >
                      <div className="flex items-center gap-2">
                        Role
                        {sortField === 'role' && (
                          <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                    <th
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('percent')}
                    >
                      <div className="flex items-center gap-2">
                        Allocation
                        {sortField === 'percent' && (
                          <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                    <th
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('start_date')}
                    >
                      <div className="flex items-center gap-2">
                        Dates
                        {sortField === 'start_date' && (
                          <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                    <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {sortedAssignments.map((assignment) => (
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
            <div className="mt-2 text-sm text-gray-500 text-center">
              Showing {sortedAssignments.length} of {assignments.length} assignments
            </div>
          </>
        )}
      </div>
    </div>
  )
}
