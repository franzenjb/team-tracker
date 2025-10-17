'use client'

import { useEffect, useState, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { Project } from '@/lib/types'
import ProjectForm from '@/components/ProjectForm'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | undefined>()

  // Search & Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  // View mode
  const [viewMode, setViewMode] = useState<'cards' | 'timeline'>('cards')

  // Sort state
  const [sortField, setSortField] = useState<'name' | 'start_date' | 'end_date' | 'status'>('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  useEffect(() => {
    loadProjects()
  }, [])

  async function loadProjects() {
    setLoading(true)
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })

    if (data) setProjects(data)
    if (error) console.error('Error loading projects:', error)
    setLoading(false)
  }

  async function deleteProject(id: string) {
    if (!confirm('Are you sure you want to delete this project? This will also delete all assignments and notes for this project.')) return

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)

    if (error) {
      alert('Error deleting project: ' + error.message)
    } else {
      loadProjects()
    }
  }

  function handleEdit(project: Project) {
    setEditingProject(project)
    setShowForm(true)
  }

  function handleFormSuccess() {
    setShowForm(false)
    setEditingProject(undefined)
    loadProjects()
  }

  function handleCancel() {
    setShowForm(false)
    setEditingProject(undefined)
  }

  function getStatusBadgeClass(status: string) {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'planned':
        return 'bg-blue-100 text-blue-800'
      case 'paused':
        return 'bg-yellow-100 text-yellow-800'
      case 'complete':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Filter and search logic
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchesSearch = searchTerm === '' ||
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === '' || project.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [projects, searchTerm, statusFilter])

  // Sort logic
  const sortedProjects = useMemo(() => {
    const sorted = [...filteredProjects]
    sorted.sort((a, b) => {
      let aVal = a[sortField]
      let bVal = b[sortField]

      if (aVal === null || aVal === undefined) return 1
      if (bVal === null || bVal === undefined) return -1

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal)
      }

      return 0
    })
    return sorted
  }, [filteredProjects, sortField, sortDirection])

  // CSV Export function
  function exportToCSV() {
    const headers = ['Name', 'Description', 'Status', 'Start Date', 'End Date']
    const rows = sortedProjects.map(project => [
      project.name,
      project.description || '',
      project.status,
      project.start_date || '',
      project.end_date || ''
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `projects-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  // PDF Export function
  function exportToPDF() {
    const doc = new jsPDF()

    // Add title
    doc.setFontSize(18)
    doc.text("Jim's Team Tracker - Projects", 14, 20)

    // Add date
    doc.setFontSize(10)
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28)

    // Add table
    autoTable(doc, {
      startY: 35,
      head: [['Name', 'Description', 'Status', 'Start Date', 'End Date']],
      body: sortedProjects.map(project => [
        project.name,
        project.description || '-',
        project.status,
        project.start_date ? new Date(project.start_date).toLocaleDateString() : '-',
        project.end_date ? new Date(project.end_date).toLocaleDateString() : '-'
      ]),
      theme: 'striped',
      headStyles: { fillColor: [22, 163, 74] }, // green-600
    })

    // Save the PDF
    doc.save(`projects-${new Date().toISOString().split('T')[0]}.pdf`)
  }

  if (loading) {
    return <div className="px-4 sm:px-6 lg:px-8">Loading...</div>
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Projects</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage all your team projects
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
            className="rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500"
          >
            {showForm ? 'Hide Form' : 'Add Project'}
          </button>
        </div>
      </div>

      {/* Search, Filter, and View Toggle */}
      <div className="mt-6 flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-green-500"
          />
        </div>
        <div className="w-40">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-green-500"
          >
            <option value="">All Status</option>
            <option value="planned">Planned</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="complete">Complete</option>
          </select>
        </div>
        <div className="w-40">
          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value as any)}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-green-500"
          >
            <option value="name">Sort by Name</option>
            <option value="start_date">Sort by Start</option>
            <option value="end_date">Sort by End</option>
            <option value="status">Sort by Status</option>
          </select>
        </div>
        <div className="flex rounded-md shadow-sm">
          <button
            type="button"
            onClick={() => setViewMode('cards')}
            className={`px-3 py-2 text-sm font-semibold ${
              viewMode === 'cards'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-900 ring-1 ring-inset ring-gray-300'
            } rounded-l-md hover:bg-green-500 hover:text-white`}
          >
            Cards
          </button>
          <button
            type="button"
            onClick={() => setViewMode('timeline')}
            className={`px-3 py-2 text-sm font-semibold ${
              viewMode === 'timeline'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-900 ring-1 ring-inset ring-gray-300'
            } rounded-r-md hover:bg-green-500 hover:text-white`}
          >
            Timeline
          </button>
        </div>
      </div>

      {showForm && (
        <div className="mt-8 bg-white shadow sm:rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {editingProject ? 'Edit Project' : 'Add New Project'}
          </h2>
          <ProjectForm
            project={editingProject}
            onSuccess={handleFormSuccess}
            onCancel={handleCancel}
          />
        </div>
      )}

      <div className="mt-8">
        {sortedProjects.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">
              {projects.length === 0
                ? 'No projects yet. Add your first project above!'
                : 'No results found. Try adjusting your search or filters.'}
            </p>
          </div>
        ) : viewMode === 'cards' ? (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {sortedProjects.map((project) => (
                <div
                  key={project.id}
                  className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="p-5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900 truncate">
                        {project.name}
                      </h3>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(project.status)}`}>
                        {project.status}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                      {project.description || 'No description'}
                    </p>
                    {(project.start_date || project.end_date) && (
                      <div className="mt-3 text-xs text-gray-500">
                        {project.start_date && (
                          <div>Start: {new Date(project.start_date).toLocaleDateString()}</div>
                        )}
                        {project.end_date && (
                          <div>End: {new Date(project.end_date).toLocaleDateString()}</div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="bg-gray-50 px-5 py-3 flex justify-end gap-3">
                    <button
                      onClick={() => handleEdit(project)}
                      className="text-sm text-blue-600 hover:text-blue-900 font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteProject(project.id)}
                      className="text-sm text-red-600 hover:text-red-900 font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-sm text-gray-500 text-center">
              Showing {sortedProjects.length} of {projects.length} projects
            </div>
          </>
        ) : (
          // Timeline View
          <div className="bg-white shadow rounded-lg p-6">
            <div className="space-y-4">
              {sortedProjects
                .filter(p => p.start_date || p.end_date)
                .sort((a, b) => {
                  const dateA = a.start_date || a.end_date || ''
                  const dateB = b.start_date || b.end_date || ''
                  return dateA.localeCompare(dateB)
                })
                .map((project) => {
                  const start = project.start_date ? new Date(project.start_date) : null
                  const end = project.end_date ? new Date(project.end_date) : null
                  const now = new Date()
                  const isActive = start && end && now >= start && now <= end

                  return (
                    <div key={project.id} className="border-l-4 pl-4 py-3" style={{ borderColor: isActive ? '#10b981' : '#d1d5db' }}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-semibold text-gray-900">{project.name}</h3>
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getStatusBadgeClass(project.status)}`}>
                              {project.status}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-gray-600">{project.description}</p>
                          <div className="mt-2 flex gap-4 text-xs text-gray-500">
                            {start && <div>Start: {start.toLocaleDateString()}</div>}
                            {end && <div>End: {end.toLocaleDateString()}</div>}
                            {start && end && (
                              <div className="font-medium">
                                Duration: {Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))} days
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(project)}
                            className="text-sm text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteProject(project.id)}
                            className="text-sm text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
            </div>
            {sortedProjects.filter(p => !p.start_date && !p.end_date).length > 0 && (
              <div className="mt-6 pt-6 border-t">
                <p className="text-sm text-gray-500 mb-2">Projects without dates:</p>
                <div className="space-y-2">
                  {sortedProjects
                    .filter(p => !p.start_date && !p.end_date)
                    .map(project => (
                      <div key={project.id} className="text-sm text-gray-600">
                        • {project.name}
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
