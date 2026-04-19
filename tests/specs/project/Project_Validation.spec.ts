import { test, expect } from '@playwright/test';
import { MainPage } from '../../pages/base/MainPage';
import { LoginPage } from '../../pages/base/LoginPage';
import { ProjectFormPage } from '../../pages/project/ProjectFormPage';

test.describe('Project › Validation › Form Constraints', () => {
  let mainPage: MainPage;
  let loginPage: LoginPage;
  let projectForm: ProjectFormPage;

  test.beforeEach(async ({ page }) => {
    mainPage = new MainPage(page);
    loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login();
    projectForm = new ProjectFormPage(page);

    await mainPage.navigate();
  });

  test.afterEach(async () => {
    await loginPage.navigate();
    await loginPage.login();
    await mainPage.navigate();
  });

  test('Create › Missing Name › Native Error', async ({ page }) => {
    await projectForm.clickAddProjectButton();
    // Click submit directly — do NOT use clickCreateProjectButton() which waits for swal2
    await page.getByRole('button', { name: 'สร้างไซต์งาน' }).click();

    const nameInput = page.getByRole('textbox', { name: 'เช่น โครงการก่อสร้าง A' });
    const validationMessage = await nameInput.evaluate((el: HTMLInputElement) => el.validationMessage);
    expect(validationMessage).toBeTruthy();
  });

  test('Create › Missing Address › Native Error', async ({ page }) => {
    await projectForm.clickAddProjectButton();
    await projectForm.fillProjectName('TestProject');
    await page.getByRole('button', { name: 'สร้างไซต์งาน' }).click();

    const addressInput = page.getByRole('textbox', { name: 'ระบุที่ตั้งโดยสังเขป' });
    const validationMessage = await addressInput.evaluate((el: HTMLInputElement) => el.validationMessage);
    expect(validationMessage).toBeTruthy();
  });

  test('Create › Missing Start Date › Native Error', async ({ page }) => {
    await projectForm.clickAddProjectButton();
    await projectForm.fillProjectName('TestProject');
    await projectForm.fillProjectLocation('TestLocation');
    await page.getByRole('button', { name: 'สร้างไซต์งาน' }).click();

    const startDateInput = page.locator('input[name="start_date"]');
    const validationMessage = await startDateInput.evaluate((el: HTMLInputElement) => el.validationMessage);
    expect(validationMessage).toBeTruthy();
  });

  test('Create › Invalid Budget Format › Native Error', async ({ page }) => {
    await projectForm.clickAddProjectButton();
    await projectForm.fillProjectName('FormatTest');
    await projectForm.fillProjectBudget('123e');
    await page.getByRole('button', { name: 'สร้างไซต์งาน' }).click();

    const budgetInput = page.getByPlaceholder('0.00').first();
    const validationMessage = await budgetInput.evaluate((el: HTMLInputElement) => el.validationMessage);
    expect(validationMessage).toBeTruthy();
  });

  test('Create › Negative Budget › Server Exception', async ({ page }) => {
    await projectForm.clickAddProjectButton();
    await projectForm.fillProjectName('NegBudgetTest');
    await projectForm.fillProjectLocation('TestLocation');
    await projectForm.fillStartDate('2026-04-22');
    await projectForm.fillProjectBudget('-100');
    await page.getByRole('button', { name: 'สร้างไซต์งาน' }).click();

    // Server returns 500 and shows error popup
    await expect(page.getByText('เกิดข้อผิดพลาด')).toBeVisible();
    await page.getByRole('button', { name: 'OK' }).click();
  });
});
