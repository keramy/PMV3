import { test, expect } from '@playwright/test';

// Configure longer timeouts for slow loading
test.setTimeout(90000);

test.describe('Basic Smoke Tests', () => {
  test('should load homepage successfully', async ({ page }) => {
    // Navigate to homepage with longer timeout
    await page.goto('/', { waitUntil: 'networkidle', timeout: 60000 });
    
    // Wait for any element to be visible
    await page.waitForSelector('body', { timeout: 30000 });
    
    // Check that page loaded
    await expect(page.locator('body')).toBeVisible();
    
    // Take screenshot for debugging
    await page.screenshot({ path: 'homepage-smoke-test.png' });
    
    console.log('Homepage loaded successfully');
  });

  test('should load login page successfully', async ({ page }) => {
    // Navigate to login with longer timeout
    await page.goto('/login', { waitUntil: 'networkidle', timeout: 60000 });
    
    // Wait for form to be visible
    await page.waitForSelector('form, .login-form, #email', { timeout: 30000 });
    
    // Check basic elements
    await expect(page.locator('body')).toBeVisible();
    
    // Take screenshot for debugging
    await page.screenshot({ path: 'login-smoke-test.png' });
    
    console.log('Login page loaded successfully');
  });

  test('should attempt login with provided credentials', async ({ page }) => {
    // Navigate to login
    await page.goto('/login', { waitUntil: 'networkidle', timeout: 60000 });
    
    // Wait for form elements
    await page.waitForSelector('#email', { timeout: 30000 });
    await page.waitForSelector('#password', { timeout: 30000 });
    
    // Fill credentials
    await page.fill('#email', 'admin@formulapm.com');
    await page.fill('#password', 'admin123');
    
    // Take screenshot before submitting
    await page.screenshot({ path: 'before-login-attempt.png' });
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for some response (either success or error)
    await page.waitForTimeout(5000);
    
    // Take screenshot after attempting login
    await page.screenshot({ path: 'after-login-attempt.png' });
    
    // Check current URL to see what happened
    console.log('Current URL after login attempt:', page.url());
    
    // Verify we're still functional
    await expect(page.locator('body')).toBeVisible();
  });
});