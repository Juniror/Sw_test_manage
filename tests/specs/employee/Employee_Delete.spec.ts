import { test, expect } from '@playwright/test';
import { MainPage } from '../../pages/base/MainPage';
import { LoginPage } from '../../pages/base/LoginPage';
import { EmployeeListPage } from '../../pages/employee/EmployeeListPage';
import { CreateEmployeePage } from '../../pages/employee/CreateEmployeePage';

test.describe('Employee › Lifecycle › Deletion', () => {
  let mainPage: MainPage;
  let loginPage: LoginPage;
  let employeeList: EmployeeListPage;
  let createPage: CreateEmployeePage;

  test.beforeEach(async ({ page }) => {
    mainPage = new MainPage(page);
    loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login();
    employeeList = new EmployeeListPage(page);

    await mainPage.navigate();
    await mainPage.goToEmployees();
  });

  test.afterEach(async () => {
    await loginPage.navigate();
    await loginPage.login();
    await mainPage.navigate();
  });

  test('Delete › Existing Employee › Removal Success', async ({ page }) => {
    const uniqueId = Date.now().toString();
    const firstName = `DeleteMe_${uniqueId}`;

    await test.step('Create temporary employee', async () => {
      createPage = await employeeList.openCreateForm();
      await createPage.fillForm({ firstName });
      await createPage.submit();
    });

    await test.step('Verify creation and execute deletion', async () => {
      await employeeList.expectEmployeeInList(firstName);
      await employeeList.deleteEmployee(firstName);
    });

    await test.step('Verify record is removed from list', async () => {
      const card = await employeeList.getEmployeeCard(firstName);
      await expect(card).not.toBeVisible();
    });
  });

  test('Safety › Cancel Deletion › Data Persistence', async ({ page }) => {
    const uniqueId = Date.now().toString();
    const firstName = `SafeStay_${uniqueId}`;

    await test.step('Create reference employee', async () => {
      createPage = await employeeList.openCreateForm();
      await createPage.fillForm({ firstName });
      await createPage.submit();
    });

    await test.step('Initiate deletion and dismiss modal', async () => {
      await employeeList.clickDeleteBtn(firstName);
      const modal = page.getByText('ยืนยันการลบพนักงาน');
      await expect(modal).toBeVisible();
      await page.getByRole('button', { name: 'ยกเลิก', exact: true }).click();
      await expect(modal).not.toBeVisible();
    });

    await test.step('Verify employee remains in list', async () => {
      await employeeList.expectEmployeeInList(firstName);
    });
  });
});
