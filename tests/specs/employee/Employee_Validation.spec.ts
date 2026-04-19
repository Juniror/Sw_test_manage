import { test, expect } from '@playwright/test';
import { MainPage } from '../../pages/base/MainPage';
import { LoginPage } from '../../pages/base/LoginPage';
import { EmployeeListPage } from '../../pages/employee/EmployeeListPage';
import { CreateEmployeePage } from '../../pages/employee/CreateEmployeePage';
import { EditEmployeePage } from '../../pages/employee/EditEmployeePage';

test.describe('Employee › Validation', () => {
  let mainPage: MainPage;
  let loginPage: LoginPage;
  let employeeList: EmployeeListPage;
  let createPage: CreateEmployeePage;
  let editPage: EditEmployeePage;

  test.beforeEach(async ({ page }) => {
    mainPage = new MainPage(page);
    loginPage = new LoginPage(page);
    employeeList = new EmployeeListPage(page);

    await loginPage.navigate();
    await loginPage.login();
    await mainPage.navigate();
    await mainPage.goToEmployees();
  });

  test.afterEach(async () => {
    await loginPage.navigate();
    await loginPage.login();
    await mainPage.navigate();
  });

  test('Create › Missing First Name › Native Error', async () => {
    createPage = await employeeList.openCreateForm();
    await createPage.fillForm({
      lastName: 'NoFirstName'
    });
    
    // Clicking save should trigger browser validation
    await createPage.saveButton.click();
    
    // Verify native validation message is present
    await createPage.expectRequiredFieldErrorMessage(createPage.firstNameInput);
  });
  
  test('Create › Missing Last Name › Required Verification', async () => {
    test.fail(true,"สามารถสร้างข้อมูลได้โดยไม่ใส่ Lastname")
    createPage = await employeeList.openCreateForm();
    await createPage.fillForm({
      firstName: 'NoLastName'
    });
    
    // Clicking save should trigger validation (Expected to FAIL if not required)
    await createPage.saveButton.click();
    
    // Verify native validation message is present
    await createPage.expectRequiredFieldErrorMessage(createPage.lastNameInput);
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

  test.describe('Integrity Constraints', () => {
    test.beforeEach(async () => {
      createPage = await employeeList.openCreateForm();
    });

    test('Create › Non-numeric Phone › System Failure', async () => {
      test.fail(true, 'สามารถใส่ตัวหนังสือในช่อง phone ได้');
      await createPage.fillForm({
        firstName: 'PhoneTest',
        phone: 'ABC-123!'
      });
      await createPage.saveButton.click();
    });

    test('Create › Non-numeric ID › System Failure', async () => {
      test.fail(true, 'สามารถใส่ตัวหนังสือในช่อง nationalId ได้');
      await createPage.fillForm({
        firstName: 'IDTest',
        nationalId: 'ID-INVALID!'
      });
      await createPage.saveButton.click();
    });

    test('Create › Negative Wage › System Failure', async () => {
      test.fail(true, 'สามารถใส่ตัวเลขติดลบในช่อง dailyWage ได้');
      await createPage.fillForm({
        firstName: 'WageTest',
        dailyWage: '-100'
      });
      await createPage.saveButton.click();
    });

    test('Stress › Excessive Input › Stability', async () => {
      test.fail(true, 'สามารถใส่ตัวอักษรจำนวนมากในช่อง firstname ได้');
      const longName = 'A'.repeat(150);

      await createPage.fillForm({
        firstName: longName,
        lastName: 'StressTest'
      });
      await createPage.submit();
    });
  });

  test.describe('Update Constraints', () => {
    test('Update › Non-numeric Phone › System Failure', async ({ page }) => {
      test.fail(true, 'ตอน Edit สามารถใส่ตัวหนังสือในช่อง phone ได้');
      const uniqueId = Date.now().toString();
      const firstName = `EditVal_${uniqueId}`;

      createPage = await employeeList.openCreateForm();
      await createPage.fillForm({ firstName });
      await createPage.submit();

      editPage = await employeeList.openEditForm(firstName);
      await editPage.fillForm({ phone: 'INVALID-PHONE' });
      await editPage.saveButton.click();
    });
  });
});
