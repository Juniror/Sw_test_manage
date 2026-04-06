import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { UserListPage } from './pages/UserListPage';
import { CreateUserPage } from './pages/CreateUserPage';
import { EditUserPage } from './pages/EditUserPage';

test.describe('Edit User Flow', () => {
  let loginPage: LoginPage;
  let userListPage: UserListPage;
  let createUserPage: CreateUserPage;
  let editUserPage: EditUserPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    userListPage = new UserListPage(page);
    createUserPage = new CreateUserPage(page);
    editUserPage = new EditUserPage(page);
    await loginPage.navigate();
    await loginPage.login('admin_test', 'admin');
    await userListPage.goToUserManagement();
  });

  test('Should create, edit, and then delete a user successfully', async ({ page }) => {
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
      nickname: 'ชาย',
      displayName: `Updated ${uniqueId}`,
      firstName: 'สมชาย',
      lastName: 'คล่องแคล่ว',
      phone: '0998887999',
      role: 'audit'
    };

    await userListPage.openCreateForm();
    await createUserPage.fillForm(initialUser);
    await createUserPage.submit();

    await userListPage.openEditForm(initialUser.displayName);
    await editUserPage.fillForm(updatedData);
    await editUserPage.saveChanges();

    await expect(page.getByText('จัดการบัญชีผู้ใช้')).toBeVisible();
    await expect(page.getByText(updatedData.displayName)).toBeVisible();

    await userListPage.deleteUser(updatedData.displayName);
    await expect(page.getByText(updatedData.displayName)).not.toBeVisible();
  });

  test('Should show username when all optional fields are cleared', async ({ page }) => {
    const uniqueId = Date.now();
    const initialUser = {
      username: `clear_target_${uniqueId}`,
      email: `clear_${uniqueId}@example.com`,
      password: 'password123',
      displayName: `ToClear ${uniqueId}`,
      role: 'Foreman'
    };

    await userListPage.openCreateForm();
    await createUserPage.fillForm(initialUser);
    await createUserPage.submit();
    await expect(page.getByText(initialUser.displayName)).toBeVisible();

    // Clear all optional fields
    await userListPage.openEditForm(initialUser.displayName);
    await editUserPage.fillForm({
      displayName: ' ',
      firstName: ' ',
      lastName: ' ',
      nickname: ' ',
      phone: ' '
    });
    await editUserPage.saveChanges();

    // Without displayName, the card shows username instead
    await expect(page.getByText('จัดการบัญชีผู้ใช้')).toBeVisible();
    await expect(page.getByText(initialUser.username, { exact: true })).toBeVisible();
    await expect(page.getByText(initialUser.displayName)).not.toBeVisible();

    await userListPage.deleteUser(initialUser.username);
    await expect(page.getByText(initialUser.username, { exact: true })).not.toBeVisible();
  });
});
