import { test, expect } from '@playwright/test';
import { MainPage } from '../../../pages/base/MainPage';
import { LoginPage } from '../../../pages/base/LoginPage';
import { UserListPage } from '../../../pages/manage/UserListPage';
import { CreateUserPage } from '../../../pages/manage/CreateUserPage';

test.describe('Manage › User › Validation', () => {
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
    await mainPage.navigate();
    await mainPage.goToManageUsers();
  });

  test.afterEach(async () => {
    await loginPage.navigate();
    await loginPage.login();
    await mainPage.navigate();
  });

  test.describe('Create › Form Validation', () => {
    test.beforeEach(async ({ page }) => {
      createUserPage = await userListPage.openCreateForm();
    });

    test('Error › Username Empty › Browser Blocks', async () => {
      await createUserPage.createButton.click();
      const validationMessage = await createUserPage.usernameInput.evaluate(
        el => (el as HTMLInputElement).validationMessage
      );
      expect(validationMessage).toContain('Please fill out this field');
    });

    test('Error › Email Empty › Browser Blocks', async () => {
      await createUserPage.usernameInput.fill('d');
      await createUserPage.createButton.click();
      const validationMessage = await createUserPage.emailInput.evaluate(
        el => (el as HTMLInputElement).validationMessage
      );
      expect(validationMessage).toContain('Please fill out this field');
    });

    test('Error › Email Invalid Format › Browser Blocks', async () => {
      await createUserPage.usernameInput.fill('d');
      await createUserPage.emailInput.fill('d');
      await createUserPage.createButton.click();
      const validationMessage = await createUserPage.emailInput.evaluate(
        el => (el as HTMLInputElement).validationMessage
      );
      expect(validationMessage).toContain("Please include an '@' in the email address");
    });

    test('Error › Email Missing Domain › Browser Blocks', async () => {
      await createUserPage.usernameInput.fill('d');
      await createUserPage.emailInput.fill('d@');
      await createUserPage.createButton.click();
      const validationMessage = await createUserPage.emailInput.evaluate(
        el => (el as HTMLInputElement).validationMessage
      );
      expect(validationMessage).toContain("Please enter a part following '@'");
    });

    test('Error › Password Empty › Browser Blocks', async () => {
      await createUserPage.usernameInput.fill('d');
      await createUserPage.emailInput.fill('d@example.com');
      await createUserPage.createButton.click();
      const validationMessage = await createUserPage.passwordInput.evaluate(
        el => (el as HTMLInputElement).validationMessage
      );
      expect(validationMessage).toContain('Please fill out this field');
    });
  });

  test.describe('Create › Duplicate Prevention', () => {
    test('Error › Email Taken › System Prevents Duplicate', async ({ page }) => {
      const uniqueId = Date.now();
      const duplicateUsername = `dup_submit_${uniqueId}`;

      const userA = {
        username: duplicateUsername,
        email: `submit_a_${uniqueId}@example.com`,
        password: 'password123',
        displayName: `Submit A ${uniqueId}`,
        role: 'Foreman'
      };

      const userB = {
        username: duplicateUsername,
        email: `submit_b_${uniqueId}@example.com`,
        password: 'password123',
        displayName: `Submit B ${uniqueId}`,
        role: 'Foreman'
      };

      createUserPage = await userListPage.openCreateForm();
      await createUserPage.fillForm(userA);
      await createUserPage.submit();
      await expect(page.getByText(userA.displayName, { exact: true })).toBeVisible();

      createUserPage = await userListPage.openCreateForm();
      await createUserPage.fillForm(userB);

      const dialogPromise = page.waitForEvent('dialog');
      await createUserPage.createButton.click();

      const dialog = await dialogPromise;
      expect(dialog.message()).toContain('Username or email already exists');
      await dialog.accept();

      await page.getByRole('button', { name: 'Back' }).click();
      await expect(page.getByText('จัดการบัญชีผู้ใช้')).toBeVisible();
      await expect(page.getByText(userA.displayName, { exact: true })).toBeVisible();
    });
  });
});
