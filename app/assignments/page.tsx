'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Assignment, Person, Project } from '@/lib/types'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { formatDate } from '@/lib/utils'

type AssignmentWithDetails = Assignment & {
  person_name: string
  project_name: string
  project_type?: string
  person_email?: string
}

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<AssignmentWithDetails[]>([])
  const [people, setPeople] = useState<Person[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null)
  const [statusFilter, setStatusFilter] = useState('')
  const [personFilter, setPersonFilter] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch assignments with related data (handle both old and new schema)
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('assignments')
        .select(`
          *,
          people:person_id(name, email),
          projects:project_id(name)
        `)
        .order('created_at', { ascending: false })

      if (assignmentsError) throw assignmentsError

      // Transform the data
      const formattedAssignments = assignmentsData?.map(a => ({
        ...a,
        person_name: a.people?.name || 'Unknown',
        person_email: a.people?.email || '',
        project_name: a.projects?.name || 'Unknown',
      })) || []

      setAssignments(formattedAssignments)

      // Fetch people and projects for form dropdowns
      const { data: peopleData } = await supabase
        .from('people')
        .select('*')
        .order('name')

      const { data: projectsData } = await supabase
        .from('projects')
        .select('*')
        .order('name')

      setPeople(peopleData || [])
      setProjects(projectsData || [])

    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'complete': return 'bg-green-100 text-green-800'
      case 'on_hold': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500 text-white'
      case 'high': return 'bg-orange-500 text-white'
      case 'medium': return 'bg-yellow-500 text-white'
      case 'low': return 'bg-green-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  // Helper function to sanitize text for exports
  const sanitizeText = (text: string | null | undefined): string => {
    if (!text) return ''
    // Remove special characters that might break exports
    return String(text)
      .replace(/[\r\n]+/g, ' ')  // Replace line breaks with spaces
      .replace(/\s+/g, ' ')       // Normalize whitespace
      .trim()
  }

  // Helper function to generate consistent filename
  const generateFilename = (extension: string): string => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    return `assignments-${year}-${month}-${day}.${extension}`
  }

  // CSV Export function - with robust error handling
  async function exportToCSV() {
    try {
      // Validate we have data
      if (!filteredAssignments || filteredAssignments.length === 0) {
        alert('No assignments to export. Please adjust your filters.')
        return
      }

      const headers = [
        'Title',
        'Person',
        'Email',
        'Project',
        'Project Type',
        'Status',
        'Priority',
        'Due Date',
        'Requester',
        'Role',
        'Allocation %',
        'Description',
        'Notes',
        'Created'
      ]

      // Sanitize and validate data
      const rows = filteredAssignments.map(assignment => [
        sanitizeText(assignment.title || assignment.notes?.substring(0, 50) || 'Untitled'),
        sanitizeText(assignment.person_name || 'Unknown'),
        sanitizeText(assignment.person_email || ''),
        sanitizeText(assignment.project_name || 'Unknown'),
        sanitizeText(assignment.project_type || ''),
        sanitizeText(assignment.status || 'pending'),
        sanitizeText(assignment.priority || ''),
        sanitizeText(assignment.due_date || ''),
        sanitizeText(assignment.requester || ''),
        sanitizeText(assignment.role || ''),
        sanitizeText(assignment.percent?.toString() || ''),
        sanitizeText(assignment.description || ''),
        sanitizeText(assignment.notes || ''),
        assignment.created_at ? new Date(assignment.created_at).toISOString().split('T')[0] : ''
      ])

      // Build CSV content with proper escaping
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => {
          const escaped = String(cell).replace(/"/g, '""')
          return `"${escaped}"`
        }).join(','))
      ].join('\n')

      // Create and download with explicit MIME type
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.setAttribute('href', url)
      link.setAttribute('download', generateFilename('csv'))
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      console.log(`✅ CSV exported successfully: ${filteredAssignments.length} assignments`)
    } catch (error) {
      console.error('Error exporting CSV:', error)
      alert(`Error exporting CSV: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`)
    }
  }

  // PDF Export function - with robust error handling
  async function exportToPDF() {
    try {
      // Validate we have data
      if (!filteredAssignments || filteredAssignments.length === 0) {
        alert('No assignments to export. Please adjust your filters.')
        return
      }

      const doc = new jsPDF('landscape')
      const pageWidth = doc.internal.pageSize.width

      // Header
      doc.setFontSize(20)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(220, 38, 38)
      doc.text("Work Assignments Report", pageWidth / 2, 15, { align: 'center' })

      // Date
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(100, 100, 100)
      const dateStr = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
      doc.text(`Generated: ${dateStr}`, pageWidth / 2, 22, { align: 'center' })

      // Summary stats (from filtered results)
      doc.setFontSize(10)
      doc.setTextColor(0, 0, 0)
      doc.text(`Total Assignments: ${filteredAssignments.length}`, 14, 30)
      doc.text(`Pending: ${filteredAssignments.filter(a => a.status === 'pending').length}`, 70, 30)
      doc.text(`In Progress: ${filteredAssignments.filter(a => a.status === 'in_progress').length}`, 110, 30)
      doc.text(`Complete: ${filteredAssignments.filter(a => a.status === 'complete').length}`, 160, 30)

      // Sort filtered assignments by status and priority
      const sortedAssignments = [...filteredAssignments].sort((a, b) => {
        const statusOrder = { 'pending': 1, 'in_progress': 2, 'on_hold': 3, 'complete': 4 }
        const priorityOrder = { 'urgent': 1, 'high': 2, 'medium': 3, 'low': 4 }

        const statusDiff = (statusOrder[a.status as keyof typeof statusOrder] || 99) -
                          (statusOrder[b.status as keyof typeof statusOrder] || 99)
        if (statusDiff !== 0) return statusDiff

        return (priorityOrder[a.priority as keyof typeof priorityOrder] || 99) -
               (priorityOrder[b.priority as keyof typeof priorityOrder] || 99)
      })

      // Sanitize table data to prevent encoding issues
      const tableData = sortedAssignments.map(assignment => [
        sanitizeText(assignment.person_name || 'Unknown'),
        sanitizeText(assignment.project_name || 'Unknown'),
        sanitizeText(assignment.title || assignment.notes?.substring(0, 30) || 'Untitled'),
        sanitizeText(assignment.status || 'pending'),
        sanitizeText(assignment.priority || '-'),
        formatDate(assignment.due_date || null) || '-',
        sanitizeText(assignment.role || '-'),
        sanitizeText(assignment.requester || '-')
      ])

      autoTable(doc, {
        startY: 35,
        head: [[
          'Person',
          'Project',
          'Title',
          'Status',
          'Priority',
          'Due Date',
          'Role',
          'Requester'
        ]],
        body: tableData,
        theme: 'striped',
        headStyles: {
          fillColor: [220, 38, 38],
          fontSize: 9,
          fontStyle: 'bold',
          textColor: [255, 255, 255]
        },
        styles: {
          fontSize: 8,
          cellPadding: 2,
          overflow: 'linebreak',
          cellWidth: 'wrap',
          halign: 'left',
          valign: 'middle'
        },
        columnStyles: {
          0: { cellWidth: 30 },
          1: { cellWidth: 40 },
          2: { cellWidth: 50 },
          3: { cellWidth: 22 },
          4: { cellWidth: 20 },
          5: { cellWidth: 22 },
          6: { cellWidth: 30 },
          7: { cellWidth: 30 }
        },
        margin: { left: 14, right: 14 }
      })

      // Use blob-based download for better reliability
      const pdfBlob = doc.output('blob')
      const url = window.URL.createObjectURL(pdfBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = generateFilename('pdf')
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      console.log(`✅ PDF exported successfully: ${filteredAssignments.length} assignments`)
    } catch (error) {
      console.error('Error exporting PDF:', error)
      alert(`Error exporting PDF: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`)
    }
  }

  const filteredAssignments = assignments.filter(assignment => {
    const matchesStatus = !statusFilter || assignment.status === statusFilter
    const matchesPerson = !personFilter || assignment.person_id === personFilter
    return matchesStatus && matchesPerson
  })

  const statusCounts = {
    pending: assignments.filter(a => a.status === 'pending').length,
    in_progress: assignments.filter(a => a.status === 'in_progress').length,
    complete: assignments.filter(a => a.status === 'complete').length,
    on_hold: assignments.filter(a => a.status === 'on_hold').length,
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading assignments...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Work Assignments</h1>
              <p className="mt-2 text-gray-600">
                Track all work requests, issues, and tasks for your I&P team
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={exportToCSV}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Export CSV
              </button>
              <button
                onClick={exportToPDF}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Export PDF
              </button>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                + New Assignment
              </button>
            </div>
          </div>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-yellow-600">{statusCounts.pending}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-blue-600">{statusCounts.in_progress}</div>
            <div className="text-sm text-gray-600">In Progress</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-red-600">{statusCounts.on_hold}</div>
            <div className="text-sm text-gray-600">On Hold</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-green-600">{statusCounts.complete}</div>
            <div className="text-sm text-gray-600">Complete</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="on_hold">On Hold</option>
                <option value="complete">Complete</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Person
              </label>
              <select
                value={personFilter}
                onChange={(e) => setPersonFilter(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              >
                <option value="">All People</option>
                {people.map(person => (
                  <option key={person.id} value={person.id}>{person.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Assignments List */}
        <div className="space-y-4">
          {filteredAssignments.map((assignment) => (
            <div key={assignment.id} className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {assignment.title || assignment.notes || 'Work Assignment'}
                    </h3>
                    {assignment.priority && (
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(assignment.priority)}`}>
                        {assignment.priority.toUpperCase()}
                      </span>
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-3">
                    <strong>{assignment.person_name || 'Unassigned'}</strong> working on <strong>{assignment.project_name || 'Unknown Project'}</strong>
                  </div>

                  {(assignment.description || assignment.notes) && (
                    <p className="text-gray-700 mb-3">{assignment.description || assignment.notes}</p>
                  )}

                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    {assignment.requester && <span>Requested by: {assignment.requester}</span>}
                    {assignment.due_date && (
                      <span>Due: {new Date(assignment.due_date).toLocaleDateString()}</span>
                    )}
                    {assignment.role && <span>Role: {assignment.role}</span>}
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <select
                    value={assignment.status || 'pending'}
                    onChange={async (e) => {
                      await supabase
                        .from('assignments')
                        .update({ status: e.target.value })
                        .eq('id', assignment.id)
                      fetchData()
                    }}
                    className={`px-3 py-1 text-sm rounded-full border-0 ${getStatusColor(assignment.status || 'pending')}`}
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="on_hold">On Hold</option>
                    <option value="complete">Complete</option>
                  </select>
                  
                  <button
                    onClick={() => setEditingAssignment(assignment)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Edit
                  </button>
                </div>
              </div>

              {assignment.notes && (
                <div className="border-t pt-3 mt-3">
                  <p className="text-sm text-gray-600">
                    <strong>Notes:</strong> {assignment.notes}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredAssignments.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">No assignments found.</div>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Create First Assignment
            </button>
          </div>
        )}

        {/* Assignment Form Modal */}
        {(showForm || editingAssignment) && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-screen overflow-y-auto">
              <h3 className="text-lg font-medium mb-4">
                {editingAssignment ? 'Edit Assignment' : 'New Work Assignment'}
              </h3>
              
              <form onSubmit={async (e) => {
                e.preventDefault()
                const formData = new FormData(e.target as HTMLFormElement)
                
                const data = {
                  person_id: formData.get('person_id') as string,
                  project_id: formData.get('project_id') as string,
                  title: formData.get('title') as string,
                  description: formData.get('description') as string,
                  status: formData.get('status') as string,
                  priority: formData.get('priority') as string,
                  requester: formData.get('requester') as string,
                  due_date: formData.get('due_date') as string || null,
                  role: formData.get('role') as string,
                  notes: formData.get('notes') as string,
                }
                
                if (editingAssignment) {
                  await supabase
                    .from('assignments')
                    .update(data)
                    .eq('id', editingAssignment.id)
                } else {
                  await supabase
                    .from('assignments')
                    .insert([data])
                }
                
                setShowForm(false)
                setEditingAssignment(null)
                fetchData()
              }}>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Person *</label>
                      <select
                        name="person_id"
                        required
                        defaultValue={editingAssignment?.person_id || ''}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                      >
                        <option value="">Select person...</option>
                        {people.map(person => (
                          <option key={person.id} value={person.id}>{person.name}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Project *</label>
                      <select
                        name="project_id"
                        required
                        defaultValue={editingAssignment?.project_id || ''}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                      >
                        <option value="">Select project...</option>
                        {projects.map(project => (
                          <option key={project.id} value={project.id}>
                            {project.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">What work needs to be done? *</label>
                    <input
                      name="title"
                      type="text"
                      required
                      defaultValue={editingAssignment?.title || ''}
                      placeholder="e.g., Fix dashboard filtering issues, Update hurricane data"
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Detailed Description</label>
                    <textarea
                      name="description"
                      rows={3}
                      defaultValue={editingAssignment?.description || ''}
                      placeholder="Detailed description of the issue, request, or work needed..."
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <select
                        name="status"
                        defaultValue={editingAssignment?.status || 'pending'}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="on_hold">On Hold</option>
                        <option value="complete">Complete</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Priority</label>
                      <select
                        name="priority"
                        defaultValue={editingAssignment?.priority || 'medium'}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Due Date</label>
                      <input
                        name="due_date"
                        type="date"
                        defaultValue={editingAssignment?.due_date || ''}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Who requested this?</label>
                      <input
                        name="requester"
                        type="text"
                        defaultValue={editingAssignment?.requester || ''}
                        placeholder="e.g., Jim Manson, Regional Manager"
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Role</label>
                      <input
                        name="role"
                        type="text"
                        defaultValue={editingAssignment?.role || ''}
                        placeholder="e.g., Power BI Developer, GIS Analyst"
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Notes & Updates</label>
                    <textarea
                      name="notes"
                      rows={2}
                      defaultValue={editingAssignment?.notes || ''}
                      placeholder="Additional notes, progress updates, blockers..."
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                  >
                    {editingAssignment ? 'Update Assignment' : 'Create Assignment'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false)
                      setEditingAssignment(null)
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}