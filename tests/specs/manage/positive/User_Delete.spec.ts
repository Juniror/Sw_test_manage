import { test, expect } from '@playwright/test';
import { MainPage } from '../../../pages/base/MainPage';
import { UserListPage } from '../../../pages/manage/UserListPage';
import { CreateUserPage } from '../../../pages/manage/CreateUserPage';

test.describe('User › Delete', () => {
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
    // Teardown: ensure baseline state and clean up any remaining test records
    await mainPage.navigate();
    await mainPage.goToManageUsers();

    for (const label of usersToDelete) {
      if (await userListPage.getUserRow(label).isVisible()) {
        await userListPage.deleteUser(label);
      }
    }
    usersToDelete = [];
  });

  test('Delete › Existing User › Success & Removed', async ({ page }) => {
    const uniqueId = Date.now();
    const targetUser = {
      username: `delete_target_${uniqueId}`,
      email: `delete_${uniqueId}@example.com`,
      password: 'password123',
      displayName: `ToDelete ${uniqueId}`,
      role: 'Foreman'
    };

    // Setup: Create record to be deleted
    await userListPage.openCreateForm();
    await createUserPage.fillForm(targetUser);
    await createUserPage.submit();
    await expect(page.locator('#swal2-title')).toBeVisible();

    usersToDelete.push(targetUser.displayName);
    
    // Action: Trigger deletion
    await userListPage.deleteUser(targetUser.displayName);
    
    // Verification: Confirm target identity is no longer present in the user list
    await expect(page.getByText(targetUser.displayName)).not.toBeVisible();
  });
});
