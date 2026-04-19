import { test, expect } from '@playwright/test';
import { MainPage } from '../../../pages/base/MainPage';
import { LoginPage } from '../../../pages/base/LoginPage';
import { UserListPage } from '../../../pages/manage/UserListPage';
import { CreateUserPage } from '../../../pages/manage/CreateUserPage';
import { EditUserPage } from '../../../pages/manage/EditUserPage';

test.describe('Manage › User › Profile Management', () => {
  let mainPage: MainPage;
  let loginPage: LoginPage;
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

  test('Update › Multi-field › Multi-field Success', async ({ page }) => {
    const uniqueId = Date.now();
    const initialUser = {
      username: `edit_target_${uniqueId}`,
      email: `edit_${uniqueId}@example.com`,
      password: 'password123',
      displayName: `Initial ${uniqueId}`,
      role: 'Foreman'
    };

    const updatedData = {
      email: `updated_${uniqueId}@example.com`,
      nickname: `ชาย${uniqueId}`,
      displayName: `Updated ${uniqueId}`,
      firstName: `สมชาย${uniqueId}`,
      lastName: `คล่องแคล่ว${uniqueId}`,
      phone: `09${String(uniqueId)}`,
      role: 'audit'
    };

    createUserPage = await userListPage.openCreateForm();
    await createUserPage.fillForm(initialUser);
    await createUserPage.submit();

    editUserPage = await userListPage.openEditForm(initialUser.displayName);
    await editUserPage.fillForm(updatedData);
    await editUserPage.saveChanges();

    await expect(page.getByText('จัดการบัญชีผู้ใช้')).toBeVisible();
    await expect(page.getByText(updatedData.displayName)).toBeVisible();
  });
});
