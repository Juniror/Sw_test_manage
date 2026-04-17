import { test, expect } from '@playwright/test';
import { MainPage } from '../../../pages/base/MainPage';
import { EmployeeListPage } from '../../../pages/employee/EmployeeListPage';
import { EmployeeFormPage } from '../../../pages/employee/EmployeeFormPage';

test.describe('Employee › Create', () => {
  let mainPage: MainPage;
  let employeeList: EmployeeListPage;
  let employeeForm: EmployeeFormPage;
  let employeesToDelete: string[] = [];

  test.beforeEach(async ({ page }) => {
    mainPage = new MainPage(page);
    employeeList = new EmployeeListPage(page);
    employeeForm = new EmployeeFormPage(page);

    await mainPage.navigate();
    await mainPage.goToEmployees();
  });

  test.afterEach(async () => {
    // Ensure navigation back to the employee list for reliable teardown
    await mainPage.navigate();
    await mainPage.goToEmployees();

    for (const name of employeesToDelete) {
      await employeeList.deleteEmployee(name).catch(() => {});
    }
    employeesToDelete = [];
  });

  test('Create › Mandatory Fields › Success', async () => {
    const uniqueId = Date.now().toString().slice(-4);
    const firstName = `ReqOnly_${uniqueId}`;
    
    await employeeList.openCreateForm();
    await employeeForm.fillForm({ firstName });
    await employeeForm.submit();

    await employeeList.expectEmployeeInList(firstName);
    employeesToDelete.push(firstName);
  });

  test('Create › All Fields › Success & Visible in List', async ({ page }) => {
    const uniqueId = Date.now().toString().slice(-4);
    const firstName = `FullDetail_${uniqueId}`;
    const lastName = `Test`;
    const fullName = `${firstName} ${lastName}`;
    
    await employeeList.openCreateForm();
    await employeeForm.fillForm({
      firstName,
      lastName,
      nickname: `Nick_${uniqueId}`,
      position: 'Senior Engineer',
      phone: '0812345678',
      nationalId: '1234567890123',
      dailyWage: '500',
      status: 'พนักงานปรกติ'
    });
    await employeeForm.submit();
 
    // Verify successful submission via unique identity (Full Name) and Success Notification
    await page.locator('#swal2-title').waitFor({ state: 'visible' });
    await expect(page.locator('#swal2-title')).toBeVisible();
    await employeeList.expectEmployeeInList(fullName);
    
    employeesToDelete.push(fullName);
  });
});
