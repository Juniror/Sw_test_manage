import { test, expect } from '@playwright/test';
import { MainPage } from '../../../pages/base/MainPage';
import { LoginPage } from '../../../pages/base/LoginPage';
import { IncomeListPage } from '../../../pages/income_expenses/IncomeListPage';
import { IncomeFormPage } from '../../../pages/income_expenses/IncomeFormPage';

test.describe('Financial › Income › Management', () => {
  let mainPage: MainPage;
  let loginPage: LoginPage;
  let incomeList: IncomeListPage;
  let incomeForm: IncomeFormPage;

  test.beforeEach(async ({ page }) => {
    mainPage = new MainPage(page);
    loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login();
    incomeList = new IncomeListPage(page);
    incomeForm = new IncomeFormPage(page);

    await mainPage.navigate();
    await mainPage.goToIncome();
  });

  test.afterEach(async () => {
    await loginPage.navigate();
    await loginPage.login();
    await mainPage.navigate();
  });

  test('Registration › New Entry › Record Verified', async ({ page }) => {
    const uniqueId = Date.now().toString().slice(-4);
    const incomeData = {
      category: '72',
      amount: '1234' + uniqueId,
      checkDate: '2026-04-29',
      transferDate: '2026-05-08'
    };

    await incomeList.openRecordForm();
    await incomeForm.fillForm(incomeData);
    await incomeForm.submit();
  });
});
