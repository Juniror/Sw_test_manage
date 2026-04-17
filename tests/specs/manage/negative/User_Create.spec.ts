import { test, expect } from '@playwright/test';
import { MainPage } from '../../../pages/base/MainPage';
import { UserListPage } from '../../../pages/manage/UserListPage';
import { CreateUserPage } from '../../../pages/manage/CreateUserPage';

test.describe('User › Validation', () => {
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
    // Teardown: ensure state reset and cleanup of successfully created setup records
    await mainPage.navigate();
    await mainPage.goToManageUsers();

    for (const label of usersToDelete) {
      if (await userListPage.getUserRow(label).isVisible()) {
        await userListPage.deleteUser(label);
      }
    }
    usersToDelete = [];
  });

  test.describe('Mandatory Field Validation', () => {
    test.beforeEach(async ({ page }) => {
      // Automatically handle browser alerts during validation tests
      page.on('dialog', dialog => dialog.accept());
      await userListPage.openCreateForm();
    });

    test('Error › Username Mandatory › Browser Blocks', async () => {
      await createUserPage.createButton.click();
      const validationMessage = await createUserPage.usernameInput.evaluate(
        el => (el as HTMLInputElement).validationMessage
      );
      expect(validationMessage).toContain('Please fill out this field');
    });

    test('Error › Email Mandatory › Browser Blocks', async () => {
      await createUserPage.usernameInput.fill('d');
      await createUserPage.createButton.click();
      const validationMessage = await createUserPage.emailInput.evaluate(
        el => (el as HTMLInputElement).validationMessage
      );
      expect(validationMessage).toContain('Please fill out this field');
    });

    test('Error › Email RFC @ › Browser Blocks', async () => {
      await createUserPage.usernameInput.fill('d');
      await createUserPage.emailInput.fill('d');
      await createUserPage.createButton.click();
      const validationMessage = await createUserPage.emailInput.evaluate(
        el => (el as HTMLInputElement).validationMessage
      );
      expect(validationMessage).toContain("Please include an '@' in the email address");
    });

    test('Error › Email RFC Domain › Browser Blocks', async () => {
      await createUserPage.usernameInput.fill('d');
      await createUserPage.emailInput.fill('d@');
      await createUserPage.createButton.click();
      const validationMessage = await createUserPage.emailInput.evaluate(
        el => (el as HTMLInputElement).validationMessage
      );
      expect(validationMessage).toContain("Please enter a part following '@'");
    });

    test('Error › Password Mandatory › Browser Blocks', async () => {
      await createUserPage.usernameInput.fill('d');
      await createUserPage.emailInput.fill('d@example.com');
      await createUserPage.createButton.click();
      const validationMessage = await createUserPage.passwordInput.evaluate(
        el => (el as HTMLInputElement).validationMessage
      );
      expect(validationMessage).toContain('Please fill out this field');
    });
  });

  test.describe('Conflict & Duplicate Prevention', () => {
    test('Safety › Cancel Creation › State Preserved', async ({ page }) => {
      const uniqueId = Date.now();
      const userA = {
        username: `dup_back_${uniqueId}`,
        email: `dup_back_${uniqueId}@example.com`,
        password: 'password123',
        displayName: `DupBack ${uniqueId}`,
        role: 'Foreman'
      };

      await userListPage.openCreateForm();
      await createUserPage.fillForm(userA);
      await createUserPage.submit();
      await expect(page.locator('#swal2-title')).toBeVisible();
      await expect(page.getByText(userA.displayName)).toBeVisible();

      // Attempt to re-create the user with conflicting unique fields
      await userListPage.openCreateForm();
      await createUserPage.fillForm({
        username: userA.username,
        email: `different_${uniqueId}@example.com`,
        password: 'password123'
      });

      await page.getByRole('button', { name: 'Back' }).click();
      await expect(page.getByText(userA.displayName)).toBeVisible();

      usersToDelete.push(userA.displayName);
    });

    test('Error › Duplicate Credentials › System Rejects', async ({ page }) => {
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

      // Create primary record
      await userListPage.openCreateForm();
      await createUserPage.fillForm(userA);
      await createUserPage.submit();
      await expect(page.getByText(userA.displayName)).toBeVisible();

      // Attempt to create secondary record with conflicting username
      await userListPage.openCreateForm();
      await createUserPage.fillForm(userB);

      const dialogPromise = page.waitForEvent('dialog');
      await createUserPage.createButton.click();

      // Confirm server-side rejection dialog
      const dialog = await dialogPromise;
      expect(dialog.message()).toContain('Username or email already exists');
      await dialog.accept();

      await page.getByRole('button', { name: 'Back' }).click();
      await expect(page.getByText('จัดการบัญชีผู้ใช้')).toBeVisible();
      await expect(page.getByText(userA.displayName)).toBeVisible();

      usersToDelete.push(userA.displayName);
    });
  });
});
