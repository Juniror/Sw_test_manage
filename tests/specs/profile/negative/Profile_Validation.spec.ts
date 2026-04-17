import { test, expect } from '@playwright/test';
import { MainPage } from '../../../pages/base/MainPage';
import { EditProfilePage } from '../../../pages/profile/EditProfilePage';

test.describe('Profile › Validation', () => {
  let mainPage: MainPage;
  let profilePage: EditProfilePage;

  test.beforeEach(async ({ page }) => {
    mainPage = new MainPage(page);
    profilePage = new EditProfilePage(page);

    await mainPage.navigate();
    await profilePage.navigateToProfile();
    await profilePage.openEditForm();
  });

  test.afterEach(async () => {
    // Reset page navigation for state isolation between validation attempts
    await mainPage.navigate();
  });

  test('Error › Missing First Name › Browser Blocks', async ({ page }) => {
    // Attempt to save an incomplete profile by clearing required metadata
    await profilePage.firstNameInput.clear();
    await profilePage.saveButton.click();

    // Verify presence of HTML5 native required attribute violation
    const validationMessage = await profilePage.firstNameInput.evaluate((el: HTMLInputElement) => el.validationMessage);
    expect(validationMessage).toBeTruthy();
  });
});
