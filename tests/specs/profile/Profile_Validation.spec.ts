import { test, expect } from '@playwright/test';
import { MainPage } from '../../pages/base/MainPage';
import { LoginPage } from '../../pages/base/LoginPage';
import { EditProfilePage } from '../../pages/profile/EditProfilePage';

test.describe('Profile › Validation › Constraints', () => {
  let mainPage: MainPage;
  let loginPage: LoginPage;
  let profilePage: EditProfilePage;

  test.beforeEach(async ({ page }) => {
    mainPage = new MainPage(page);
    loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login();
    profilePage = new EditProfilePage(page);

    await mainPage.navigate();
    await profilePage.navigateToProfile();
    await profilePage.openEditForm();
  });

  test.afterEach(async () => {
    await loginPage.navigate();
    await loginPage.login();
    await mainPage.navigate();
  });

  test('Update › Missing First Name › Native Error', async ({ page }) => {
    await profilePage.firstNameInput.clear();
    await profilePage.saveButton.click();

    const validationMessage = await profilePage.firstNameInput.evaluate((el: HTMLInputElement) => el.validationMessage);
    expect(validationMessage).toBeTruthy();
  });
});
