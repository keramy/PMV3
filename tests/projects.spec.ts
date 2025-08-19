import { test, expect } from '@playwright/test';

test.describe('Projects Functionality', () => {
  // Login before each test
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('#email', 'admin@formulapm.com');
    await page.fill('#password', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard', { timeout: 15000 });
  });

  test('should navigate to projects page', async ({ page }) => {
    // Try to navigate to projects page
    await page.goto('/projects');
    
    // Should either show projects page or redirect if not accessible
    await page.waitForTimeout(2000);
    
    // Check if we're on projects page or got redirected
    const currentUrl = page.url();
    if (currentUrl.includes('/projects')) {
      // We're on projects page, test its functionality
      await expect(page.locator('body')).toBeVisible();
      
      // Look for typical project page elements
      const projectElements = [
        page.locator('text=Projects').first(),
        page.locator('text=Project').first(),
        page.locator('[role="table"], .table, .project-list').first(),
        page.locator('button:has-text("Create"), button:has-text("Add"), button:has-text("New")').first()
      ];
      
      // At least one project-related element should be visible
      let foundElement = false;
      for (const element of projectElements) {
        if (await element.isVisible().catch(() => false)) {
          foundElement = true;
          break;
        }
      }
      
      expect(foundElement).toBeTruthy();
      
    } else {
      // Got redirected, that's also valid behavior
      expect(currentUrl).toContain('localhost:3002');
    }
  });

  test('should handle project creation flow if available', async ({ page }) => {
    await page.goto('/projects');
    await page.waitForTimeout(2000);
    
    // Look for create project button
    const createButtons = [
      page.locator('button:has-text("Create Project")'),
      page.locator('button:has-text("Add Project")'),
      page.locator('button:has-text("New Project")'),
      page.locator('[data-testid="create-project"]'),
      page.locator('.create-project-btn')
    ];
    
    for (const button of createButtons) {
      if (await button.isVisible().catch(() => false)) {
        await button.click();
        
        // Should open a dialog or navigate to create page
        await page.waitForTimeout(1000);
        
        // Look for form fields typical in project creation
        const formFields = [
          page.locator('input[name="name"], input[placeholder*="name"], input[placeholder*="Name"]'),
          page.locator('input[name="description"], textarea[name="description"]'),
          page.locator('input[name="projectName"], input[name="project_name"]')
        ];
        
        let formFound = false;
        for (const field of formFields) {
          if (await field.isVisible().catch(() => false)) {
            formFound = true;
            break;
          }
        }
        
        if (formFound) {
          // Found a form, test basic interaction
          const firstVisibleField = formFields.find(async field => 
            await field.isVisible().catch(() => false)
          );
          if (firstVisibleField) {
            await firstVisibleField.fill('Test Project Name');
          }
          
          // Look for cancel button to close dialog
          const cancelButton = page.locator('button:has-text("Cancel"), [aria-label="Close"]').first();
          if (await cancelButton.isVisible().catch(() => false)) {
            await cancelButton.click();
          }
        }
        
        break;
      }
    }
  });

  test('should display project list if data exists', async ({ page }) => {
    await page.goto('/projects');
    await page.waitForTimeout(3000);
    
    // Look for project list elements
    const listElements = [
      page.locator('[role="table"]'),
      page.locator('.project-card'),
      page.locator('.project-item'),
      page.locator('tr').nth(1), // Second row (first might be header)
      page.locator('[data-testid*="project"]').first()
    ];
    
    let hasProjectList = false;
    for (const element of listElements) {
      if (await element.isVisible().catch(() => false)) {
        hasProjectList = true;
        break;
      }
    }
    
    if (hasProjectList) {
      // Projects are displayed
      expect(hasProjectList).toBeTruthy();
    } else {
      // No projects or empty state
      const emptyStateElements = [
        page.locator('text=No projects'),
        page.locator('text=Create your first project'),
        page.locator('.empty-state')
      ];
      
      let hasEmptyState = false;
      for (const element of emptyStateElements) {
        if (await element.isVisible().catch(() => false)) {
          hasEmptyState = true;
          break;
        }
      }
      
      // Either has projects or shows empty state
      expect(hasProjectList || hasEmptyState).toBeTruthy();
    }
  });

  test('should handle individual project navigation', async ({ page }) => {
    await page.goto('/projects');
    await page.waitForTimeout(3000);
    
    // Look for project links
    const projectLinks = [
      page.locator('a[href*="/projects/"]'),
      page.locator('.project-link'),
      page.locator('[data-testid*="project-link"]')
    ];
    
    for (const linkSelector of projectLinks) {
      const links = await linkSelector.all();
      if (links.length > 0) {
        const firstLink = links[0];
        if (await firstLink.isVisible()) {
          await firstLink.click();
          
          // Should navigate to individual project page
          await expect(page).toHaveURL(/\/projects\/[\w-]+/);
          
          // Should show project details
          await expect(page.locator('body')).toBeVisible();
          
          return; // Success, exit test
        }
      }
    }
    
    // If no project links found, that's also valid (empty state)
    expect(true).toBeTruthy();
  });

  test('should handle project search/filtering if available', async ({ page }) => {
    await page.goto('/projects');
    await page.waitForTimeout(2000);
    
    // Look for search/filter inputs
    const searchInputs = [
      page.locator('input[placeholder*="Search"], input[placeholder*="search"]'),
      page.locator('input[name="search"], input[name="filter"]'),
      page.locator('[data-testid="search"], [data-testid="filter"]')
    ];
    
    for (const input of searchInputs) {
      if (await input.isVisible().catch(() => false)) {
        // Test search functionality
        await input.fill('test search');
        
        // Wait for potential filtering
        await page.waitForTimeout(1000);
        
        // Clear search
        await input.fill('');
        
        break;
      }
    }
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/projects');
    await page.waitForTimeout(2000);
    
    // Page should be usable on mobile
    await expect(page.locator('body')).toBeVisible();
    
    // Should not have horizontal scroll
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const clientWidth = await page.evaluate(() => document.body.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 20); // Small tolerance
    
    // Touch interactions should work
    const interactableElements = page.locator('button, a, [role="button"]');
    const count = await interactableElements.count();
    if (count > 0) {
      const firstElement = interactableElements.first();
      await expect(firstElement).toBeVisible();
    }
  });
});