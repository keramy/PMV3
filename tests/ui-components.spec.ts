import { test, expect } from '@playwright/test';

test.describe('UI Components and Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should have proper page titles and meta tags', async ({ page }) => {
    // Check homepage title
    await expect(page).toHaveTitle(/Formula PM V3/);
    
    // Navigate to login and check title
    await page.goto('/login');
    await expect(page).toHaveTitle(/Formula PM V3/);
  });

  test('should have proper semantic HTML structure', async ({ page }) => {
    // Should have main content area
    const main = page.locator('main, [role="main"], .main-content').first();
    if (await main.count() > 0) {
      await expect(main).toBeVisible();
    }
    
    // Should have proper heading hierarchy
    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();
    await expect(h1).toContainText(/Formula PM|Welcome/);
  });

  test('should be keyboard accessible on login form', async ({ page }) => {
    await page.goto('/login');
    
    // Tab through the form elements
    await page.keyboard.press('Tab');
    await expect(page.locator('#email')).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.locator('#password')).toBeFocused();
    
    await page.keyboard.press('Tab');
    // Should focus on remember me checkbox or password toggle
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('should handle form validation properly', async ({ page }) => {
    await page.goto('/login');
    
    // Test HTML5 validation for email
    await page.fill('#email', 'invalid-email');
    await page.fill('#password', 'password123');
    await page.click('button[type="submit"]');
    
    // Browser should show validation message or app should handle it
    const isValid = await page.locator('#email').evaluate((el: HTMLInputElement) => el.validity.valid);
    expect(isValid).toBeFalsy();
  });

  test('should display loading states properly', async ({ page }) => {
    await page.goto('/login');
    
    // Fill form with valid credentials
    await page.fill('#email', 'admin@formulapm.com');
    await page.fill('#password', 'admin123');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Should show loading state
    const loadingButton = page.locator('button:has-text("Signing In...")');
    await expect(loadingButton).toBeVisible({ timeout: 1000 });
    
    // Button should be disabled during loading
    await expect(loadingButton).toBeDisabled();
  });

  test('should handle responsive design breakpoints', async ({ page }) => {
    // Test desktop view
    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(page.locator('body')).toBeVisible();
    
    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('body')).toBeVisible();
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('body')).toBeVisible();
    
    // Check that content is still accessible
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should handle dark mode if implemented', async ({ page }) => {
    // Check if dark mode toggle exists
    const darkModeToggle = page.locator('[aria-label*="dark"], [aria-label*="theme"], .dark-mode-toggle');
    
    if (await darkModeToggle.count() > 0) {
      // Test dark mode toggle
      await darkModeToggle.click();
      
      // Check if dark classes are applied
      const bodyClasses = await page.locator('body').getAttribute('class');
      expect(bodyClasses).toContain('dark');
    } else {
      // If no dark mode toggle, just ensure light mode works
      const bodyClasses = await page.locator('body').getAttribute('class');
      expect(bodyClasses || '').not.toContain('dark');
    }
  });

  test('should display error messages accessibly', async ({ page }) => {
    await page.goto('/login');
    
    // Trigger validation error
    await page.click('button[type="submit"]');
    
    // Should show error message
    const errorMessage = page.locator('[role="alert"], .error-message, .text-red');
    if (await errorMessage.count() > 0) {
      await expect(errorMessage.first()).toBeVisible();
      
      // Error should have proper ARIA attributes
      const hasAriaRole = await errorMessage.first().getAttribute('role');
      expect(hasAriaRole).toBeTruthy();
    }
  });

  test('should handle focus management', async ({ page }) => {
    await page.goto('/login');
    
    // Focus should be properly managed when interacting with form
    await page.click('#email');
    await expect(page.locator('#email')).toBeFocused();
    
    // Focus should move appropriately
    await page.keyboard.press('Tab');
    await expect(page.locator('#password')).toBeFocused();
  });

  test('should have proper color contrast', async ({ page }) => {
    await page.goto('/login');
    
    // This is a basic test - in real scenarios you'd use accessibility testing tools
    // Check that text is visible (basic contrast check)
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    
    // Ensure buttons have sufficient visual distinction
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeVisible();
    
    const buttonStyles = await submitButton.evaluate(el => {
      const computed = window.getComputedStyle(el);
      return {
        backgroundColor: computed.backgroundColor,
        color: computed.color
      };
    });
    
    // Basic check that colors are different
    expect(buttonStyles.backgroundColor).not.toBe(buttonStyles.color);
  });
});