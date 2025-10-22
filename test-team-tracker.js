#!/usr/bin/env node
/**
 * Comprehensive Playwright test for Team Tracker functionality
 */

const { chromium } = require('playwright');

async function testTeamTracker() {
  console.log('🎭 Starting Team Tracker Playwright tests...\n');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Test 1: Navigate to Team Tracker
    console.log('1️⃣ Testing navigation to Team Tracker...');
    await page.goto('https://team-tracker-68vf7va1b-jbf-2539-e1ec6bfb.vercel.app/');
    await page.waitForLoadState('networkidle');
    
    const title = await page.title();
    console.log(`✅ Page loaded: ${title}`);
    
    // Test 2: Check main navigation tabs
    console.log('\n2️⃣ Testing navigation tabs...');
    const tabs = ['People', 'Projects', 'Assignments'];
    
    for (const tab of tabs) {
      const tabLink = page.locator(`nav a:has-text("${tab}")`);
      if (await tabLink.count() > 0) {
        console.log(`✅ Found ${tab} tab`);
      } else {
        console.log(`❌ Missing ${tab} tab`);
      }
    }
    
    // Test 3: Navigate to People page and test editing
    console.log('\n3️⃣ Testing People page functionality...');
    await page.click('text=People');
    await page.waitForLoadState('networkidle');
    
    // Check if people are loaded
    const peopleTable = page.locator('table');
    if (await peopleTable.count() > 0) {
      console.log('✅ People table loaded');
      
      // Check for Jim Manson
      const jimRow = page.locator('text=Jim Manson');
      if (await jimRow.count() > 0) {
        console.log('✅ Jim Manson found in people list');
        
        // Test Edit button
        const editButton = page.locator('tr:has-text("Jim Manson") button:has-text("Edit")');
        if (await editButton.count() > 0) {
          console.log('✅ Edit button found for Jim Manson');
          
          // Click edit and check form appears
          await editButton.click();
          await page.waitForTimeout(1000);
          
          const editForm = page.locator('form');
          if (await editForm.count() > 0) {
            console.log('✅ Edit form opened successfully');
            
            // Test cancel button
            await page.click('text=Cancel');
            await page.waitForTimeout(1000);
            console.log('✅ Edit form canceled successfully');
          } else {
            console.log('❌ Edit form not found');
          }
        } else {
          console.log('❌ Edit button not found');
        }
      } else {
        console.log('❌ Jim Manson not found');
      }
    } else {
      console.log('❌ People table not found');
    }
    
    // Test 4: Navigate to Projects page and test Power BI links
    console.log('\n4️⃣ Testing Projects page and Power BI links...');
    await page.click('text=Projects');
    await page.waitForLoadState('networkidle');
    
    // Check if projects are loaded
    const projectsGrid = page.locator('.grid');
    if (await projectsGrid.count() > 0) {
      console.log('✅ Projects grid loaded');
      
      // Look for Power BI dashboard links
      const powerBILinks = page.locator('a:has-text("Open Dashboard")');
      const powerBICount = await powerBILinks.count();
      
      if (powerBICount > 0) {
        console.log(`✅ Found ${powerBICount} Power BI dashboard links`);
        
        // Check if links are in blue boxes
        const blueBoxes = page.locator('.bg-blue-50');
        const blueBoxCount = await blueBoxes.count();
        console.log(`✅ Found ${blueBoxCount} blue Power BI boxes`);
      } else {
        console.log('❌ No Power BI dashboard links found');
      }
      
      // Check project count
      const projectCards = page.locator('.bg-white.shadow.rounded-lg');
      const projectCount = await projectCards.count();
      console.log(`✅ Found ${projectCount} project cards`);
      
    } else {
      console.log('❌ Projects grid not found');
    }
    
    // Test 5: Navigate to Assignments page and test assignment display
    console.log('\n5️⃣ Testing Assignments page functionality...');
    await page.click('text=Assignments');
    await page.waitForLoadState('networkidle');
    
    // Check assignment display
    const assignmentsList = page.locator('[class*="space-y"]');
    if (await assignmentsList.count() > 0) {
      console.log('✅ Assignments list loaded');
      
      // Look for Jim Manson assignments
      const jimAssignments = page.locator('text=Jim Manson working on');
      const jimAssignmentCount = await jimAssignments.count();
      
      if (jimAssignmentCount > 0) {
        console.log(`✅ Found ${jimAssignmentCount} assignments for Jim Manson`);
        console.log('✅ Assignment format shows: "Jim Manson working on [Project]"');
      } else {
        console.log('❌ No Jim Manson assignments found or wrong format');
      }
      
      // Check for "Unknown" assignments (should be fixed)
      const unknownAssignments = page.locator('text=Unknown working');
      const unknownCount = await unknownAssignments.count();
      
      if (unknownCount === 0) {
        console.log('✅ No "Unknown" assignments found - relationships fixed!');
      } else {
        console.log(`❌ Found ${unknownCount} "Unknown" assignments - needs fixing`);
      }
      
    } else {
      console.log('❌ Assignments list not found');
    }
    
    // Test 6: Take screenshot for visual verification
    console.log('\n6️⃣ Taking screenshot for visual verification...');
    await page.screenshot({ 
      path: '/Users/jefffranzen/team-tracker/team-tracker-test-screenshot.png', 
      fullPage: true 
    });
    console.log('✅ Screenshot saved: team-tracker-test-screenshot.png');
    
    console.log('\n🎉 Team Tracker testing completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

if (require.main === module) {
  testTeamTracker();
}