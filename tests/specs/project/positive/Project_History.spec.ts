import { test, expect } from '@playwright/test';
import { MainPage } from '../../../pages/base/MainPage';

test.describe('Project › History', () => {
  let mainPage: MainPage;

  test.beforeEach(async ({ page }) => {
    mainPage = new MainPage(page);
    await mainPage.navigate();
  });

  test.afterEach(async () => {
    await mainPage.navigate();
  });

  test('UI › History Navigation › Accessible', async ({ page }) => {
    // Navigate to History
    await page.getByRole('button', { name: 'ประวัติโครงการ', exact: true }).click();
    await expect(page).toHaveURL(/.*sites\/history/);

    // Verify Filters are present and clickable
    const filters = ['ทั้งหมด', 'เสร็จสิ้น', 'ยกเลิก', 'ระหว่างดำเนินการ'];
    for (const filter of filters) {
        const filterBtn = page.getByRole('button', { name: filter, exact: true });
        await expect(filterBtn).toBeVisible();
        await filterBtn.click();
        // Brief wait for filtering logic
        await page.waitForTimeout(500);
    }
  });

  test('Filter › Status Selection › Applied', async ({ page }) => {
    await page.getByRole('button', { name: 'ประวัติโครงการ', exact: true }).click();
    
    // Select Finished filter
    await page.getByRole('button', { name: 'เสร็จสิ้น', exact: true }).click();
    
    // Check if any card is visible, each finished card should have a green "เสร็จสิ้น" badge
    // This depends on seed data, but we verify the filter's UI state
    const finishedFilter = page.getByRole('button', { name: 'เสร็จสิ้น', exact: true });
    await expect(finishedFilter).toHaveClass(/bg-secondary/); // Assuming secondary is the active color based on DOM check
  });
});
