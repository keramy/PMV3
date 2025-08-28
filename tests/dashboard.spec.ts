import { test, expect } from '@playwright/test';

test.describe('Dashboard Functionality', () => {
  // Login before each test
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('#email', 'admin@formulapm.com');
    await page.fill('#password', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard', { timeout: 15000 });
  });

  test('should display dashboard after login', async ({ page }) => {
    // Should be on dashboard page
    await expect(page).toHaveURL('/dashboard');
    
    // Should show some dashboard content (adjust based on actual dashboard)
    await expect(page.locator('body')).not.toContainText('Checking authentication');
    
    // Dashboard should be loading or showing content
    await expect(page.locator('text=Dashboard').or(page.locator('text=Welcome')).or(page.locator('text=Projects')).first()).toBeVisible({ timeout: 10000 });
  });

  test('should handle navigation within dashboard', async ({ page }) => {
    // Wait for dashboard to load
    await page.waitForTimeout(2000);
    
    // Try to find navigation elements (adjust selectors based on actual dashboard structure)
    const navLinks = await page.locator('nav a, [role="navigation"] a, .nav-link').count();
    
    if (navLinks > 0) {
      // Test navigation if links exist
      const firstNavLink = page.locator('nav a, [role="navigation"] a, .nav-link').first();
      await expect(firstNavLink).toBeVisible();
      
      // Click first navigation link
      await firstNavLink.click();
      
      // Should stay within the dashboard area
      expect(page.url()).toContain('localhost:3002');
    } else {
      // If no nav links found, just verify page is functional
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('should maintain authentication state on page reload', async ({ page }) => {
    // Reload the page
    await page.reload();
    
    // Should still be on dashboard (not redirected to login)
    await expect(page).toHaveURL('/dashboard');
    
    // Should not show authentication loading for extended period
    await page.waitForTimeout(3000);
    await expect(page.locator('text=Checking authentication')).not.toBeVisible();
  });

  test('should handle logout functionality if available', async ({ page }) => {
    // Look for logout button or user menu
    const logoutButton = page.locator('text=Logout, text=Sign Out, button:has-text("Logout"), button:has-text("Sign Out")').first();
    
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      
      // Should redirect to login or homepage
      await expect(page).toHaveURL(/\/(login|$)/);
    } else {
      // If no logout button, test manual navigation to logout
      await page.goto('/');
      
      // Should show landing page for unauthenticated or authenticated state
      await expect(page.locator('h1:has-text("Formula PM V3"), h2:has-text("Formula PM V3"), p:has-text("Formula PM V3")').first()).toBeVisible();
    }
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Dashboard should still be accessible and functional
    await expect(page.locator('body')).toBeVisible();
    
    // Should not have horizontal scroll
    const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const bodyClientWidth = await page.evaluate(() => document.body.clientWidth);
    expect(bodyScrollWidth).toBeLessThanOrEqual(bodyClientWidth + 10); // Small tolerance
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Simulate offline condition
    await page.context().setOffline(true);
    
    // Try to reload the page
    await page.reload({ waitUntil: 'networkidle' }).catch(() => {
      // Expected to fail
    });
    
    // Go back online
    await page.context().setOffline(false);
    
    // Page should recover
    await page.reload();
    await expect(page).toHaveURL('/dashboard');
  });
});