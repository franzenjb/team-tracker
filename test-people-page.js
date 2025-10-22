#!/usr/bin/env node
/**
 * Playwright test specifically for People page layout issues
 */

const { chromium } = require('playwright');

async function testPeoplePage() {
  console.log('🎭 Testing People page layout and edit buttons...\n');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();
  
  try {
    // Navigate to People page
    console.log('1️⃣ Navigating to People page...');
    await page.goto('https://team-tracker-k63azmaco-jbf-2539-e1ec6bfb.vercel.app/people');
    await page.waitForLoadState('networkidle');
    
    // Wait for content to load
    await page.waitForTimeout(3000);
    
    // Check if we're stuck on loading
    const loadingText = await page.locator('text=Loading').count();
    if (loadingText > 0) {
      console.log('❌ Page is stuck on loading...');
    }
    
    // Check for people table
    const table = await page.locator('table').count();
    console.log(`📊 Tables found: ${table}`);
    
    // Check for people data
    const peopleRows = await page.locator('tbody tr').count();
    console.log(`👥 People rows found: ${peopleRows}`);
    
    // Check for edit buttons
    const editButtons = await page.locator('button:has-text("Edit")').count();
    console.log(`✏️ Edit buttons found: ${editButtons}`);
    
    // Check table width and overflow
    if (table > 0) {
      const tableElement = page.locator('table').first();
      const tableBox = await tableElement.boundingBox();
      const viewportWidth = 1280;
      
      if (tableBox) {
        console.log(`📏 Table width: ${tableBox.width}px`);
        console.log(`📏 Viewport width: ${viewportWidth}px`);
        
        if (tableBox.width > viewportWidth) {
          console.log('❌ Table is wider than viewport - OVERFLOW DETECTED');
        } else {
          console.log('✅ Table fits within viewport');
        }
      }
    }
    
    // Check for specific people
    const jimFound = await page.locator('text=Jim Manson').count();
    console.log(`🔍 Jim Manson found: ${jimFound > 0 ? 'YES' : 'NO'}`);
    
    // Take screenshot for visual inspection
    await page.screenshot({ 
      path: '/Users/jefffranzen/team-tracker/people-page-test.png', 
      fullPage: true 
    });
    console.log('📸 Screenshot saved: people-page-test.png');
    
    // Test edit button functionality if available
    if (editButtons > 0) {
      console.log('\n2️⃣ Testing edit button functionality...');
      const firstEditButton = page.locator('button:has-text("Edit")').first();
      await firstEditButton.click();
      await page.waitForTimeout(2000);
      
      const editForm = await page.locator('form').count();
      if (editForm > 0) {
        console.log('✅ Edit form opened successfully');
        await page.locator('button:has-text("Cancel")').click();
        console.log('✅ Edit form canceled successfully');
      } else {
        console.log('❌ Edit form did not open');
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

if (require.main === module) {
  testPeoplePage();
}