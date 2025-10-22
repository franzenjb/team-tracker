#!/usr/bin/env node
/**
 * Test the new card layout people page
 */

const { chromium } = require('playwright');

async function testNewPeoplePage() {
  console.log('🎭 Testing NEW card layout People page...\n');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();
  
  try {
    // Navigate to the NEW deployment
    console.log('1️⃣ Navigating to NEW People page...');
    await page.goto('https://team-tracker-q4stiy1fg-jbf-2539-e1ec6bfb.vercel.app/people');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Check for card layout instead of table
    const cards = await page.locator('.grid .bg-white.shadow.border').count();
    const tables = await page.locator('table').count();
    
    console.log(`🃏 People cards found: ${cards}`);
    console.log(`📊 Tables found: ${tables}`);
    
    if (cards > 0) {
      console.log('✅ NEW CARD LAYOUT DETECTED!');
      
      // Check edit buttons on cards
      const editButtons = await page.locator('button:has-text("Edit")').count();
      console.log(`✏️ Edit buttons found: ${editButtons}`);
      
      // Test card responsiveness
      const cardGrid = page.locator('.grid').first();
      const gridBox = await cardGrid.boundingBox();
      
      if (gridBox) {
        console.log(`📏 Grid width: ${gridBox.width}px (should fit in 1280px viewport)`);
        if (gridBox.width <= 1280) {
          console.log('✅ Grid fits within viewport - NO OVERFLOW!');
        } else {
          console.log('❌ Grid still overflows viewport');
        }
      }
      
      // Test edit button functionality and scroll
      if (editButtons > 0) {
        console.log('\n2️⃣ Testing edit button and scroll functionality...');
        
        // Scroll to bottom first
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(1000);
        
        const scrollBefore = await page.evaluate(() => window.pageYOffset);
        console.log(`📏 Scroll position before clicking edit: ${scrollBefore}px`);
        
        // Click edit button
        const firstEditButton = page.locator('button:has-text("Edit")').first();
        await firstEditButton.click();
        await page.waitForTimeout(2000);
        
        const scrollAfter = await page.evaluate(() => window.pageYOffset);
        console.log(`📏 Scroll position after clicking edit: ${scrollAfter}px`);
        
        if (scrollAfter < scrollBefore) {
          console.log('✅ Page scrolled to top successfully!');
        } else {
          console.log('❌ Page did not scroll to top');
        }
        
        // Check if form opened
        const editForm = await page.locator('form').count();
        if (editForm > 0) {
          console.log('✅ Edit form opened successfully');
          await page.locator('button:has-text("Cancel")').click();
          console.log('✅ Edit form canceled successfully');
        }
      }
      
    } else if (tables > 0) {
      console.log('❌ Still showing OLD TABLE LAYOUT - deployment not updated');
    } else {
      console.log('❌ No cards or tables found - page may not be loading');
    }
    
    // Take screenshot
    await page.screenshot({ 
      path: '/Users/jefffranzen/team-tracker/new-people-page-test.png', 
      fullPage: true 
    });
    console.log('📸 Screenshot saved: new-people-page-test.png');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

if (require.main === module) {
  testNewPeoplePage();
}