export default function TechSpecsPage() {
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-semibold text-gray-900 mb-8">Tech Specs</h1>

        {/* Quick Info */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Info</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Live App</p>
              <a
                href="https://team-tracker-r3z0mrjz1-jbf-2539-e1ec6bfb.vercel.app"
                target="_blank"
                className="text-blue-600 hover:text-blue-800 text-sm break-all"
              >
                team-tracker-r3z0mrjz1...
              </a>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Source Code</p>
              <a
                href="https://github.com/franzenjb/team-tracker"
                target="_blank"
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                GitHub Repository
              </a>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Built</p>
              <p className="text-sm text-gray-900">October 2025</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Database</p>
              <p className="text-sm text-gray-900">Supabase (PostgreSQL)</p>
            </div>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Technology Stack</h2>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Frontend</h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Next.js 15 - React framework</li>
                <li>• React 18 - UI library</li>
                <li>• TypeScript - Type-safe JavaScript</li>
                <li>• Tailwind CSS - Styling</li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Backend</h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Supabase - Cloud database (PostgreSQL)</li>
                <li>• Real-time data synchronization</li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Hosting</h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Vercel - Auto-deploys from GitHub</li>
                <li>• GitHub - Version control</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Database Schema */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Database Tables</h2>

          <div className="space-y-3">
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="text-sm font-semibold text-gray-900">people</h3>
              <p className="text-sm text-gray-600">Team members with roles, skills, and contact info</p>
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="text-sm font-semibold text-gray-900">projects</h3>
              <p className="text-sm text-gray-600">Projects with status, dates, and descriptions</p>
            </div>

            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="text-sm font-semibold text-gray-900">assignments</h3>
              <p className="text-sm text-gray-600">Links people to projects with roles and time allocation</p>
            </div>

            <div className="border-l-4 border-orange-500 pl-4">
              <h3 className="text-sm font-semibold text-gray-900">project_notes</h3>
              <p className="text-sm text-gray-600">Notes and updates for projects</p>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">How It Works</h2>

          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start">
              <span className="text-blue-600 font-bold mr-2">1.</span>
              <p>Your browser loads the app from Vercel</p>
            </div>
            <div className="flex items-start">
              <span className="text-blue-600 font-bold mr-2">2.</span>
              <p>When you add/edit data, it sends a request to Supabase</p>
            </div>
            <div className="flex items-start">
              <span className="text-blue-600 font-bold mr-2">3.</span>
              <p>Supabase saves it to the PostgreSQL database</p>
            </div>
            <div className="flex items-start">
              <span className="text-blue-600 font-bold mr-2">4.</span>
              <p>The page refreshes and shows your updated data</p>
            </div>
            <div className="flex items-start">
              <span className="text-blue-600 font-bold mr-2">5.</span>
              <p>Works on any device - Mac, Windows, phone, tablet</p>
            </div>
          </div>
        </div>

        {/* Making Changes */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Making Changes</h2>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">To Update the App</h3>
              <ol className="space-y-1 text-sm text-gray-600">
                <li>1. Edit code locally (in ~/team-tracker)</li>
                <li>2. Test with <code className="bg-gray-100 px-1 rounded">npm run dev</code></li>
                <li>3. Push to GitHub with <code className="bg-gray-100 px-1 rounded">git push</code></li>
                <li>4. Vercel auto-deploys in 2-3 minutes</li>
              </ol>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Key Files</h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• <code className="bg-gray-100 px-1 rounded">app/layout.tsx</code> - Navigation & branding</li>
                <li>• <code className="bg-gray-100 px-1 rounded">app/globals.css</code> - Colors & styling</li>
                <li>• <code className="bg-gray-100 px-1 rounded">app/people/page.tsx</code> - People page</li>
                <li>• <code className="bg-gray-100 px-1 rounded">supabase/schema.sql</code> - Database setup</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Costs */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Costs</h2>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">GitHub (code storage)</span>
              <span className="font-semibold text-green-600">Free</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Vercel (hosting)</span>
              <span className="font-semibold text-green-600">Free</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Supabase (database)</span>
              <span className="font-semibold text-green-600">Free</span>
            </div>
            <div className="pt-2 border-t mt-2">
              <div className="flex justify-between">
                <span className="text-gray-900 font-semibold">Total Monthly Cost</span>
                <span className="font-bold text-green-600">$0</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Free tier limits: 500MB database, 100GB bandwidth/month</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
