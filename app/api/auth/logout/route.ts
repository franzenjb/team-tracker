import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  // Delete the auth cookie
  const cookieStore = await cookies()
  cookieStore.delete('admin-auth')

  return NextResponse.json({ success: true })
}
