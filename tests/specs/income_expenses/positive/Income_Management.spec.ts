import { test, expect } from '@playwright/test';
import { MainPage } from '../../../pages/base/MainPage';
import { IncomeListPage } from '../../../pages/income_expenses/IncomeListPage';
import { IncomeFormPage } from '../../../pages/income_expenses/IncomeFormPage';

test.describe('Income › Registration', () => {
  let mainPage: MainPage;
  let incomeList: IncomeListPage;
  let incomeForm: IncomeFormPage;

  test.beforeEach(async ({ page }) => {
    mainPage = new MainPage(page);
    incomeList = new IncomeListPage(page);
    incomeForm = new IncomeFormPage(page);

    await mainPage.navigate();
    await mainPage.goToIncome();
  });

  test.afterEach(async () => {
    // Standardize page state to the dashboard for consistent teardown
    await mainPage.navigate();
  });

  test('Registration › New Entry › Success', async ({ page }) => {
    const uniqueId = Date.now().toString().slice(-4);
    const incomeData = {
      category: '2', // Other category
      amount: '1234' + uniqueId,
      checkDate: '2026-04-29',
      transferDate: '2026-05-08'
    };

    await incomeList.openRecordForm();
    await incomeForm.fillForm(incomeData);
    await incomeForm.submit();
    
    // Assert successful submission via SweetAlert2 confirmation
    await expect(page.locator('#swal2-title')).toBeVisible();
  });

  test('UI › Category Dropdown › Multiple Options', async () => {
    await incomeList.openRecordForm();
    const categories = await incomeForm.getCategoryOptions();
    
    // Ensure the system provides at least basic categorization options
    expect(categories.length).toBeGreaterThan(1);
  });
});
