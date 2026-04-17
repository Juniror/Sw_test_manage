import { test, expect } from '@playwright/test';
import { MainPage } from '../../../pages/base/MainPage';
import { EmployeeListPage } from '../../../pages/employee/EmployeeListPage';
import { EmployeeFormPage } from '../../../pages/employee/EmployeeFormPage';

test.describe('Employee › Update', () => {
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
    // Reset navigation state for reliable cleanup of test data
    await mainPage.navigate();
    await mainPage.goToEmployees();

    for (const name of employeesToDelete) {
      await employeeList.deleteEmployee(name).catch(() => {});
    }
    employeesToDelete = [];
  });

  test('Update › Position & Wage › Success & Data Persisted', async ({ page }) => {
    const uniqueId = Date.now().toString().slice(-4);
    const firstName = `EditMe_${uniqueId}`;
    
    // Create a temporary employee for the update test
    await employeeList.openCreateForm();
    await employeeForm.fillForm({ 
        firstName,
        position: 'Junior'
    });
    await employeeForm.submit();
    await page.locator('#swal2-title').waitFor({ state: 'visible' });
    await expect(page.locator('#swal2-title')).toBeVisible();
    employeesToDelete.push(firstName);

    // Apply updates to the record
    await employeeList.openEditForm(firstName);
    await employeeForm.fillForm({
      position: 'Senior',
      dailyWage: '600'
    });
    await employeeForm.submit();
    await page.locator('#swal2-title').waitFor({ state: 'visible' });
    await expect(page.locator('#swal2-title')).toBeVisible();

    // Verify changes are persisted correctly in the detail view
    await employeeList.viewEmployeeDetail(firstName);
    await expect(page.getByText('Senior')).toBeVisible();
    await expect(page.getByText('600')).toBeVisible();
  });
});
