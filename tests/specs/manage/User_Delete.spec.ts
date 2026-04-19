import { test, expect } from '@playwright/test';
import { MainPage } from '../../pages/base/MainPage';
import { LoginPage } from '../../pages/base/LoginPage';
import { UserListPage } from '../../pages/manage/UserListPage';
import { CreateUserPage } from '../../pages/manage/CreateUserPage';

test.describe('Manage › User › Lifecycle Teardown', () => {
  let mainPage: MainPage;
  let loginPage: LoginPage;
  let userListPage: UserListPage;
  let createUserPage: CreateUserPage;

  test.beforeEach(async ({ page }) => {
    mainPage = new MainPage(page);
    loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login();
    userListPage = new UserListPage(page);
    createUserPage = new CreateUserPage(page);
    await mainPage.navigate();
    await mainPage.goToManageUsers();
  });

  test.afterEach(async () => {
    await loginPage.navigate();
    await loginPage.login();
    await mainPage.navigate();
  });

  test('Delete › Existing User › Removal Success', async ({ page }) => {
    const uniqueId = Date.now();
    const targetUser = {
      username: `delete_target_${uniqueId}`,
      email: `delete_${uniqueId}@example.com`,
      password: 'password123',
      displayName: `ToDelete ${uniqueId}`,
      role: 'Foreman'
    };

    await test.step('Create temporary user account', async () => {
      await userListPage.openCreateForm();
      await createUserPage.fillForm(targetUser);
      await createUserPage.submit();
    });

    await test.step('Execute user deletion', async () => {
      await userListPage.deleteUser(targetUser.displayName);
    });

    await test.step('Verify user is removed from management list', async () => {
      await expect(page.getByText(targetUser.displayName)).not.toBeVisible();
    });
  });
});
