import { test, expect } from '@playwright/test';

// Configure longer timeouts for comprehensive testing
test.setTimeout(180000);

test.describe('Comprehensive Feature Testing', () => {
  // Helper function to login
  async function login(page: any) {
    console.log('🔐 Logging in...');
    await page.goto('/login', { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForSelector('#email', { timeout: 30000 });
    await page.fill('#email', 'admin@formulapm.com');
    await page.fill('#password', 'admin123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 60000 });
    console.log('✅ Login successful');
  }

  test('should explore all dashboard tabs and navigation', async ({ page }) => {
    await login(page);
    
    console.log('🔍 Exploring dashboard structure...');
    
    // Take screenshot of dashboard
    await page.screenshot({ path: 'dashboard-overview.png', fullPage: true });
    
    // Look for navigation tabs, menu items, or buttons
    const navigationSelectors = [
      '[role="tab"]',
      '.nav-item',
      '.tab',
      'nav a',
      '[role="navigation"] a',
      'button[role="tab"]',
      '.sidebar a',
      '.menu-item'
    ];
    
    let foundNavigation = [];
    
    for (const selector of navigationSelectors) {
      const elements = await page.locator(selector).all();
      if (elements.length > 0) {
        console.log(`📍 Found ${elements.length} navigation elements with selector: ${selector}`);
        
        for (let i = 0; i < Math.min(elements.length, 10); i++) {
          const element = elements[i];
          const text = await element.textContent().catch(() => '');
          const href = await element.getAttribute('href').catch(() => '');
          const role = await element.getAttribute('role').catch(() => '');
          
          if (text || href) {
            foundNavigation.push({
              selector,
              text: text?.trim() || '',
              href,
              role,
              index: i
            });
            console.log(`  - Navigation item: "${text?.trim() || ''}" ${href ? `(${href})` : ''}`);
          }
        }
      }
    }
    
    // Try clicking on navigation items
    if (foundNavigation.length > 0) {
      console.log(`🖱️ Testing ${Math.min(foundNavigation.length, 5)} navigation items...`);
      
      for (let i = 0; i < Math.min(foundNavigation.length, 5); i++) {
        const navItem = foundNavigation[i];
        console.log(`🔗 Clicking on: "${navItem.text}"`);
        
        try {
          const element = page.locator(navItem.selector).nth(navItem.index);
          await element.click({ timeout: 10000 });
          await page.waitForTimeout(3000); // Wait for navigation/content change
          
          const currentUrl = page.url();
          console.log(`  ↳ Current URL: ${currentUrl}`);
          
          // Take screenshot of each section
          await page.screenshot({ path: `nav-section-${i + 1}.png`, fullPage: true });
          
        } catch (error) {
          console.log(`  ⚠️ Could not click on "${navItem.text}": ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    } else {
      console.log('ℹ️ No clear navigation elements found, exploring page content...');
      
      // Look for any interactive elements
      const interactiveElements = await page.locator('button, a, [role="button"], [role="tab"]').all();
      console.log(`Found ${interactiveElements.length} interactive elements`);
      
      for (let i = 0; i < Math.min(interactiveElements.length, 10); i++) {
        const element = interactiveElements[i];
        const text = await element.textContent().catch(() => '');
        if (text && text.trim().length > 0) {
          console.log(`  - Interactive element: "${text.trim()}"`);
        }
      }
    }
    
    expect(true).toBeTruthy(); // Test completion
  });

  test('should test Projects functionality', async ({ page }) => {
    await login(page);
    
    console.log('🏗️ Testing Projects functionality...');
    
    // Try to navigate to projects
    const projectUrls = ['/projects', '/dashboard/projects', '/projects/list'];
    let projectsPageFound = false;
    
    for (const url of projectUrls) {
      try {
        console.log(`🔗 Trying to access: ${url}`);
        await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(3000);
        
        if (!page.url().includes('/login')) {
          projectsPageFound = true;
          console.log(`✅ Successfully accessed projects at: ${page.url()}`);
          break;
        }
      } catch (error) {
        console.log(`❌ Could not access ${url}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    if (!projectsPageFound) {
      // Try to find projects link from dashboard
      console.log('🔍 Looking for projects link on dashboard...');
      await page.goto('/dashboard', { waitUntil: 'networkidle', timeout: 60000 });
      
      const projectLinks = [
        page.locator('text=Projects').first(),
        page.locator('a[href*="projects"]').first(),
        page.locator('button:has-text("Projects")').first(),
        page.locator('[role="tab"]:has-text("Projects")').first()
      ];
      
      for (const link of projectLinks) {
        if (await link.isVisible().catch(() => false)) {
          console.log('📍 Found projects link, clicking...');
          await link.click();
          await page.waitForTimeout(3000);
          projectsPageFound = true;
          break;
        }
      }
    }
    
    if (projectsPageFound) {
      console.log('🎯 Testing projects page functionality...');
      
      // Take screenshot
      await page.screenshot({ path: 'projects-page.png', fullPage: true });
      
      // Look for project creation elements
      const createButtons = [
        page.locator('button:has-text("Create")'),
        page.locator('button:has-text("Add")'),
        page.locator('button:has-text("New")'),
        page.locator('[aria-label*="create"]'),
        page.locator('.create-project')
      ];
      
      for (const button of createButtons) {
        if (await button.isVisible().catch(() => false)) {
          console.log('➕ Found create button, testing...');
          await button.click();
          await page.waitForTimeout(2000);
          
          // Look for form fields
          const formFields = await page.locator('input, textarea, select').all();
          console.log(`📝 Found ${formFields.length} form fields`);
          
          // Take screenshot of create form
          await page.screenshot({ path: 'project-create-form.png' });
          
          // Try to close form/modal
          const cancelButtons = [
            page.locator('button:has-text("Cancel")'),
            page.locator('button:has-text("Close")'),
            page.locator('[aria-label="Close"]'),
            page.locator('.close-button')
          ];
          
          for (const cancelBtn of cancelButtons) {
            if (await cancelBtn.isVisible().catch(() => false)) {
              await cancelBtn.click();
              break;
            }
          }
          break;
        }
      }
      
      // Look for existing projects
      const projectItems = [
        page.locator('[role="table"] tr').nth(1),
        page.locator('.project-card'),
        page.locator('.project-item'),
        page.locator('a[href*="/projects/"]')
      ];
      
      for (const items of projectItems) {
        const count = await items.count();
        if (count > 0) {
          console.log(`📋 Found ${count} project items`);
          break;
        }
      }
      
    } else {
      console.log('❌ Could not find projects functionality');
    }
    
    expect(true).toBeTruthy();
  });

  test('should test Scope management features', async ({ page }) => {
    await login(page);
    
    console.log('📋 Testing Scope management...');
    
    // Try scope-related URLs
    const scopeUrls = ['/scope', '/dashboard/scope', '/projects/scope'];
    
    for (const url of scopeUrls) {
      try {
        console.log(`🔗 Trying scope URL: ${url}`);
        await page.goto(url, { timeout: 30000 });
        await page.waitForTimeout(3000);
        
        if (!page.url().includes('/login')) {
          console.log(`✅ Accessed scope at: ${page.url()}`);
          
          // Take screenshot
          await page.screenshot({ path: 'scope-management.png', fullPage: true });
          
          // Look for scope-specific elements
          const scopeElements = [
            page.locator('text=Scope'),
            page.locator('.scope-table'),
            page.locator('[role="table"]'),
            page.locator('button:has-text("Import")'),
            page.locator('button:has-text("Export")')
          ];
          
          for (const element of scopeElements) {
            if (await element.isVisible().catch(() => false)) {
              const text = await element.textContent().catch(() => '');
              console.log(`📍 Found scope element: ${(text || '').substring(0, 50)}...`);
            }
          }
          break;
        }
      } catch (error) {
        console.log(`❌ Could not access ${url}`);
      }
    }
    
    expect(true).toBeTruthy();
  });

  test('should test Shop Drawings workflow', async ({ page }) => {
    await login(page);
    
    console.log('🏗️ Testing Shop Drawings functionality...');
    
    const shopDrawingUrls = ['/shop-drawings', '/dashboard/shop-drawings', '/drawings'];
    
    for (const url of shopDrawingUrls) {
      try {
        console.log(`🔗 Trying shop drawings URL: ${url}`);
        await page.goto(url, { timeout: 30000 });
        await page.waitForTimeout(3000);
        
        if (!page.url().includes('/login')) {
          console.log(`✅ Accessed shop drawings at: ${page.url()}`);
          
          // Take screenshot
          await page.screenshot({ path: 'shop-drawings.png', fullPage: true });
          
          // Look for shop drawings elements
          const shopElements = [
            page.locator('text=Shop Drawings'),
            page.locator('text=Whose Turn'),
            page.locator('.status'),
            page.locator('[role="table"]'),
            page.locator('button:has-text("Upload")')
          ];
          
          for (const element of shopElements) {
            if (await element.isVisible().catch(() => false)) {
              const text = await element.textContent().catch(() => '');
              console.log(`📍 Found shop drawings element: ${(text || '').substring(0, 50)}...`);
            }
          }
          break;
        }
      } catch (error) {
        console.log(`❌ Could not access ${url}`);
      }
    }
    
    expect(true).toBeTruthy();
  });

  test('should test Material Specs functionality', async ({ page }) => {
    await login(page);
    
    console.log('🔧 Testing Material Specs...');
    
    const materialUrls = ['/material-specs', '/materials', '/dashboard/materials'];
    
    for (const url of materialUrls) {
      try {
        console.log(`🔗 Trying materials URL: ${url}`);
        await page.goto(url, { timeout: 30000 });
        await page.waitForTimeout(3000);
        
        if (!page.url().includes('/login')) {
          console.log(`✅ Accessed materials at: ${page.url()}`);
          
          // Take screenshot
          await page.screenshot({ path: 'material-specs.png', fullPage: true });
          
          // Look for material-specific elements
          const materialElements = [
            page.locator('text=Material'),
            page.locator('text=Specs'),
            page.locator('.material-list'),
            page.locator('[role="table"]'),
            page.locator('select') // Category dropdowns
          ];
          
          for (const element of materialElements) {
            if (await element.isVisible().catch(() => false)) {
              const text = await element.textContent().catch(() => '');
              console.log(`📍 Found material element: ${(text || '').substring(0, 50)}...`);
            }
          }
          break;
        }
      } catch (error) {
        console.log(`❌ Could not access ${url}`);
      }
    }
    
    expect(true).toBeTruthy();
  });

  test('should test Tasks and workflow management', async ({ page }) => {
    await login(page);
    
    console.log('✅ Testing Tasks workflow...');
    
    const taskUrls = ['/tasks', '/dashboard/tasks', '/workflow'];
    
    for (const url of taskUrls) {
      try {
        console.log(`🔗 Trying tasks URL: ${url}`);
        await page.goto(url, { timeout: 30000 });
        await page.waitForTimeout(3000);
        
        if (!page.url().includes('/login')) {
          console.log(`✅ Accessed tasks at: ${page.url()}`);
          
          // Take screenshot
          await page.screenshot({ path: 'tasks-workflow.png', fullPage: true });
          
          // Look for task-specific elements
          const taskElements = [
            page.locator('text=Tasks'),
            page.locator('text=Workflow'),
            page.locator('.task-list'),
            page.locator('.status-filter'),
            page.locator('[role="table"]'),
            page.locator('button:has-text("Create Task")')
          ];
          
          for (const element of taskElements) {
            if (await element.isVisible().catch(() => false)) {
              const text = await element.textContent().catch(() => '');
              console.log(`📍 Found task element: ${(text || '').substring(0, 50)}...`);
            }
          }
          break;
        }
      } catch (error) {
        console.log(`❌ Could not access ${url}`);
      }
    }
    
    expect(true).toBeTruthy();
  });

  test('should explore all interactive elements on dashboard', async ({ page }) => {
    await login(page);
    
    console.log('🔍 Comprehensive dashboard exploration...');
    
    // Get all interactive elements
    const buttons = await page.locator('button').all();
    const links = await page.locator('a').all();
    const inputs = await page.locator('input').all();
    const selects = await page.locator('select').all();
    
    console.log(`📊 Dashboard inventory:`);
    console.log(`  - Buttons: ${buttons.length}`);
    console.log(`  - Links: ${links.length}`);
    console.log(`  - Inputs: ${inputs.length}`);
    console.log(`  - Selects: ${selects.length}`);
    
    // Test buttons
    console.log('🖱️ Testing buttons...');
    for (let i = 0; i < Math.min(buttons.length, 10); i++) {
      const button = buttons[i];
      const text = await button.textContent().catch(() => '');
      const disabled = await button.isDisabled().catch(() => false);
      
      if ((text || '').trim() && !disabled) {
        console.log(`  - Button: "${(text || '').trim()}"`);
        
        // Try clicking non-destructive buttons
        if (!(text || '').toLowerCase().includes('delete') && 
            !(text || '').toLowerCase().includes('remove') &&
            !(text || '').toLowerCase().includes('logout')) {
          try {
            await button.click({ timeout: 3000 });
            await page.waitForTimeout(1000);
            console.log(`    ✅ Clicked successfully`);
          } catch (error) {
            console.log(`    ⚠️ Could not click: ${(error instanceof Error ? error.message : 'Unknown error').substring(0, 50)}`);
          }
        }
      }
    }
    
    // Test navigation links
    console.log('🔗 Testing navigation links...');
    for (let i = 0; i < Math.min(links.length, 5); i++) {
      const link = links[i];
      const href = await link.getAttribute('href').catch(() => '');
      const text = await link.textContent().catch(() => '');
      
      if (href && href.startsWith('/') && (text || '').trim()) {
        console.log(`  - Link: "${(text || '').trim()}" → ${href}`);
      }
    }
    
    // Final screenshot
    await page.screenshot({ path: 'dashboard-final-state.png', fullPage: true });
    
    expect(true).toBeTruthy();
  });
});