import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { UserListPage } from './pages/UserListPage';
import { CreateUserPage } from './pages/CreateUserPage';
import { EditUserPage } from './pages/EditUserPage';

test.describe('Delete User Flow', () => {
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

  test('Should create and then delete a user successfully', async ({ page }) => {
    const uniqueId = Date.now();
    const targetUser = {
      username: `delete_target_${uniqueId}`,
      email: `delete_${uniqueId}@example.com`,
      password: 'password123',
      displayName: `ToDelete ${uniqueId}`,
      role: 'Foreman'
    };

    await userListPage.openCreateForm();
    await createUserPage.fillForm(targetUser);
    await createUserPage.submit();

    await userListPage.deleteUser(targetUser.displayName);
    await expect(page.getByText(targetUser.displayName)).not.toBeVisible();
  });

  test('Should NOT be able to delete a user with Admin role', async ({ page }) => {
    const uniqueId = Date.now();
    const adminUser = {
      username: `admin_nodelete_${uniqueId}`,
      email: `admin_nodelete_${uniqueId}@example.com`,
      password: 'password123',
      displayName: `Admin ${uniqueId}`
      // No role specified — defaults to ADMIN
    };

    await userListPage.openCreateForm();
    await createUserPage.fillForm(adminUser);
    await createUserPage.submit();
    await expect(page.getByText(adminUser.displayName)).toBeVisible();

    // Admin users should NOT have a delete button
    const adminRow = userListPage.getUserRow(adminUser.displayName);
    await expect(adminRow.getByTitle('ลบ')).not.toBeVisible();

    // Cleanup: change role to Foreman so we can delete
    await userListPage.openEditForm(adminUser.displayName);
    await editUserPage.fillForm({ role: 'Foreman' });
    await editUserPage.saveChanges();

    await userListPage.deleteUser(adminUser.displayName);
    await expect(page.getByText(adminUser.displayName)).not.toBeVisible();
  });
});
