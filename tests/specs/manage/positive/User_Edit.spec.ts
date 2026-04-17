import { test, expect } from '@playwright/test';
import { MainPage } from '../../../pages/base/MainPage';
import { UserListPage } from '../../../pages/manage/UserListPage';
import { CreateUserPage } from '../../../pages/manage/CreateUserPage';
import { EditUserPage } from '../../../pages/manage/EditUserPage';

test.describe('User › Update', () => {
  let mainPage: MainPage;
  let userListPage: UserListPage;
  let createUserPage: CreateUserPage;
  let editUserPage: EditUserPage;
  let usersToDelete: string[] = [];

  test.beforeEach(async ({ page }) => {
    mainPage = new MainPage(page);
    userListPage = new UserListPage(page);
    createUserPage = new CreateUserPage(page);
    editUserPage = new EditUserPage(page);
    await mainPage.navigate();
    await mainPage.goToManageUsers();
  });

  test.afterEach(async () => {
    // Teardown: ensure state reset and automated cleanup of modified test identities
    await mainPage.navigate();
    await mainPage.goToManageUsers();

    for (const label of usersToDelete) {
      if (await userListPage.getUserRow(label).isVisible()) {
        await userListPage.deleteUser(label);
      }
    }
    usersToDelete = [];
  });

  test('Update › Comprehensive Profile › Multi-field Success', async ({ page }) => {
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
      phone: `09${String(uniqueId).slice(-8)}`,
      role: 'audit'
    };

    // Setup: Create baseline user
    await userListPage.openCreateForm();
    await createUserPage.fillForm(initialUser);
    await createUserPage.submit();

    // Action: Update user profile
    await userListPage.openEditForm(initialUser.displayName);
    await editUserPage.fillForm(updatedData);
    await editUserPage.saveChanges();

    // Verification: Success message and data persistence in list view
    await expect(page.locator('#swal2-title')).toBeVisible();
    await expect(page.getByText('จัดการบัญชีผู้ใช้')).toBeVisible();
    await expect(page.getByText(updatedData.displayName)).toBeVisible();

    usersToDelete.push(updatedData.displayName);
  });

  test('Update › Clear Display Name › Username Fallback Verified', async ({ page }) => {
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

     // Action: Clear all optional identifying metadata to trigger fallback logic
     await userListPage.openEditForm(initialUser.displayName);
     await editUserPage.fillForm({
       displayName: '',
       firstName: '',
       lastName: '',
       nickname: '',
       phone: ''
     });
     await editUserPage.saveChanges();

    // Verification: Success state followed by list refresh validation
    await expect(page.locator('#swal2-title')).toBeVisible();
    await page.reload(); 
    await expect(page.getByText('จัดการบัญชีผู้ใช้')).toBeVisible();
    await expect(page.getByText(initialUser.displayName)).not.toBeVisible();
    await expect(page.getByText(initialUser.username)).toBeVisible();

    usersToDelete.push(initialUser.username);
  });
});
