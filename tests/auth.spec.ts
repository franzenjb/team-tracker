import { test, expect } from '@playwright/test'

const BASE_URL = 'https://jim-manson-team-tracker.vercel.app'
const ADMIN_PASSWORD = 'manson2025'

test.describe('Authentication System', () => {

  test('✅ PUBLIC: Dashboard is accessible without login', async ({ page }) => {
    await page.goto(BASE_URL)
    await expect(page).toHaveTitle(/Jim.*Team Tracker/)

    // Should see dashboard content
    await expect(page.locator('nav a[href="/people"]')).toBeVisible()
    await expect(page.locator('nav a[href="/projects"]')).toBeVisible()
    await expect(page.locator('text=Recent Activity')).toBeVisible()

    // Should see "Admin Login" button (not logged in)
    await expect(page.locator('text=Admin Login')).toBeVisible()

    console.log('✅ Dashboard accessible without login')
  })

  test('🔒 PROTECTED: /people redirects to login when not authenticated', async ({ page }) => {
    await page.goto(`${BASE_URL}/people`)

    // Should redirect to login page
    await expect(page).toHaveURL(/\/login/)
    await expect(page.locator('text=Admin Login')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()

    console.log('✅ Protected page redirected to login')
  })

  test('🔑 LOGIN: Can login with correct password (manson2025)', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`)

    // Enter password
    await page.fill('input[type="password"]', ADMIN_PASSWORD)
    await page.click('button[type="submit"]')

    // Should redirect to People page after successful login
    await expect(page).toHaveURL(`${BASE_URL}/people`)
    await expect(page.locator('text=Manage team members')).toBeVisible()

    // Should see "Logout" button (logged in)
    await expect(page.locator('button:has-text("Logout")')).toBeVisible()

    console.log('✅ Login successful with password: manson2025')
  })

  test('🔓 AUTHENTICATED: Can access all protected pages after login', async ({ page }) => {
    // Login first
    await page.goto(`${BASE_URL}/login`)
    await page.fill('input[type="password"]', ADMIN_PASSWORD)
    await page.click('button[type="submit"]')
    await page.waitForURL(`${BASE_URL}/people`)

    // Test People page
    await page.goto(`${BASE_URL}/people`)
    await expect(page.locator('text=Manage team members')).toBeVisible()
    console.log('✅ People page accessible')

    // Test Projects page
    await page.goto(`${BASE_URL}/projects`)
    await expect(page.locator('text=Manage all your team projects')).toBeVisible()
    console.log('✅ Projects page accessible')

    // Test Assignments page
    await page.goto(`${BASE_URL}/assignments`)
    await expect(page.locator('text=Link people to projects')).toBeVisible()
    console.log('✅ Assignments page accessible')

    // Test Notes page
    await page.goto(`${BASE_URL}/notes`)
    await expect(page.locator('text=Keep track of important information and updates for projects')).toBeVisible()
    console.log('✅ Notes page accessible')
  })

  test('🚪 LOGOUT: Logout works and redirects to dashboard', async ({ page }) => {
    // Login first
    await page.goto(`${BASE_URL}/login`)
    await page.fill('input[type="password"]', ADMIN_PASSWORD)
    await page.click('button[type="submit"]')
    await page.waitForURL(`${BASE_URL}/people`)

    // Click logout
    await page.click('button:has-text("Logout")')

    // Should redirect to dashboard
    await expect(page).toHaveURL(BASE_URL)

    // Should see "Admin Login" button again
    await expect(page.locator('text=Admin Login')).toBeVisible()

    console.log('✅ Logout successful')
  })

  test('❌ LOGIN: Invalid password shows error', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`)

    // Try wrong password
    await page.fill('input[type="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')

    // Should show error message
    await expect(page.locator('text=Invalid password')).toBeVisible()

    // Should still be on login page
    await expect(page).toHaveURL(/\/login/)

    console.log('✅ Invalid password rejected correctly')
  })

  test('🔒 PROTECTED: Cannot access protected pages after logout', async ({ page }) => {
    // Login
    await page.goto(`${BASE_URL}/login`)
    await page.fill('input[type="password"]', ADMIN_PASSWORD)
    await page.click('button[type="submit"]')
    await page.waitForURL(`${BASE_URL}/people`)

    // Logout
    await page.click('button:has-text("Logout")')
    await page.waitForURL(BASE_URL)

    // Try to access protected page
    await page.goto(`${BASE_URL}/projects`)

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/)

    console.log('✅ Protected pages blocked after logout')
  })
})
