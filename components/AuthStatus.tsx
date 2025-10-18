'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useState } from 'react'

export default function AuthStatus() {
  const router = useRouter()
  const pathname = usePathname()
  const [loading, setLoading] = useState(false)

  // Check if we're on a protected route
  const isProtectedRoute = ['/people', '/projects', '/assignments', '/notes'].some(
    path => pathname?.startsWith(path)
  )

  async function handleLogout() {
    setLoading(true)
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      setLoading(false)
    }
  }

  // If on login page, don't show anything
  if (pathname === '/login') {
    return null
  }

  // If on protected route, show logout button
  if (isProtectedRoute) {
    return (
      <button
        onClick={handleLogout}
        disabled={loading}
        className="ml-3 inline-flex items-center px-3 py-1 text-sm font-medium text-white bg-red-600 hover:bg-red-700 border border-red-700 rounded-md disabled:opacity-50"
      >
        {loading ? 'Logging out...' : 'Logout'}
      </button>
    )
  }

  // On public pages, show login button
  return (
    <a
      href="/login"
      className="ml-3 inline-flex items-center px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-700 border border-blue-600 rounded-md hover:border-blue-700"
    >
      Admin Login
    </a>
  )
}
