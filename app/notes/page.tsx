'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { ProjectNote, Person, Project } from '@/lib/types'

type NoteWithDetails = ProjectNote & {
  people?: Person | null
  projects?: Project
}

export default function NotesPage() {
  const [notes, setNotes] = useState<NoteWithDetails[]>([])
  const [people, setPeople] = useState<Person[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    project_id: '',
    person_id: '',
    content: '',
  })
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)

    const [notesResult, peopleResult, projectsResult] = await Promise.all([
      supabase
        .from('project_notes')
        .select(`
          *,
          people(*),
          projects(*)
        `)
        .order('created_at', { ascending: false }),
      supabase.from('people').select('*').order('name'),
      supabase.from('projects').select('*').order('name'),
    ])

    if (notesResult.data) setNotes(notesResult.data)
    if (peopleResult.data) setPeople(peopleResult.data)
    if (projectsResult.data) setProjects(projectsResult.data)

    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const data = {
      project_id: formData.project_id,
      person_id: formData.person_id || null,
      content: formData.content,
    }

    if (editingId) {
      const { error } = await supabase
        .from('project_notes')
        .update(data)
        .eq('id', editingId)

      if (error) {
        alert('Error updating note: ' + error.message)
        return
      }
    } else {
      const { error } = await supabase
        .from('project_notes')
        .insert([data])

      if (error) {
        alert('Error creating note: ' + error.message)
        return
      }
    }

    resetForm()
    loadData()
  }

  function handleEdit(note: NoteWithDetails) {
    setFormData({
      project_id: note.project_id,
      person_id: note.person_id || '',
      content: note.content,
    })
    setEditingId(note.id)
    setShowForm(true)
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this note?')) return

    const { error } = await supabase
      .from('project_notes')
      .delete()
      .eq('id', id)

    if (error) {
      alert('Error deleting note: ' + error.message)
    } else {
      loadData()
    }
  }

  function resetForm() {
    setFormData({
      project_id: '',
      person_id: '',
      content: '',
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
          <h1 className="text-2xl font-semibold text-gray-900">Project Notes</h1>
          <p className="mt-2 text-sm text-gray-700">
            Keep track of important information and updates for projects
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className="block rounded-md bg-orange-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-orange-500"
          >
            {showForm ? 'Hide Form' : 'Add Note'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="mt-8 bg-white shadow sm:rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {editingId ? 'Edit Note' : 'Add New Note'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="project_id" className="block text-sm font-medium text-gray-700">
                Project *
              </label>
              <select
                id="project_id"
                required
                value={formData.project_id}
                onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-orange-500"
              >
                <option value="">Select a project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="person_id" className="block text-sm font-medium text-gray-700">
                Author (optional)
              </label>
              <select
                id="person_id"
                value={formData.person_id}
                onChange={(e) => setFormData({ ...formData, person_id: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-orange-500"
              >
                <option value="">None</option>
                {people.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                Note Content *
              </label>
              <textarea
                id="content"
                required
                rows={4}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-orange-500"
                placeholder="Enter your note here..."
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="inline-flex justify-center rounded-md border border-transparent bg-orange-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-orange-700"
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
        {notes.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">No notes yet. Add your first project note above!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notes.map((note) => (
              <div key={note.id} className="bg-white shadow rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-sm font-semibold text-gray-900">
                        {note.projects?.name || 'Unknown Project'}
                      </h3>
                      <span className="text-sm text-gray-500">•</span>
                      <span className="text-sm text-gray-500">
                        {new Date(note.created_at).toLocaleDateString()} at{' '}
                        {new Date(note.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                    {note.people && (
                      <p className="text-xs text-gray-500 mb-2">
                        by {note.people.name}
                      </p>
                    )}
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.content}</p>
                  </div>
                  <div className="ml-4 flex gap-3">
                    <button
                      onClick={() => handleEdit(note)}
                      className="text-sm text-orange-600 hover:text-orange-900 font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(note.id)}
                      className="text-sm text-red-600 hover:text-red-900 font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
