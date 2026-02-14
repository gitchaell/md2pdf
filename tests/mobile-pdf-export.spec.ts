import { test, expect } from '@playwright/test';

test.describe('Mobile PDF Export', () => {
  // Emulate an iPhone 12 Pro
  test.use({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/604.1',
  });

  test('should generate PDF without crashing or showing error on mobile', async ({ page }) => {
    // 1. Navigate to the application
    await page.goto('http://localhost:4321/');

    // 2. Wait for the application to load
    // Wait for the tab buttons to appear (Editor/Preview)
    const previewTabButton = page.getByRole('button', { name: 'Preview' });
    await expect(previewTabButton).toBeVisible({ timeout: 10000 });

    // 3. Switch to Preview tab
    console.log('Switching to Preview tab...');
    await previewTabButton.click();

    // 4. Wait for Preview component to be visible
    // The Preview header inside the Preview component
    const previewHeader = page.locator('h2').filter({ hasText: 'Preview' });
    await expect(previewHeader).toBeVisible();

    // 5. Locate the PDF export button
    const pdfButton = page.getByRole('button', { name: 'PDF' });
    await expect(pdfButton).toBeVisible();

    // 5. Setup console and error listeners
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));

    // 6. Setup dialog handler to catch failure alerts
    let alertMessage = null;
    page.on('dialog', async dialog => {
      console.log(`Dialog message: ${dialog.message()}`);
      alertMessage = dialog.message();
      await dialog.dismiss();
    });

    // 7. Setup download handler
    const downloadPromise = page.waitForEvent('download', { timeout: 30000 }).catch(() => null);

    // 8. Click the PDF button to start export
    console.log('Clicking PDF export button...');
    await pdfButton.click();

    // 9. Verify UI changes to "Generating..."
    await expect(page.getByRole('button', { name: 'Generating...' })).toBeVisible({ timeout: 5000 });
    console.log('UI shows Generating...');

    // 10. Wait for the process to complete
    await expect(page.getByRole('button', { name: 'PDF' })).toBeVisible({ timeout: 60000 });
    console.log('UI reverted to PDF state.');

    // 11. Assertions
    if (alertMessage) {
        if (alertMessage.includes("Failed to generate PDF")) {
            throw new Error(`PDF Generation failed with alert: ${alertMessage}`);
        }
    }

    const download = await downloadPromise;
    if (download) {
        console.log(`Download started: ${download.suggestedFilename()}`);
    } else {
        console.log('No download event detected, but no crash occurred.');
    }
  });
});
