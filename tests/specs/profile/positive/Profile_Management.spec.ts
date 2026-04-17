import { test, expect } from '@playwright/test';
import { MainPage } from '../../../pages/base/MainPage';
import { EditProfilePage } from '../../../pages/profile/EditProfilePage';

test.describe('Profile › Identity', () => {
  let mainPage: MainPage;
  let profilePage: EditProfilePage;

  test.beforeEach(async ({ page }) => {
    mainPage = new MainPage(page);
    profilePage = new EditProfilePage(page);

    await mainPage.navigate();
    await profilePage.navigateToProfile();
  });

  test.afterEach(async ({ page }) => {
    // Teardown: Reset profile to baseline 'Admin Test' state to maintain environment consistency
    await mainPage.navigate();
    await profilePage.navigateToProfile();

    // Fix: Inputs are always visible but disabled in read-only mode.
    // We check for the 'Edit Profile' button to determine if we need to open the form.
    if (await profilePage.editProfileButton.isVisible()) {
        await profilePage.openEditForm();
    }
    
    await profilePage.fillForm({
        displayName: 'Admin Test',
        firstName: 'Admin',
        lastName: 'Test'
    });
    await profilePage.submit();
    await page.waitForLoadState('networkidle');
  });

  test('Update › Display Name & Phone › Success & Display Verified', async ({ page }) => {
    const uniqueId = Date.now().toString().slice(-4);
    const newDisplayName = `Dev_${uniqueId}`;

    await profilePage.openEditForm();
    await profilePage.fillForm({
      displayName: newDisplayName,
      phone: '0812345678'
    });
    await profilePage.submit();

    // Verify persistence and UI display of the updated identity
    await expect(page.locator('#swal2-title')).toBeVisible();
    await expect(page.getByText(newDisplayName)).toBeVisible();
  });
});
