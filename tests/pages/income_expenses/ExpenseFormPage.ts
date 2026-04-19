import { BasePage } from '../base/BasePage';
import { Locator, Page } from '@playwright/test';

  export interface BillData {
    expenseType: string;
    date: string;
    amount: string;
    storeName: string;
  }

  export class ExpenseFormPage extends BasePage {
    
    readonly addBillButton: Locator;
    readonly expenseTypeSelect: Locator;
    readonly expenseDateInput: Locator;
    readonly amountInput: Locator;
    readonly storeNameInput: Locator;
    readonly saveButton: Locator;

    constructor(page: Page) {
       super(page);
      

      this.addBillButton = page.getByRole('button', { name: 'เพิ่มบิลค่าใช้จ่าย', exact: true });

      this.expenseTypeSelect = page.locator('select[name="expense_type"]');

      this.expenseDateInput = page.locator('input[name="expense_date"]');
      this.amountInput = page.getByPlaceholder('0.00');

      this.storeNameInput = page.getByRole('textbox', { name: 'ชื่อร้านค้า', exact: true }).or(page.locator('input[name="store_name"]')).first();
      this.saveButton = page.getByRole('button', { name: 'บันทึกข้อมูล', exact: true });
    }

      async openCreateForm() {

        await this.waitForLoading();
 await this.addBillButton.waitFor({ state: 'visible' });
      await this.addBillButton.click();
    }

      async fillForm(data: Partial<BillData>) {

        await this.waitForLoading();
 const fill = async (locator: Locator, value?: string) => {
        if (value !== undefined) {
          await locator.waitFor({ state: 'visible' });
          await locator.fill(value);
        }
      };

      if (data.expenseType) {
        await this.expenseTypeSelect.selectOption({ value: data.expenseType });
      }

      await fill(this.expenseDateInput, data.date);
      await fill(this.amountInput, data.amount);
      await fill(this.storeNameInput, data.storeName);
    }

      async submit() {

        await this.waitForLoading();
 await this.saveButton.click();
      await this.saveButton.waitFor({ state: 'hidden' });
    }
  }
