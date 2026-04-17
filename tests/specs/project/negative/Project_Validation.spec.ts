import { test, expect } from '@playwright/test';
import { MainPage } from '../../../pages/base/MainPage';
import { ProjectFormPage } from '../../../pages/project/ProjectFormPage';

test.describe('Project › Validation', () => {
  let mainPage: MainPage;
  let projectForm: ProjectFormPage;

  test.beforeEach(async ({ page }) => {
    mainPage = new MainPage(page);
    projectForm = new ProjectFormPage(page);

    await mainPage.navigate();
  });

  test.afterEach(async () => {
    // Reset page navigation for state isolation
    await mainPage.navigate();
  });

  test('Error › Missing Name › Browser Blocks', async ({ page }) => {
    await projectForm.clickAddProjectButton();
    
    // Attempt to submit with incomplete profile
    await projectForm.fillProjectLocation('Validation Test');
    await projectForm.clickCreateProjectButton();

    // Verify presence of HTML5 native validation on Name field
    const nameInput = page.getByRole('textbox', { name: 'เช่น โครงการก่อสร้าง A' });
    const validationMessage = await nameInput.evaluate((el: HTMLInputElement) => el.validationMessage);
    expect(validationMessage).toBeTruthy();
  });

  test('Error › Invalid Budget Format › Browser Blocks', async ({ page }) => {
    await projectForm.clickAddProjectButton();
    await projectForm.fillProjectName('FormatTest');
    
    // Trigger numeric format validation using non-standard characters
    await projectForm.fillProjectBudget('123e');
    await projectForm.clickCreateProjectButton();

    // Validate that inputs are properly sanitized or blocked at the browser level
    const budgetInput = page.getByPlaceholder('0.00').first();
    const validationMessage = await budgetInput.evaluate((el: HTMLInputElement) => el.validationMessage);
    expect(validationMessage).toBeTruthy();
  });
});
