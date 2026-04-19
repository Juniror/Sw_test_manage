import { test, expect } from '@playwright/test';
import { MainPage } from '../../../pages/base/MainPage';
import { LoginPage } from '../../../pages/base/LoginPage';
import { EmployeeListPage } from '../../../pages/employee/EmployeeListPage';
import { CreateEmployeePage } from '../../../pages/employee/CreateEmployeePage';

test.describe('Employee › Lifecycle › Validation Safety', () => {
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

  test('Safety › Cancel Creation › Data Not Saved', async ({ page }) => {
    const uniqueId = Date.now().toString();
    const firstName = `CancelMe_${uniqueId}`;

    createPage = await employeeList.openCreateForm();
    await createPage.fillForm({ firstName });
    await page.getByRole('button', { name: 'Back' }).click();

    const card = await employeeList.getEmployeeCard(firstName);
    await expect(card).not.toBeVisible();
  });
});
