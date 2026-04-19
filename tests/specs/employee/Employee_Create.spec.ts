import { test, expect } from '@playwright/test';
import { MainPage } from '../../pages/base/MainPage';
import { LoginPage } from '../../pages/base/LoginPage';
import { EmployeeListPage } from '../../pages/employee/EmployeeListPage';
import { CreateEmployeePage } from '../../pages/employee/CreateEmployeePage';

test.describe('Employee › Create', () => {
  let mainPage: MainPage;
  let loginPage: LoginPage;
  let employeeList: EmployeeListPage;
  let createPage: CreateEmployeePage;

  test.beforeEach(async ({ page }) => {
    mainPage = new MainPage(page);
    loginPage = new LoginPage(page);
    
    await test.step('Setup: Login and Go to Employee List', async () => {
      await loginPage.navigate();
      await loginPage.login();
      employeeList = new EmployeeListPage(page);
      await mainPage.navigate();
      await mainPage.goToEmployees();
    });
  });

  test.afterEach(async () => {
    await test.step('Teardown: Return to Main', async () => {
      await loginPage.navigate();
      await loginPage.login();
      await mainPage.navigate();
    });
  });

  test('Full Details › New Active Employee', async ({ page }) => {
    const uniqueId = Date.now().toString();
    const firstName = `FullDetail_${uniqueId}`;
    const lastName = `Test`;
    const fullName = `${firstName} ${lastName}`;

    await test.step('Action: Open and Fill Create Form', async () => {
      createPage = await employeeList.openCreateForm();
      await createPage.fillForm({
        firstName,
        lastName,
        position: 'Senior Engineer',
        phone: '0812345678',
        nationalId: '1234567890123',
        dailyWage: '500',
        status: 'Active'
      });
      await createPage.submit();
    });

    await test.step('Verify: Employee Visible in List', async () => {
      await employeeList.expectEmployeeInList(fullName);
    });
  });
});
