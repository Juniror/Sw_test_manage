import { test, expect } from '@playwright/test';
import { MainPage } from '../../../pages/base/MainPage';
import { EmployeeListPage } from '../../../pages/employee/EmployeeListPage';
import { EmployeeFormPage } from '../../../pages/employee/EmployeeFormPage';

test.describe('Employee › Delete', () => {
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
    // Reset navigation to a stable state for resilient cleanup
    await mainPage.navigate();
    await mainPage.goToEmployees();

    for (const name of employeesToDelete) {
      await employeeList.deleteEmployee(name).catch(() => {});
    }
    employeesToDelete = [];
  });

  test('Delete › Existing Record › Success & Removed', async ({ page }) => {
    const uniqueId = Date.now().toString().slice(-4);
    const firstName = `DeleteMe_${uniqueId}`;
    
    // Create a temporary employee for the deletion test
    await employeeList.openCreateForm();
    await employeeForm.fillForm({ firstName });
    await employeeForm.submit();

    await expect(page.locator('#swal2-title')).toBeVisible();
    await employeeList.expectEmployeeInList(firstName);
    employeesToDelete.push(firstName);

    // Execute deletion workflow
    await employeeList.deleteEmployee(firstName);

    // Assert that the record is no longer present in the list
    const card = employeeList.getEmployeeCard(firstName);
    await expect(card).not.toBeVisible();
  });

  test('Safety › Cancel Deletion › Record Persists', async ({ page }) => {
    const uniqueId = Date.now().toString().slice(-4);
    const firstName = `SafeStay_${uniqueId}`;
    
    // Setup: Create record
    await employeeList.openCreateForm();
    await employeeForm.fillForm({ firstName });
    await employeeForm.submit();
    await expect(page.locator('#swal2-title')).toBeVisible();
    employeesToDelete.push(firstName);

    // Trigger Delete Dialog
    const card = employeeList.getEmployeeCard(firstName);
    await card.getByTitle('ลบ').click();

    // Verify SweetAlert2 dialog is visible
    await expect(page.locator('.swal2-popup')).toBeVisible();
    
    // Safety Action: Click 'No, keep it' (Cancel button)
    await page.getByRole('button', { name: 'No, keep it', exact: false }).click();

    // Verification: Confirm record remains visible and dialog is closed
    await expect(page.locator('.swal2-popup')).not.toBeVisible();
    await employeeList.expectEmployeeInList(firstName);
  });
});
