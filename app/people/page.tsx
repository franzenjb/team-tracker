'use client'

import { useEffect, useState, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { Person } from '@/lib/types'
import PersonForm from '@/components/PersonForm'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export default function PeoplePage() {
  const [people, setPeople] = useState<Person[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingPerson, setEditingPerson] = useState<Person | undefined>()

  // Search & Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('')

  // Sort state
  const [sortField, setSortField] = useState<keyof Person>('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  useEffect(() => {
    loadPeople()
  }, [])

  async function loadPeople() {
    setLoading(true)
    const { data, error } = await supabase
      .from('people')
      .select('*')
      .order('name')

    if (data) setPeople(data)
    if (error) console.error('Error loading people:', error)
    setLoading(false)
  }

  async function deletePerson(id: string) {
    if (!confirm('Are you sure you want to delete this person?')) return

    const { error } = await supabase
      .from('people')
      .delete()
      .eq('id', id)

    if (error) {
      alert('Error deleting person: ' + error.message)
    } else {
      loadPeople()
    }
  }

  function handleEdit(person: Person) {
    setEditingPerson(person)
    setShowForm(true)
  }

  function handleFormSuccess() {
    setShowForm(false)
    setEditingPerson(undefined)
    loadPeople()
  }

  function handleCancel() {
    setShowForm(false)
    setEditingPerson(undefined)
  }

  // Get unique roles for filter
  const uniqueRoles = useMemo(() => {
    const roles = people.map(p => p.role).filter((role): role is string => role !== null && role !== undefined)
    return Array.from(new Set(roles))
  }, [people])

  // Filter and search logic
  const filteredPeople = useMemo(() => {
    return people.filter(person => {
      const matchesSearch = searchTerm === '' ||
        person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.skills?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesRole = roleFilter === '' || person.role === roleFilter

      return matchesSearch && matchesRole
    })
  }, [people, searchTerm, roleFilter])

  // Sort logic
  const sortedPeople = useMemo(() => {
    const sorted = [...filteredPeople]
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
  }, [filteredPeople, sortField, sortDirection])

  // CSV Export function
  function exportToCSV() {
    const headers = ['Name', 'Role', 'Email', 'Skills', 'Notes']
    const rows = sortedPeople.map(person => [
      person.name,
      person.role || '',
      person.email || '',
      person.skills?.join('; ') || '',
      person.notes || ''
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `people-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  // PDF Export function
  function exportToPDF() {
    const doc = new jsPDF()

    // Add title
    doc.setFontSize(18)
    doc.text("Jim's Team Tracker - People", 14, 20)

    // Add date
    doc.setFontSize(10)
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28)

    // Add table
    autoTable(doc, {
      startY: 35,
      head: [['Name', 'Role', 'Email', 'Skills']],
      body: sortedPeople.map(person => [
        person.name,
        person.role || '-',
        person.email || '-',
        person.skills?.join(', ') || '-'
      ]),
      theme: 'striped',
      headStyles: { fillColor: [37, 99, 235] }, // blue-600
    })

    // Save the PDF
    doc.save(`people-${new Date().toISOString().split('T')[0]}.pdf`)
  }

  // Handle sort
  function handleSort(field: keyof Person) {
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
          <h1 className="text-2xl font-semibold text-gray-900">People</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage team members and their information
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
            className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
          >
            {showForm ? 'Hide Form' : 'Add Person'}
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="mt-6 flex gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by name, email, or skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          />
        </div>
        <div className="w-48">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          >
            <option value="">All Roles</option>
            {uniqueRoles.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>
      </div>

      {showForm && (
        <div className="mt-8 bg-white shadow sm:rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {editingPerson ? 'Edit Person' : 'Add New Person'}
          </h2>
          <PersonForm
            person={editingPerson}
            onSuccess={handleFormSuccess}
            onCancel={handleCancel}
          />
        </div>
      )}

      <div className="mt-8">
        {sortedPeople.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">
              {people.length === 0
                ? 'No people yet. Add your first team member above!'
                : 'No results found. Try adjusting your search or filters.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sortedPeople.map((person) => (
              <div key={person.id} className="bg-white p-6 rounded-lg shadow border">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium text-gray-900 truncate">
                      {person.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {person.role || 'No role specified'}
                    </p>
                    <p className="text-sm text-gray-600 mt-1 truncate">
                      {person.email || 'No email'}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(person)}
                      className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deletePerson(person.id)}
                      className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                
                {person.skills?.length ? (
                  <div className="mt-4">
                    <h4 className="text-xs font-medium text-gray-700 uppercase tracking-wide mb-2">
                      Skills
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {person.skills.map((skill, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
                
                {person.notes && (
                  <div className="mt-4">
                    <h4 className="text-xs font-medium text-gray-700 uppercase tracking-wide mb-1">
                      Notes
                    </h4>
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {person.notes}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        {sortedPeople.length > 0 && (
          <div className="mt-6 text-sm text-gray-500 text-center">
            Showing {sortedPeople.length} of {people.length} people
          </div>
        )}
      </div>
    </div>
  )
}
