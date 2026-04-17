import { test, expect } from '@playwright/test';
import { MainPage } from '../../../pages/base/MainPage';
import { EmployeeListPage } from '../../../pages/employee/EmployeeListPage';
import { EmployeeFormPage } from '../../../pages/employee/EmployeeFormPage';

test.describe('Employee › Validation', () => {
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
    await employeeList.openCreateForm();
  });

  test.afterEach(async () => {
    // Standard cleanup: ensure navigation back to list view for record deletion
    await mainPage.navigate();
    await mainPage.goToEmployees();

    for (const name of employeesToDelete) {
      await employeeList.deleteEmployee(name).catch(() => {});
    }
    employeesToDelete = [];
  });

  test('Create › Missing Fields › Browser Denies', async () => {
    // Populate form with optional fields only
    await employeeForm.fillForm({
        lastName: 'NoFirstName'
    });

    // Verify presence of HTML5 required attribute error on first name field
    await employeeForm.expectRequiredError(employeeForm.firstNameInput);
  });

  test('Safety › Cancel Creation › Record Not Saved', async ({ page }) => {
    const uniqueId = Date.now().toString().slice(-4);
    const firstName = `CancelMe_${uniqueId}`;
    
    await employeeForm.fillForm({ firstName });
    employeesToDelete.push(firstName);
    
    // Navigate away using the 'Back' action
    await page.getByRole('button', { name: 'Back' }).click();
    
    // Validate that the record was not persisted
    const card = employeeList.getEmployeeCard(firstName);
    await expect(card).not.toBeVisible();
  });

  test.describe('Format Error Handling', () => {
    test('Error › Phone Format › System Rejects', async () => {
      test.fail(true, 'Application currently lacks server-side validation for phone number formats');
      await employeeForm.fillForm({
        firstName: 'PhoneTest',
        phone: 'ABC-123!'
      });
      await employeeForm.saveButton.click();

      // Verify custom validation error message is displayed
      await employeeForm.expectRequiredFieldErrorMessage(employeeForm.phoneInput);
    });

    test('Error › National ID Format › System Rejects', async () => {
      test.fail(true, 'Application currently lacks server-side validation for National ID formats');
      await employeeForm.fillForm({
        firstName: 'IDTest',
        nationalId: 'ID-INVALID!'
      });
      await employeeForm.saveButton.click();

      await employeeForm.expectRequiredFieldErrorMessage(employeeForm.nationalIdInput);
    });

    test('Error › Negative Wage › System Rejects', async () => {
      test.fail(true, 'Application currently lacks server-side validation for negative wage amounts');
      await employeeForm.fillForm({
        firstName: 'WageTest',
        dailyWage: '-100'
      });
      await employeeForm.saveButton.click();

      await employeeForm.expectRequiredFieldErrorMessage(employeeForm.dailyWageInput);
    });

    test('Stress › Long Name › UI Stability', async ({ page }) => {
      test.fail(true, 'Application currently fails to process or display success for excessively large string inputs');
      const longName = 'A'.repeat(150); // Stress test with 150 characters
      
      await employeeForm.fillForm({
        firstName: longName,
        lastName: 'StressTest'
      });
      await employeeForm.submit();
      
      // Verification: The system should either save it or show a validation error; 
      // primarily we verify it doesn't crash the session.
      await expect(page.locator('#swal2-title')).toBeVisible();
      employeesToDelete.push(longName);
    });
  });

  test.describe('Edit Mode Validation', () => {
    test('Error › Update Validity › Data Reverted', async ({ page }) => {
      test.fail(true, 'Application currently lacks server-side validation for phone updates in edit mode');
      const uniqueId = Date.now().toString().slice(-4);
      const firstName = `EditVal_${uniqueId}`;
      
      // Setup phase: Create a valid baseline record
      await page.getByRole('button', { name: 'Back' }).click();
      await employeeList.openCreateForm();
      await employeeForm.fillForm({ firstName });
      await employeeForm.submit();
      employeesToDelete.push(firstName);

      // Action phase: Attempt to update record with invalid phone format
      await employeeList.openEditForm(firstName);
      await employeeForm.fillForm({ phone: 'INVALID-PHONE' });
      await employeeForm.saveButton.click();

      // Verification phase: Confirm validation blocks the update
      await employeeForm.expectRequiredFieldErrorMessage(employeeForm.phoneInput);
    });
  });
});
