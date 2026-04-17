import { test, expect } from '@playwright/test';
import { MainPage } from '../../../pages/base/MainPage';
import { UserListPage } from '../../../pages/manage/UserListPage';
import { CreateUserPage } from '../../../pages/manage/CreateUserPage';

test.describe('User › Create', () => {
  let mainPage: MainPage;
  let userListPage: UserListPage;
  let createUserPage: CreateUserPage;
  let usersToDelete: string[] = [];

  test.beforeEach(async ({ page }) => {
    mainPage = new MainPage(page);
    userListPage = new UserListPage(page);
    createUserPage = new CreateUserPage(page);
    await mainPage.navigate();
    await mainPage.goToManageUsers();
  });

  test.afterEach(async () => {
    // Reset page navigation and perform automated cleanup of created test accounts
    await mainPage.navigate();
    await mainPage.goToManageUsers();

    for (const label of usersToDelete) {
      if (await userListPage.getUserRow(label).isVisible()) {
        await userListPage.deleteUser(label);
      }
    }
    usersToDelete = [];
  });

  test('Create › Mandatory Fields › Success', async ({ page }) => {
    const uniqueId = Date.now();
    const simpleUser = {
      username: `simple_user_${uniqueId}`,
      email: `simple_${uniqueId}@example.com`,
      password: 'password123',
      role: 'Foreman'
    };

    await userListPage.openCreateForm();
    await createUserPage.fillForm(simpleUser);
    await createUserPage.submit();

    // Verify return to user list and presence of new record
    await expect(page.getByText('จัดการบัญชีผู้ใช้')).toBeVisible();
    await expect(page.getByText(simpleUser.username, { exact: true })).toBeVisible();

    usersToDelete.push(simpleUser.username);
  });

  test('Create › With Contact Name › Success', async ({ page }) => {
    const uniqueId = Date.now();
    const nameOnlyUser = {
      username: `name_only_${uniqueId}`,
      email: `name_only_${uniqueId}@example.com`,
      password: 'password123',
      firstName: 'Solo',
      lastName: 'User',
      role: 'Foreman'
    };

    await userListPage.openCreateForm();
    await createUserPage.fillForm(nameOnlyUser);
    await createUserPage.submit();

    // Validate that the system falls back to username display when display name is absent
    await expect(page.getByText(nameOnlyUser.username, { exact: true })).toBeVisible();

    usersToDelete.push(nameOnlyUser.username);
  });

  test('Create › Comprehensive Profile › Success & Display Verified', async ({ page }) => {
    const uniqueId = Date.now();
    const fullUser = {
      username: `expert_user_${uniqueId}`,
      email: `expert_${uniqueId}@example.com`,
      password: 'password123',
      displayName: `Expert ${uniqueId}`,
      firstName: 'Automation',
      lastName: 'Playwright',
      nickname: 'Agentic',
      phone: '0812233446',
      role: 'Foreman'
    };

    await userListPage.openCreateForm();
    await createUserPage.fillForm(fullUser);
    await createUserPage.submit();

    // Confirm navigation and data integrity in the user list
    await expect(page.getByText('จัดการบัญชีผู้ใช้')).toBeVisible();
    await expect(page.getByText(fullUser.displayName)).toBeVisible();

    usersToDelete.push(fullUser.displayName);
  });
});
