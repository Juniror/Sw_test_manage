import { test, expect } from '@playwright/test';
import { MainPage } from '../../../pages/base/MainPage';
import { LoginPage } from '../../../pages/base/LoginPage';
import { ExpenseListPage } from '../../../pages/income_expenses/ExpenseListPage';
import { ExpenseFormPage } from '../../../pages/income_expenses/ExpenseFormPage';

test.describe('Financial › Expense › History', () => {
    let mainPage: MainPage;
    let loginPage: LoginPage;
    let expenseList: ExpenseListPage;
    let expenseForm: ExpenseFormPage;

    test.beforeEach(async ({ page }) => {
        mainPage = new MainPage(page);
        loginPage = new LoginPage(page);
        await loginPage.navigate();
        await loginPage.login();
        expenseList = new ExpenseListPage(page);
        expenseForm = new ExpenseFormPage(page);

        await mainPage.navigate();
        await page.getByRole('button', { name: 'รวมจ่าย', exact: true }).click();
    });

    test.afterEach(async () => {
        await loginPage.navigate();
        await loginPage.login();
        await mainPage.navigate();
    });

    test('Navigation › Clearance History › Table Visible', async ({ page }) => {
        await expenseList.navigateToBillHistory();
        await expect(page.getByText('ประวัติรายละเอียดบิล')).toBeVisible();
    });

    test('Navigation › Pending Queue › Content Loaded', async ({ page }) => {
        await expenseList.navigateToPendingBills();
        await expect(page.getByText('บิลที่รอการอนุมัติ')).toBeVisible();
    });
});
