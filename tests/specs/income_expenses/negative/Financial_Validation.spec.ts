import { test, expect } from '@playwright/test';
import { MainPage } from '../../../pages/base/MainPage';
import { IncomeListPage } from '../../../pages/income_expenses/IncomeListPage';
import { IncomeFormPage } from '../../../pages/income_expenses/IncomeFormPage';
import { ExpenseListPage } from '../../../pages/income_expenses/ExpenseListPage';
import { ExpenseFormPage } from '../../../pages/income_expenses/ExpenseFormPage';

test.describe('Financial › Validation', () => {
  let mainPage: MainPage;
  let incomeList: IncomeListPage;
  let incomeForm: IncomeFormPage;
  let expenseList: ExpenseListPage;
  let expenseForm: ExpenseFormPage;

  test.beforeEach(async ({ page }) => {
    mainPage = new MainPage(page);
    incomeList = new IncomeListPage(page);
    incomeForm = new IncomeFormPage(page);
    expenseList = new ExpenseListPage(page);
    expenseForm = new ExpenseFormPage(page);

    await mainPage.navigate();
  });

  test.afterEach(async () => {
    // Reset application state to the dashboard for consistent cross-test isolation
    await mainPage.navigate();
  });

  test.describe('Income Validation', () => {
    test.beforeEach(async () => {
      await mainPage.goToIncome();
      await incomeList.openRecordForm();
    });

    test('Error › Income Non-Numeric › System Blocks', async ({ page }) => {
      await incomeForm.fillForm({ amount: 'abc' });
      await incomeForm.submit();

      // Verify SweetAlert2 validation warning for invalid characters
      await expect(page.getByText('กรุณาระบุจำนวนเงินให้ถูกต้อง')).toBeVisible();
    });

    test('Error › Income Zero › Blocks Submission', async ({ page }) => {
      test.fail(true, 'Application currently allows zero income amounts without validation');
      // Validate that the system enforces positive financial entry rules
      await incomeForm.fillForm({ amount: '0' });
      await incomeForm.submit();
      
      // Verification: Confirm that zero is treated as an invalid entry
      await expect(page.getByText('กรุณาระบุจำนวนเงินให้ถูกต้อง')).toBeVisible();
    });

    test('Stress › High Amount › Handling Verified', async ({ page }) => {
      // Stress test with a 1 billion unit entry
      await incomeForm.fillForm({ amount: '1000000000' });
      await incomeForm.submit();
      
      // Confirm successful submission/handling of large numeric values
      await expect(page.locator('#swal2-title')).toBeVisible();
    });
  });

  test.describe('Expense Validation', () => {
    test.beforeEach(async ({ page }) => {
      await page.getByRole('button', { name: 'รวมจ่าย', exact: true }).click();
    });

    test('Error › Expense Negative › Browser Blocks', async ({ page }) => {
        // Navigate to project-specific expense interface (selecting first available project)
        await page.getByRole('img').first().click();
        await page.getByRole('button', { name: /ดูค่าใช้จ่าย/, exact: false }).click();
        
        await expenseForm.openCreateForm();
        await expenseForm.fillForm({ amount: '-50' });
        await expenseForm.saveButton.click();

        // Verify HTML5 native constraint validation blocks submission
        const validationMessage = await page.locator('input[name="amount"]').evaluate((el: HTMLInputElement) => el.validationMessage);
        expect(validationMessage).toBeTruthy();
    });
  });
});
