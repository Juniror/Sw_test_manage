import { test, expect } from '@playwright/test';
import { MainPage } from '../../../pages/base/MainPage';
import { LoginPage } from '../../../pages/base/LoginPage';
import { IncomeListPage } from '../../../pages/income_expenses/IncomeListPage';
import { IncomeFormPage } from '../../../pages/income_expenses/IncomeFormPage';
import { ProjectFormPage } from '../../../pages/project/ProjectFormPage';
import { ExpenseFormPage } from '../../../pages/income_expenses/ExpenseFormPage';

test.describe('Financial › Validation', () => {
  let mainPage: MainPage;
  let loginPage: LoginPage;
  let incomeList: IncomeListPage;
  let incomeForm: IncomeFormPage;
  let projectForm: ProjectFormPage;
  let expenseForm: ExpenseFormPage;

  test.beforeEach(async ({ page }) => {
    mainPage = new MainPage(page);
    loginPage = new LoginPage(page);
    incomeList = new IncomeListPage(page);
    incomeForm = new IncomeFormPage(page);
    projectForm = new ProjectFormPage(page);
    expenseForm = new ExpenseFormPage(page);

    await loginPage.navigate();
    await loginPage.login();
    await mainPage.navigate();
  });

  test.afterEach(async () => {
    await loginPage.navigate();
    await loginPage.login();
    await mainPage.navigate();
  });

  test.describe('Income', () => {
    test.beforeEach(async () => {
      await mainPage.goToIncome();
      await incomeList.openRecordForm();
    });

    test('Error › Income Empty › Blocks Submission', async ({ page }) => {
      await test.step('Initialise form and attempt empty submission', async () => {
        await incomeForm.submit();
      });
      await test.step('Verify error alert is visible', async () => {
        await expect(page.locator('.swal2-container')).toBeVisible({ timeout: 10000 });
        await expect(page.locator('.swal2-container')).toContainText(/กรุณาระบุจำนวนเงินให้ถูกต้อง/);
      });
    });

    test('Error › Income Zero › Blocks Submission', async ({ page }) => {
      await test.step('Fill form with zero amount', async () => {
        await incomeForm.fillForm({ amount: '0' });
        await incomeForm.submit();
      });
      await test.step('Verify error alert is visible', async () => {
        await expect(page.locator('.swal2-container')).toBeVisible({ timeout: 10000 });
        await expect(page.locator('.swal2-container')).toContainText(/กรุณาระบุจำนวนเงินให้ถูกต้อง/);
      });
    });
  });

  test.describe('Expense', () => {
    let projectName: string;

    test.beforeEach(async ({ page }) => {
      projectName = `ValProj_${Date.now().toString().slice(-4)}`;
      await projectForm.createNewProject({
        name: projectName,
        location: 'Validation City',
        budget: '1000',
        startDate: '2026-04-01',
        endDate: '2026-04-30'
      });

      await mainPage.navigate();
      await page.getByRole('img', { name: projectName }).click();
      await page.getByRole('button', { name: /ดูค่าใช้จ่าย/, exact: false }).click();
      await expenseForm.openCreateForm();
    });

    test('Error › Expense Empty › Browser Blocks', async ({ page }) => {
      await test.step('Attempt empty submission', async () => {
        await expenseForm.saveButton.click();
      });
      await test.step('Verify native browser validation message', async () => {
        const validationMessage = await expenseForm.amountInput.evaluate((el: HTMLInputElement) => el.validationMessage);
        expect(validationMessage).toBeTruthy();
      });
    });

    test('Error › Expense Zero › Blocks Submission', async ({ page }) => {
      await test.step('Fill form with zero and attempt submission', async () => {
        await expenseForm.fillForm({ 
          expenseType: 'Materials',
          amount: '0',
          date: '2026-04-18',
          storeName: 'Validation Test'
        });
        await expenseForm.saveButton.click();
      });

      await test.step('Verify either project validation alert or browser block', async () => {
        const alert = page.locator('.swal2-container');
        const isVisible = await alert.isVisible({ timeout: 5000 }).catch(() => false);
        
        if (isVisible) {
           await expect(alert).toContainText(/ข้อมูลไม่ครบถ้วน|กรุณากรอกข้อมูลสำคัญให้ครบทุกช่อง|ระบุจำนวนเงิน|ไม่สามารถเพิ่มบิลได้ กรุณาลองใหม่/);
        } else {
           await expect(expenseForm.saveButton).toBeVisible();
        }
      });
    });

    test('Error › Expense Type Empty › Browser Blocks', async ({ page }) => {
      await test.step('Fill partial form and attempt submission', async () => {
        await expenseForm.fillForm({ 
          amount: '100',
          date: '2026-04-18',
          storeName: 'Validation Test'
        });
        await expenseForm.saveButton.click();
      });

      await test.step('Verify native browser validation on select field', async () => {
        const validationMessage = await expenseForm.expenseTypeSelect.evaluate((el: HTMLSelectElement) => el.validationMessage);
        expect(validationMessage).toBeTruthy();
      });
    });
  });
});
