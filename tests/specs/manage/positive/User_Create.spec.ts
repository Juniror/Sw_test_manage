import { test, expect } from '@playwright/test';
import { MainPage } from '../../../pages/base/MainPage';
import { LoginPage } from '../../../pages/base/LoginPage';
import { UserListPage } from '../../../pages/manage/UserListPage';
import { CreateUserPage } from '../../../pages/manage/CreateUserPage';

test.describe('Manage › User › Create', () => {
  let mainPage: MainPage;
  let loginPage: LoginPage;
  let userListPage: UserListPage;
  let createUserPage: CreateUserPage;

  test.beforeEach(async ({ page }) => {
    mainPage = new MainPage(page);
    loginPage = new LoginPage(page);
    
    await test.step('Setup: Login and Go to User Management', async () => {
      await loginPage.navigate();
      await loginPage.login();
      userListPage = new UserListPage(page);
      await mainPage.navigate();
      await mainPage.goToManageUsers();
    });
  });

  test.afterEach(async () => {
    await test.step('Teardown: Return to Main', async () => {
      await loginPage.navigate();
      await loginPage.login();
      await mainPage.navigate();
    });
  });

  test('Mandatory Fields › Simple User', async ({ page }) => {
    const uniqueId = Date.now();
    const simpleUser = {
      username: `simple_user_${uniqueId}`,
      email: `simple_${uniqueId}@example.com`,
      password: 'password123',
      role: 'Foreman'
    };

    await test.step('Action: Create User with Mandatory Fields', async () => {
      createUserPage = await userListPage.openCreateForm();
      await createUserPage.fillForm(simpleUser);
      await createUserPage.submit();
    });

    await test.step('Verify: User Visible in List', async () => {
      await expect(page.getByText('จัดการบัญชีผู้ใช้')).toBeVisible();
      await expect(page.getByText(simpleUser.username, { exact: true })).toBeVisible();
    });
  });

  test('Mandatory Fields + Detail › Profile Initialization', async ({ page }) => {
    const uniqueId = Date.now();
    const nameOnlyUser = {
      username: `name_only_${uniqueId}`,
      email: `name_only_${uniqueId}@example.com`,
      password: 'password123',
      firstName: 'Solo',
      lastName: 'User',
      role: 'Foreman'
    };

    await test.step('Action: Create User with Name Details', async () => {
      createUserPage = await userListPage.openCreateForm();
      await createUserPage.fillForm(nameOnlyUser);
      await createUserPage.submit();
    });

    await test.step('Verify: Username Presence', async () => {
      await expect(page.getByText(nameOnlyUser.username, { exact: true })).toBeVisible();
    });
  });

  test('All Fields › Comprehensive Profile', async ({ page }) => {
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

    await test.step('Action: Create User with All Details', async () => {
      createUserPage = await userListPage.openCreateForm();
      await createUserPage.fillForm(fullUser);
      await createUserPage.submit();
    });

    await test.step('Verify: Display Name and Persistence', async () => {
      await expect(page.getByText('จัดการบัญชีผู้ใช้')).toBeVisible();
      await expect(page.getByText(fullUser.displayName)).toBeVisible();
    });
  });
});
