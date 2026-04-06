import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { UserListPage } from './pages/UserListPage';
import { CreateUserPage } from './pages/CreateUserPage';

test.describe('User Management: Create User', () => {
  let loginPage: LoginPage;
  let userListPage: UserListPage;
  let createUserPage: CreateUserPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    userListPage = new UserListPage(page);
    createUserPage = new CreateUserPage(page);
    await loginPage.navigate();
    await loginPage.login('admin_test', 'admin');
    await userListPage.goToUserManagement();
  });

  // ─── Positive Scenarios ────────────────────────────────────────────

  test.describe('Positive Scenarios: Successful Creation', () => {
    test('Should create and delete a minimum required user', async ({ page }) => {
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

      await expect(page.getByText('จัดการบัญชีผู้ใช้')).toBeVisible();
      await expect(page.getByText(simpleUser.username, { exact: true })).toBeVisible();

      await userListPage.deleteUser(simpleUser.username);
      await expect(page.getByText(simpleUser.username, { exact: true })).not.toBeVisible();
    });

    test('Should create and delete a user with names but NO display name', async ({ page }) => {
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

      // Without displayName, the card shows the username
      await expect(page.getByText('จัดการบัญชีผู้ใช้')).toBeVisible();
      await expect(page.getByText(nameOnlyUser.username, { exact: true })).toBeVisible();

      await userListPage.deleteUser(nameOnlyUser.username);
      await expect(page.getByText(nameOnlyUser.username, { exact: true })).not.toBeVisible();
    });

    test('Should create and delete a user with all details filled', async ({ page }) => {
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

      await expect(page.getByText('จัดการบัญชีผู้ใช้')).toBeVisible();
      await expect(page.getByText(fullUser.displayName)).toBeVisible();

      await userListPage.deleteUser(fullUser.displayName);
      await expect(page.getByText(fullUser.displayName)).not.toBeVisible();
    });
  });

  // ─── Form Validation (Negative Testing) ────────────────────────────

  test.describe('Form Validation (Negative Testing)', () => {
    test.beforeEach(async ({ page }) => {
      // Auto-dismiss any server dialogs triggered by form submission
      page.on('dialog', dialog => dialog.accept());
      await userListPage.openCreateForm();
    });

    test('Validation: Empty Username', async () => {
      await createUserPage.createButton.click();
      const validationMessage = await createUserPage.usernameInput.evaluate(
        el => (el as HTMLInputElement).validationMessage
      );
      expect(validationMessage).toContain('Please fill out this field');
    });

    test('Validation: Empty Email', async () => {
      await createUserPage.usernameInput.fill('d');
      await createUserPage.createButton.click();
      const validationMessage = await createUserPage.emailInput.evaluate(
        el => (el as HTMLInputElement).validationMessage
      );
      expect(validationMessage).toContain('Please fill out this field');
    });

    test('Validation: Invalid Email (Missing @)', async () => {
      await createUserPage.usernameInput.fill('d');
      await createUserPage.emailInput.fill('d');
      await createUserPage.createButton.click();
      const validationMessage = await createUserPage.emailInput.evaluate(
        el => (el as HTMLInputElement).validationMessage
      );
      expect(validationMessage).toContain("Please include an '@' in the email address");
    });

    test('Validation: Incomplete Email (Missing domain)', async () => {
      await createUserPage.usernameInput.fill('d');
      await createUserPage.emailInput.fill('d@');
      await createUserPage.createButton.click();
      const validationMessage = await createUserPage.emailInput.evaluate(
        el => (el as HTMLInputElement).validationMessage
      );
      expect(validationMessage).toContain("Please enter a part following '@'");
    });

    test('Validation: Empty Password', async () => {
      await createUserPage.usernameInput.fill('d');
      await createUserPage.emailInput.fill('d@example.com');
      await createUserPage.createButton.click();
      const validationMessage = await createUserPage.passwordInput.evaluate(
        el => (el as HTMLInputElement).validationMessage
      );
      expect(validationMessage).toContain('Please fill out this field');
    });
  });

  // ─── Edge Case: Duplicate Protection ───────────────────────────────

  test.describe('Edge Case: Duplicate Protection', () => {
    test('Should do nothing when pressing Back without submitting duplicate form', async ({ page }) => {
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
      await expect(page.getByText(userA.displayName)).toBeVisible();

      // Fill duplicate data but DON'T submit — just press Back
      await userListPage.openCreateForm();
      await createUserPage.fillForm({
        username: userA.username,
        email: `different_${uniqueId}@example.com`,
        password: 'password123'
      });

      await page.getByRole('button', { name: 'Back' }).click();
      await expect(page.getByText('จัดการบัญชีผู้ใช้')).toBeVisible();
      await expect(page.getByText(userA.displayName)).toBeVisible();

      await userListPage.deleteUser(userA.displayName);
      await expect(page.getByText(userA.displayName)).not.toBeVisible();
    });

    test('Should show error popup when submitting duplicate, then navigate back', async ({ page }) => {
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

      await userListPage.openCreateForm();
      await createUserPage.fillForm(userA);
      await createUserPage.submit();
      await expect(page.getByText(userA.displayName)).toBeVisible();

      // Submit duplicate — should trigger error popup
      await userListPage.openCreateForm();
      await createUserPage.fillForm(userB);

      const dialogPromise = page.waitForEvent('dialog');
      await createUserPage.createButton.click();

      const dialog = await dialogPromise;
      expect(dialog.message()).toContain('Username or email already exists');
      await dialog.accept();

      await page.getByRole('button', { name: 'Back' }).click();
      await expect(page.getByText('จัดการบัญชีผู้ใช้')).toBeVisible();

      await userListPage.deleteUser(userA.displayName);
      await expect(page.getByText(userA.displayName)).not.toBeVisible();
    });
  });
});
