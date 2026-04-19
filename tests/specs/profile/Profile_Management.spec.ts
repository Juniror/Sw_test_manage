import { test, expect } from '@playwright/test';
import { MainPage } from '../../pages/base/MainPage';
import { LoginPage } from '../../pages/base/LoginPage';
import { EditProfilePage } from '../../pages/profile/EditProfilePage';

test.describe('Profile › Settings › Personal Data', () => {
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
  });

  test.afterEach(async ({ page }) => {
    await loginPage.navigate();
    await loginPage.login();
    await mainPage.navigate();
  });

  test('Update › Display Name › Visual Persistence', async ({ page }) => {
    const uniqueId = Date.now().toString();
    const newDisplayName = `Dev_${uniqueId}`;
    const phone = '0812345678';

    await profilePage.openEditForm();
    await profilePage.fillForm({
      displayName: newDisplayName,
      phone: phone
    });
    await profilePage.submit();

    await expect(page.getByText(newDisplayName)).toBeVisible();
    await expect(profilePage.phoneInput).toHaveValue(phone);

  });
});
