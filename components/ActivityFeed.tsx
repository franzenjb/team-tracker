'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Person, Project, Assignment, ProjectNote } from '@/lib/types'
import Link from 'next/link'

type Activity = {
  id: string
  type: 'person' | 'project' | 'assignment' | 'note'
  title: string
  description: string
  timestamp: string
  link: string
}

export default function ActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadActivities()
  }, [])

  async function loadActivities() {
    setLoading(true)

    const [peopleResult, projectsResult, assignmentsResult, notesResult] = await Promise.all([
      supabase.from('people').select('*').order('created_at', { ascending: false }).limit(5),
      supabase.from('projects').select('*').order('created_at', { ascending: false }).limit(5),
      supabase
        .from('assignments')
        .select(`
          *,
          people(*),
          projects(*)
        `)
        .order('created_at', { ascending: false })
        .limit(5),
      supabase.from('project_notes').select('*, projects(*)').order('created_at', { ascending: false }).limit(5),
    ])

    const activities: Activity[] = []

    // Add people
    if (peopleResult.data) {
      peopleResult.data.forEach((person: Person) => {
        if (person.created_at) {
          activities.push({
            id: person.id,
            type: 'person',
            title: `New team member: ${person.name}`,
            description: person.role || 'Team member',
            timestamp: person.created_at,
            link: '/people',
          })
        }
      })
    }

    // Add projects
    if (projectsResult.data) {
      projectsResult.data.forEach((project: Project) => {
        if (project.created_at) {
          activities.push({
            id: project.id,
            type: 'project',
            title: `New project: ${project.name}`,
            description: project.description || 'Project added',
            timestamp: project.created_at,
            link: '/projects',
          })
        }
      })
    }

    // Add assignments
    if (assignmentsResult.data) {
      assignmentsResult.data.forEach((assignment: any) => {
        if (assignment.created_at) {
          activities.push({
            id: assignment.id,
            type: 'assignment',
            title: `${assignment.people?.name || 'Someone'} assigned to ${assignment.projects?.name || 'project'}`,
            description: assignment.role || 'Assignment created',
            timestamp: assignment.created_at,
            link: '/assignments',
          })
        }
      })
    }

    // Add notes
    if (notesResult.data) {
      notesResult.data.forEach((note: any) => {
        if (note.created_at) {
          activities.push({
            id: note.id,
            type: 'note',
            title: `Note added to ${note.projects?.name || 'project'}`,
            description: note.content?.substring(0, 50) || 'Note created',
            timestamp: note.created_at,
            link: '/notes',
          })
        }
      })
    }

    // Sort all activities by timestamp and take top 10
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    setActivities(activities.slice(0, 10))
    setLoading(false)
  }

  function getActivityIcon(type: string) {
    switch (type) {
      case 'person':
        return '👤'
      case 'project':
        return '📁'
      case 'assignment':
        return '🔗'
      case 'note':
        return '📝'
      default:
        return '•'
    }
  }

  function getActivityColor(type: string) {
    switch (type) {
      case 'person':
        return 'bg-blue-100 text-blue-800'
      case 'project':
        return 'bg-green-100 text-green-800'
      case 'assignment':
        return 'bg-purple-100 text-purple-800'
      case 'note':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return <div className="text-sm text-gray-500">Loading activity...</div>
  }

  if (activities.length === 0) {
    return <div className="text-sm text-gray-500">No recent activity</div>
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <Link key={`${activity.type}-${activity.id}`} href={activity.link}>
          <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-lg ${getActivityColor(activity.type)}`}>
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{activity.title}</p>
              <p className="text-xs text-gray-500 truncate">{activity.description}</p>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(activity.timestamp).toLocaleDateString()} at{' '}
                {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
