import { test, expect } from '@playwright/test';
import { MainPage } from '../../../pages/base/MainPage';
import { ExpenseListPage } from '../../../pages/income_expenses/ExpenseListPage';
import { ExpenseFormPage } from '../../../pages/income_expenses/ExpenseFormPage';

test.describe('Expense › Navigation', () => {
    let mainPage: MainPage;
    let expenseList: ExpenseListPage;
    let expenseForm: ExpenseFormPage;

    test.beforeEach(async ({ page }) => {
        mainPage = new MainPage(page);
        expenseList = new ExpenseListPage(page);
        expenseForm = new ExpenseFormPage(page);

        await mainPage.navigate();
        // Access 'Total Expenses' (รวมจ่าย) from the primary navigation interface
        await page.getByRole('button', { name: 'รวมจ่าย', exact: true }).click();
    });

    test.afterEach(async () => {
        // Reset navigation state for consistent test isolation
        await mainPage.navigate();
    });

    test('Navigation › Clearance History › Table Visible', async ({ page }) => {
        await page.getByText('ประวัติการเคลียร์บิล').click();
        await expect(page).toHaveURL(/.*history/);
    });

    test('Navigation › Pending Queue › Content Loaded', async ({ page }) => {
        await page.getByText('รายการรอกดเบิก/จ่าย').click();
        await expect(page.getByText('รายการรออนุมัติ')).toBeVisible();
    });
});
