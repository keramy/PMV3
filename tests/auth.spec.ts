import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Go to the homepage
    await page.goto('/');
  });

  test('should display landing page for unauthenticated users', async ({ page }) => {
    // Should show the landing page
    await expect(page.locator('h1')).toContainText('Formula PM V3');
    await expect(page.locator('text=Revolutionary Construction Project Management')).toBeVisible();
    
    // Should show login button
    await expect(page.locator('text=Login to Dashboard')).toBeVisible();
    
    // Should show status cards
    await expect(page.locator('text=Foundation Complete')).toBeVisible();
    await expect(page.locator('text=Revolutionary Workflows')).toBeVisible();
    await expect(page.locator('text=Secure & Fast')).toBeVisible();
  });

  test('should navigate to login page', async ({ page }) => {
    // Click login button
    await page.click('text=Login to Dashboard');
    
    // Should be on login page
    await expect(page).toHaveURL('/login');
    await expect(page.locator('h1')).toContainText('Welcome Back');
    await expect(page.locator('text=Sign in to your construction management workspace')).toBeVisible();
    
    // Should have email and password fields
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toContainText('Sign In to Formula PM');
  });

  test('should show validation errors for empty form', async ({ page }) => {
    await page.goto('/login');
    
    // Clear any existing values and ensure fields are empty
    await page.fill('[data-testid="email-input"]', '');
    await page.fill('[data-testid="password-input"]', '');
    
    // Try to submit empty form (use evaluate to bypass HTML5 validation)
    await page.evaluate(() => {
      const form = document.querySelector('form');
      if (form) {
        const event = new Event('submit', { bubbles: true, cancelable: true });
        form.dispatchEvent(event);
      }
    });
    
    // Should show error message - check for the actual error display
    await expect(page.locator('text=Please fill in both email and password')).toBeVisible({ timeout: 10000 });
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    // Fill in invalid credentials
    await page.fill('[data-testid="email-input"]', 'invalid@test.com');
    await page.fill('[data-testid="password-input"]', 'wrongpassword');
    
    // Submit form
    await page.click('[data-testid="login-submit"]');
    
    // Wait for error message to appear (either message is acceptable)
    await expect(page.locator('text=Invalid login credentials').first()).toBeVisible({ timeout: 10000 });
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    await page.goto('/login');
    
    // Fill in valid credentials
    await page.fill('[data-testid="email-input"]', 'admin@formulapm.com');
    await page.fill('[data-testid="password-input"]', 'admin123');
    
    // Submit form
    await page.click('[data-testid="login-submit"]');
    
    // Should show loading state
    await expect(page.locator('text=Signing In...')).toBeVisible();
    
    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard', { timeout: 15000 });
    
    // Should show dashboard content
    await expect(page.locator('text=Dashboard').first()).toBeVisible({ timeout: 10000 });
  });

  test('should handle remember me functionality', async ({ page }) => {
    await page.goto('/login');
    
    // Fill in credentials and check remember me
    await page.fill('[data-testid="email-input"]', 'admin@formulapm.com');
    await page.check('[data-testid="remember-me-checkbox"]');
    await page.fill('[data-testid="password-input"]', 'admin123');
    
    // Submit form
    await page.click('[data-testid="login-submit"]');
    
    // Wait for redirect
    await page.waitForURL('/dashboard', { timeout: 15000 });
    
    // Navigate back to login page to test remember me
    await page.goto('/login');
    
    // Email should be pre-filled
    await expect(page.locator('[data-testid="email-input"]')).toHaveValue('admin@formulapm.com');
    await expect(page.locator('[data-testid="remember-me-checkbox"]')).toBeChecked();
  });

  test('should toggle password visibility', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('[data-testid="password-input"]', 'testpassword');
    
    // Password should be hidden by default
    await expect(page.locator('[data-testid="password-input"]')).toHaveAttribute('type', 'password');
    
    // Click eye icon to show password
    await page.click('[data-testid="password-toggle"]');
    await expect(page.locator('[data-testid="password-input"]')).toHaveAttribute('type', 'text');
    
    // Click again to hide password
    await page.click('[data-testid="password-toggle"]');
    await expect(page.locator('[data-testid="password-input"]')).toHaveAttribute('type', 'password');
  });
});