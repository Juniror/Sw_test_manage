import { test, expect } from '@playwright/test';
import { MainPage } from '../../../pages/base/MainPage';
import { LoginPage } from '../../../pages/base/LoginPage';
import { EmployeeListPage } from '../../../pages/employee/EmployeeListPage';
import { CreateEmployeePage } from '../../../pages/employee/CreateEmployeePage';
import { EditEmployeePage } from '../../../pages/employee/EditEmployeePage';

test.describe('Employee › Update Settings', () => {
  let mainPage: MainPage;
  let loginPage: LoginPage;
  let employeeList: EmployeeListPage;
  let createPage: CreateEmployeePage;
  let editPage: EditEmployeePage;

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

  test('Update › Existing Profile › Data Persistence', async ({ page }) => {
    const uniqueId = Date.now().toString();
    const firstName = `EditMe_${uniqueId}`;

    createPage = await employeeList.openCreateForm();
    await createPage.fillForm({ firstName });
    await createPage.submit();

    editPage = await employeeList.openEditForm(firstName);
    await editPage.fillForm({
      position: 'Senior',
      dailyWage: '600'
    });
    await editPage.saveChanges();

    await employeeList.viewEmployeeDetail(firstName);
    await expect(page.getByText('Senior')).toBeVisible();
    await expect(page.getByText('600')).toBeVisible();
  });
});
