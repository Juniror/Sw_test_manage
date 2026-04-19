import { test, expect } from '@playwright/test';
import { MainPage } from '../../pages/base/MainPage';
import { LoginPage } from '../../pages/base/LoginPage';
import { ExpenseListPage } from '../../pages/income_expenses/ExpenseListPage';
import { ExpenseFormPage } from '../../pages/income_expenses/ExpenseFormPage';
import { ProjectFormPage } from '../../pages/project/ProjectFormPage';

test.describe('Financial › Expense › Lifecycle', () => {
    let mainPage: MainPage;
    let loginPage: LoginPage;
    let expenseList: ExpenseListPage;
    let expenseForm: ExpenseFormPage;
    let projectForm: ProjectFormPage;

    test.beforeEach(async ({ page }) => {
        mainPage = new MainPage(page);
        loginPage = new LoginPage(page);
        expenseList = new ExpenseListPage(page);
        expenseForm = new ExpenseFormPage(page);
        projectForm = new ProjectFormPage(page);

        await loginPage.navigate();
        await loginPage.login();
        await mainPage.navigate();
    });

    async function setupFreshBill(page: any, billAmount: string = '100') {
        const id = Date.now().toString();
        const projectName = `LifecycleProj_${id}`;
        const storeName = `FutureStore_${id}`;

        // Create Project
        await projectForm.createNewProject({
            name: projectName,
            location: 'Lifecycle Test Site',
            budget: '5000',
            startDate: '2026-04-01',
            endDate: '2026-04-30'
        });

        // Add Bill directly after creation (should already be back on dashboard or similar)
        await page.waitForTimeout(2000); // Wait for dashboard refresh
        await page.getByRole('img', { name: projectName }).click();
        await page.getByRole('button', { name: /ดูค่าใช้จ่าย/, exact: false }).click();
        await expenseForm.openCreateForm();
        await expenseForm.fillForm({
            expenseType: 'Materials',
            amount: billAmount,
            date: '2026-04-19',
            storeName: storeName
        });
        await expenseForm.saveButton.click();
        await mainPage.waitForLoading();

        return { projectName, storeName };
    }

    test('Approval › Approve Bill Flow › Verify in History', async ({ page }) => {

        const { storeName } = await setupFreshBill(page);

        await expenseList.navigateToPendingBills();

        const billCard = page.locator('div.bg-white').filter({ hasText: storeName }).first();
        await expect(billCard).toBeVisible({ timeout: 20000 });

        await billCard.getByRole('button', { name: 'อนุมัติบิล' }).click();
        await page.getByRole('button', { name: 'ใช่, อนุมัติเลย' }).click();
        await mainPage.waitForLoading();

        // Verification
        await expenseList.navigateToBillHistory();
        await expenseList.filterByStatus('อนุมัติ');
        await expenseList.searchHistory(storeName);
        await expect(page.getByText(storeName)).toBeVisible();
    });

    test('Rejection › Reject Bill Flow › Verify in History', async ({ page }) => {
        const { storeName } = await setupFreshBill(page);

        await expenseList.navigateToPendingBills();

        const billCard = page.locator('div.bg-white').filter({ hasText: storeName }).first();
        await expect(billCard).toBeVisible({ timeout: 20000 });

        await billCard.getByRole('button', { name: 'ปฏิเสธบิล' }).click();
        await page.getByPlaceholder('ใส่เหตุผลของคุณที่นี่...').fill('Rejected for test');
        await page.getByRole('button', { name: 'ยืนยันการปฏิเสธ' }).click();
        await mainPage.waitForLoading();

        // Verification
        await expenseList.navigateToBillHistory();
        await expenseList.filterByStatus('ไม่อนุมัติ');
        await expenseList.searchHistory(storeName);
        await expect(page.getByText(storeName)).toBeVisible();
    });
});
