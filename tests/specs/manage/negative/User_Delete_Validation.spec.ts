import { test, expect } from '@playwright/test';
import { LoginPage } from '../../../pages/base/LoginPage';
import { MainPage } from '../../../pages/base/MainPage';
import { UserListPage } from '../../../pages/manage/UserListPage';
import { CreateUserPage } from '../../../pages/manage/CreateUserPage';
import { EditUserPage } from '../../../pages/manage/EditUserPage';

test.describe('Manage › User › Safety', () => {
  let loginPage: LoginPage;
  let mainPage: MainPage;
  let userListPage: UserListPage;
  let createUserPage: CreateUserPage;
  let editUserPage: EditUserPage;

  test.beforeEach(async ({ page }) => {
    mainPage = new MainPage(page);
    loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login();
    userListPage = new UserListPage(page);
    createUserPage = new CreateUserPage(page);
    editUserPage = new EditUserPage(page);
    await mainPage.navigate();
    await mainPage.goToManageUsers();
  });

  test.afterEach(async () => {
    await loginPage.navigate();
    await loginPage.login();
    await mainPage.navigate();
  });

  test('Admin Protection › Delete Button Hidden', async ({ page }) => {
    const uniqueId = Date.now();
    const adminUser = {
      username: `admin_no_${uniqueId}`,
      email: `admin_no_${uniqueId}@example.com`,
      password: 'password123',
      displayName: `SuperAdmin ${uniqueId}`,
      role: 'admin'
    };

    await test.step('Create a new Admin user', async () => {
      await userListPage.openCreateForm();
      await createUserPage.fillForm(adminUser);
      await createUserPage.submit();
    });

    await test.step('Verify that Delete button is NOT visible for Admin role', async () => {
      await expect(page.getByText(adminUser.displayName)).toBeVisible();
      const adminRow = await userListPage.getUserRow(adminUser.displayName);
      await expect(adminRow.getByTitle('ลบ')).not.toBeVisible();
    });

    await test.step('Downgrade to Foreman and verify deletion is now possible', async () => {
      await userListPage.openEditForm(adminUser.displayName);
      await editUserPage.fillForm({ role: 'Foreman' });
      await editUserPage.saveChanges();
      
      await userListPage.deleteUser(adminUser.displayName);
      await expect(page.getByText(adminUser.displayName)).not.toBeVisible();
    });
  });
});
