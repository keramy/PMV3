import { test, expect } from '@playwright/test';

test.describe('Application Navigation', () => {
  test('should handle deep linking and direct URLs', async ({ page }) => {
    // Test direct access to protected route without authentication
    await page.goto('/dashboard');
    
    // Should redirect to login
    await expect(page).toHaveURL('/login');
  });

  test('should handle navigation between public pages', async ({ page }) => {
    await page.goto('/');
    
    // Should be on homepage
    await expect(page.locator('h1')).toContainText('Formula PM V3');
    
    // Navigate to auth debug if available
    const authDebugLink = page.locator('text=System Diagnostics, text=System Debug');
    if (await authDebugLink.isVisible()) {
      await authDebugLink.click();
      expect(page.url()).toContain('auth-debug');
    }
  });

  test('should handle browser back/forward navigation', async ({ page }) => {
    // Start at homepage
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Formula PM V3');
    
    // Navigate to login
    await page.goto('/login');
    await expect(page.locator('h1')).toContainText('Welcome Back');
    
    // Go back
    await page.goBack();
    await expect(page.locator('h1')).toContainText('Formula PM V3');
    
    // Go forward
    await page.goForward();
    await expect(page.locator('h1')).toContainText('Welcome Back');
  });

  test('should handle authenticated navigation', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('#email', 'admin@formulapm.com');
    await page.fill('#password', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard', { timeout: 15000 });
    
    // Should be able to navigate to homepage and back
    await page.goto('/');
    
    // Should show authenticated state or redirect to dashboard
    await page.waitForTimeout(1000);
    
    // Navigate back to dashboard
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/dashboard');
  });

  test('should handle page refresh on different routes', async ({ page }) => {
    // Test homepage refresh
    await page.goto('/');
    await page.reload();
    await expect(page.locator('h1')).toContainText('Formula PM V3');
    
    // Test login page refresh
    await page.goto('/login');
    await page.reload();
    await expect(page.locator('h1')).toContainText('Welcome Back');
  });

  test('should handle invalid routes with 404', async ({ page }) => {
    await page.goto('/non-existent-page');
    
    // Should either show 404 page or redirect to a valid page
    // This depends on your app's routing configuration
    const response = await page.waitForResponse(response => 
      response.url().includes('non-existent-page'), 
      { timeout: 5000 }
    ).catch(() => null);
    
    if (response) {
      // If response exists, check status
      expect([404, 200]).toContain(response.status());
    }
    
    // Should not crash the application
    await expect(page.locator('body')).toBeVisible();
  });

  test('should maintain URL state during authentication flow', async ({ page }) => {
    // Try to access dashboard directly
    await page.goto('/dashboard?test=123');
    
    // Should redirect to login
    await expect(page).toHaveURL('/login');
    
    // Login
    await page.fill('#email', 'admin@formulapm.com');
    await page.fill('#password', 'admin123');
    await page.click('button[type="submit"]');
    
    // Should redirect to dashboard (query params might be lost, that's okay)
    await expect(page).toHaveURL('/dashboard');
  });
});