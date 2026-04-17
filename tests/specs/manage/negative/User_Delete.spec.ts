import { test, expect } from '@playwright/test';
import { LoginPage } from '../../../pages/base/LoginPage';
import { MainPage } from '../../../pages/base/MainPage';
import { UserListPage } from '../../../pages/manage/UserListPage';
import { CreateUserPage } from '../../../pages/manage/CreateUserPage';
import { EditUserPage } from '../../../pages/manage/EditUserPage';

test.describe('User › Delete Safety', () => {
  let loginPage: LoginPage;
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
    // POWERFUL: Resilient cleanup - navigate back to stable state
    await mainPage.navigate();
    await mainPage.goToManageUsers();

    for (const label of usersToDelete) {
      if (await userListPage.getUserRow(label).isVisible()) {
        await userListPage.deleteUser(label);
      }
    }
    usersToDelete = [];
  });

  test('Safety › Admin Protection › Delete Action Restricted', async ({ page }) => {
    const uniqueId = Date.now();
    const adminUser = {
      username: `admin_nodelete_${uniqueId}`,
      email: `admin_nodelete_${uniqueId}@example.com`,
      password: 'password123',
      displayName: `Admin ${uniqueId}`
    };

    await userListPage.openCreateForm();
    await createUserPage.fillForm(adminUser);
    await createUserPage.submit();
    await expect(page.locator('#swal2-title')).toBeVisible();
    await expect(page.getByText(adminUser.displayName)).toBeVisible();

    usersToDelete.push(adminUser.displayName);

    // Admin users should NOT have a delete button
    const adminRow = userListPage.getUserRow(adminUser.displayName);
    await expect(adminRow.getByTitle('ลบ')).not.toBeVisible();

    // Cleanup: change role to Foreman so we can delete in afterEach if needed, 
    // but here we manually delete to verify restricted state -> permitted state
    await userListPage.openEditForm(adminUser.displayName);
    await editUserPage.fillForm({ role: 'Foreman' });
    await editUserPage.saveChanges();

    await userListPage.deleteUser(adminUser.displayName);
    await expect(page.getByText(adminUser.displayName)).not.toBeVisible();
  });
});
