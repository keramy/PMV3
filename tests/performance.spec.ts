import { test, expect } from '@playwright/test';

test.describe('Performance and Reliability', () => {
  test('should load homepage within performance budget', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Page should load within 5 seconds (adjust based on requirements)
    expect(loadTime).toBeLessThan(5000);
    
    // Check that main content is visible
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should load login page quickly', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/login');
    
    // Wait for form to be interactive
    await page.waitForSelector('#email');
    
    const loadTime = Date.now() - startTime;
    
    // Login page should load very quickly
    expect(loadTime).toBeLessThan(3000);
  });

  test('should handle slow network conditions', async ({ page }) => {
    // Simulate slow 3G network
    await page.route('**/*', route => {
      setTimeout(() => route.continue(), 500); // Add 500ms delay
    });
    
    await page.goto('/');
    
    // Should still load within reasonable time
    await expect(page.locator('h1')).toBeVisible({ timeout: 10000 });
  });

  test('should handle multiple concurrent users (basic)', async ({ browser }) => {
    // Create multiple pages to simulate concurrent users
    const pages = [];
    
    for (let i = 0; i < 3; i++) {
      const page = await browser.newPage();
      pages.push(page);
    }
    
    // Navigate all pages to login simultaneously
    const navigationPromises = pages.map(page => page.goto('/login'));
    await Promise.all(navigationPromises);
    
    // All pages should load successfully
    for (const page of pages) {
      await expect(page.locator('h1')).toContainText('Welcome Back');
    }
    
    // Clean up
    for (const page of pages) {
      await page.close();
    }
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Intercept API calls and return errors
    await page.route('**/api/**', route => {
      route.abort('failed');
    });
    
    await page.goto('/');
    
    // Page should still be functional even with API failures
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should maintain session across page navigations', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('#email', 'admin@formulapm.com');
    await page.fill('#password', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard', { timeout: 15000 });
    
    // Navigate to different pages
    await page.goto('/projects');
    await page.waitForTimeout(1000);
    
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/dashboard');
    
    // Session should be maintained throughout
    await expect(page.locator('body')).not.toContainText('Checking authentication');
  });

  test('should handle browser refresh without losing state', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('#email', 'admin@formulapm.com');
    await page.fill('#password', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard', { timeout: 15000 });
    
    // Refresh the page
    await page.reload();
    
    // Should maintain authentication
    await expect(page).toHaveURL('/dashboard');
  });

  test('should have reasonable bundle size (indirect test)', async ({ page }) => {
    // Monitor network requests to get an idea of bundle size
    const responses = [];
    
    page.on('response', response => {
      if (response.url().includes('.js') || response.url().includes('.css')) {
        responses.push({
          url: response.url(),
          size: response.headers()['content-length'] || '0'
        });
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check that we're not loading excessively large bundles
    const totalSize = responses.reduce((sum, response) => {
      return sum + parseInt(response.size, 10);
    }, 0);
    
    // This is a rough check - adjust based on your app's needs
    // Modern apps can be quite large, so this is just a sanity check
    expect(totalSize).toBeLessThan(10 * 1024 * 1024); // 10MB limit
  });

  test('should work without JavaScript (basic graceful degradation)', async ({ browser }) => {
    const context = await browser.newContext({
      javaScriptEnabled: false
    });
    
    const page = await context.newPage();
    
    await page.goto('/');
    
    // Should at least show basic content
    await expect(page.locator('body')).toBeVisible();
    
    // Title should be set
    await expect(page).toHaveTitle(/Formula PM/);
    
    await context.close();
  });

  test('should handle memory leaks (basic check)', async ({ page }) => {
    // Navigate between pages multiple times
    for (let i = 0; i < 5; i++) {
      await page.goto('/');
      await page.waitForTimeout(100);
      
      await page.goto('/login');
      await page.waitForTimeout(100);
    }
    
    // Check that page is still responsive
    await expect(page.locator('h1')).toBeVisible();
    
    // This is a basic test - real memory leak detection would require more sophisticated tools
  });
});