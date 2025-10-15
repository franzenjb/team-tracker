import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import ActivityFeed from '@/components/ActivityFeed'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  // Fetch counts for dashboard
  const [peopleResult, projectsResult, assignmentsResult, notesResult] = await Promise.all([
    supabase.from('people').select('*', { count: 'exact', head: true }),
    supabase.from('projects').select('*', { count: 'exact', head: true }),
    supabase.from('assignments').select('*', { count: 'exact', head: true }),
    supabase.from('project_notes').select('*', { count: 'exact', head: true }),
  ])

  const stats = [
    { name: 'People', count: peopleResult.count || 0, href: '/people', color: 'bg-blue-500' },
    { name: 'Projects', count: projectsResult.count || 0, href: '/projects', color: 'bg-green-500' },
    { name: 'Assignments', count: assignmentsResult.count || 0, href: '/assignments', color: 'bg-purple-500' },
    { name: 'Notes', count: notesResult.count || 0, href: '/notes', color: 'bg-orange-500' },
  ]

  // Get recent projects
  const { data: recentProjects } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)

  // Get active projects
  const { data: activeProjects } = await supabase
    .from('projects')
    .select('*')
    .eq('status', 'active')

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.name}
            href={stat.href}
            className="relative overflow-hidden rounded-lg bg-white px-4 py-5 shadow hover:shadow-md transition-shadow sm:px-6"
          >
            <dt>
              <div className={`absolute rounded-md ${stat.color} p-3`}>
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="ml-16 truncate text-sm font-medium text-gray-500">{stat.name}</p>
            </dt>
            <dd className="ml-16 flex items-baseline">
              <p className="text-2xl font-semibold text-gray-900">{stat.count}</p>
            </dd>
          </Link>
        ))}
      </div>

      {/* Recent and Active Projects */}
      <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Active Projects */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Projects</h2>
          {activeProjects && activeProjects.length > 0 ? (
            <ul className="space-y-3">
              {activeProjects.map((project) => (
                <li key={project.id} className="border-l-4 border-green-500 pl-4">
                  <Link href={`/projects`} className="text-sm font-medium text-gray-900 hover:text-blue-600">
                    {project.name}
                  </Link>
                  <p className="text-xs text-gray-500 mt-1">{project.description}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No active projects</p>
          )}
        </div>

        {/* Recent Projects */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Projects</h2>
          {recentProjects && recentProjects.length > 0 ? (
            <ul className="space-y-3">
              {recentProjects.map((project) => (
                <li key={project.id} className="border-l-4 border-gray-300 pl-4">
                  <Link href={`/projects`} className="text-sm font-medium text-gray-900 hover:text-blue-600">
                    {project.name}
                  </Link>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      project.status === 'active' ? 'bg-green-100 text-green-800' :
                      project.status === 'planned' ? 'bg-blue-100 text-blue-800' :
                      project.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No projects yet</p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/people"
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Add Person
          </Link>
          <Link
            href="/projects"
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
          >
            Add Project
          </Link>
          <Link
            href="/assignments"
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
          >
            Add Assignment
          </Link>
          <Link
            href="/notes"
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700"
          >
            Add Note
          </Link>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="mt-8 bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <ActivityFeed />
      </div>
    </div>
  )
}
