import { test, expect } from '@playwright/test';

// Configure longer timeouts for slow loading
test.setTimeout(120000);

test.describe('Authentication Flow Tests', () => {
  test('should complete full authentication flow', async ({ page }) => {
    console.log('Starting authentication flow test...');
    
    // 1. Navigate to homepage
    await page.goto('/', { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForSelector('body', { timeout: 30000 });
    console.log('✅ Homepage loaded');
    
    // 2. Check if we see landing page elements
    const landingElements = await Promise.all([
      page.locator('h1:has-text("Formula PM")').isVisible().catch(() => false),
      page.locator('text=Login').isVisible().catch(() => false),
      page.locator('text=Construction').isVisible().catch(() => false)
    ]);
    
    if (landingElements.some(visible => visible)) {
      console.log('✅ Landing page elements detected');
      
      // Look for login button
      const loginButtons = [
        page.locator('text=Login to Dashboard'),
        page.locator('a[href="/login"]'),
        page.locator('button:has-text("Login")')
      ];
      
      let loginButtonClicked = false;
      for (const button of loginButtons) {
        if (await button.isVisible().catch(() => false)) {
          console.log('✅ Found login button, clicking...');
          await button.click();
          loginButtonClicked = true;
          break;
        }
      }
      
      if (!loginButtonClicked) {
        console.log('ℹ️ No login button found, navigating directly to /login');
        await page.goto('/login', { waitUntil: 'networkidle', timeout: 60000 });
      }
    } else {
      console.log('ℹ️ Landing page not detected, user might already be logged in or redirected');
      await page.goto('/login', { waitUntil: 'networkidle', timeout: 60000 });
    }
    
    // 3. Fill login form
    await page.waitForSelector('#email', { timeout: 30000 });
    console.log('✅ Login form loaded');
    
    await page.fill('#email', 'admin@formulapm.com');
    await page.fill('#password', 'admin123');
    console.log('✅ Credentials filled');
    
    // 4. Submit login
    await page.click('button[type="submit"]');
    console.log('✅ Login submitted');
    
    // 5. Wait for redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 60000 });
    console.log('✅ Redirected to dashboard');
    
    // 6. Verify dashboard content
    await page.waitForTimeout(5000); // Give dashboard time to load
    
    // Check for dashboard indicators
    const dashboardLoaded = await page.locator('body').evaluate(() => {
      const text = document.body.textContent || '';
      return !text.includes('Checking authentication') && !text.includes('Loading...');
    });
    
    expect(dashboardLoaded).toBeTruthy();
    console.log('✅ Dashboard loaded and functional');
    
    // 7. Test navigation persistence
    await page.reload();
    await page.waitForTimeout(3000);
    await expect(page).toHaveURL(/\/dashboard/);
    console.log('✅ Authentication persisted after reload');
    
    console.log('🎉 Full authentication flow completed successfully!');
  });

  test('should handle invalid credentials gracefully', async ({ page }) => {
    console.log('Testing invalid credentials handling...');
    
    await page.goto('/login', { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForSelector('#email', { timeout: 30000 });
    
    // Try invalid credentials
    await page.fill('#email', 'invalid@test.com');
    await page.fill('#password', 'wrongpassword');
    
    await page.click('button[type="submit"]');
    
    // Should either show error message or stay on login page
    await page.waitForTimeout(10000);
    
    const currentUrl = page.url();
    const hasErrorMessage = await page.locator('text=Invalid, text=Error, text=failed, .error').first().isVisible().catch(() => false);
    
    // Either should stay on login page or show error
    const handledGracefully = currentUrl.includes('/login') || hasErrorMessage;
    expect(handledGracefully).toBeTruthy();
    
    console.log(`✅ Invalid credentials handled gracefully (${hasErrorMessage ? 'error shown' : 'stayed on login'})`);
  });

  test('should be responsive on mobile', async ({ page }) => {
    console.log('Testing mobile responsiveness...');
    
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Test homepage on mobile
    await page.goto('/', { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(3000);
    
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const clientWidth = await page.evaluate(() => document.body.clientWidth);
    
    // Should not have significant horizontal scroll
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 50);
    console.log('✅ Homepage is mobile responsive');
    
    // Test login page on mobile
    await page.goto('/login', { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForSelector('#email', { timeout: 30000 });
    
    // Should be able to interact with form elements
    await page.fill('#email', 'test@example.com');
    await page.fill('#password', 'testpass');
    
    console.log('✅ Login form is functional on mobile');
  });
});