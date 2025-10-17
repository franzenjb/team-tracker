import './globals.css'
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'

export const metadata: Metadata = {
  title: "Jim's Team Tracker",
  description: 'Modern team and project management system',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-gray-50">
          <nav className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex">
                  <Link href="/" className="flex items-center gap-3 px-2 text-gray-900 font-semibold text-xl">
                    <Image
                      src="/jim-manson.jpg"
                      alt="Jim Manson"
                      width={40}
                      height={40}
                      className="rounded-full object-cover"
                    />
                    <span>Jim's Team Tracker</span>
                  </Link>
                  <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                    <Link
                      href="/people"
                      className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-blue-600"
                    >
                      People
                    </Link>
                    <Link
                      href="/projects"
                      className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-blue-600"
                    >
                      Projects
                    </Link>
                    <Link
                      href="/assignments"
                      className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-blue-600"
                    >
                      Assignments
                    </Link>
                    <Link
                      href="/notes"
                      className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-blue-600"
                    >
                      Notes
                    </Link>
                  </div>
                </div>
                <div className="flex items-center">
                  <Link
                    href="/tech-specs"
                    className="inline-flex items-center px-3 py-1 text-sm font-medium text-gray-600 hover:text-blue-600 border border-gray-300 rounded-md hover:border-blue-400"
                  >
                    Tech Specs
                  </Link>
                </div>
              </div>
            </div>
          </nav>
          <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
