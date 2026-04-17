import { Locator, Page } from '@playwright/test';
 
 export interface BillData {
   expenseType: string;
   date: string;
   amount: string;
   storeName: string;
 }
 
 /**
  * ExpenseFormPage Object Model.
  * Handles interactions with the expense/bill recording form.
  */
 export class ExpenseFormPage {
   private readonly page: Page;
   readonly addBillButton: Locator;
   readonly expenseTypeSelect: Locator;
   readonly expenseDateInput: Locator;
   readonly amountInput: Locator;
   readonly storeNameInput: Locator;
   readonly saveButton: Locator;
 
   constructor(page: Page) {
     this.page = page;
     // Priority 1: getByRole
     this.addBillButton = page.getByRole('button', { name: 'เพิ่มบิลค่าใช้จ่าย', exact: true });
     // Priority 1: getByRole (combobox)
     this.expenseTypeSelect = page.getByRole('combobox');
     // Priority 3: getByLabel/Placeholder
     this.expenseDateInput = page.locator('input[name="expense_date"]');
     this.amountInput = page.getByPlaceholder('0.00');
     // Priority 1: getByRole (targeting specific textbox name if available)
     this.storeNameInput = page.getByRole('textbox', { name: 'ชื่อร้านค้า', exact: true }).or(page.locator('input[name="store_name"]')).first();
     this.saveButton = page.getByRole('button', { name: 'บันทึกข้อมูล', exact: true });
   }
 
   /**
    * Opens the bill creation form.
    */
   async openCreateForm() {
     await this.addBillButton.waitFor({ state: 'visible' });
     await this.addBillButton.click();
   }
 
   /**
    * Fills the bill form with provided data.
    * @param data The bill details to populate.
    */
   async fillForm(data: Partial<BillData>) {
     const fill = async (locator: Locator, value?: string) => {
       if (value !== undefined) {
         await locator.waitFor({ state: 'visible' });
         await locator.fill(value);
       }
     };
 
     if (data.expenseType) {
       await this.expenseTypeSelect.selectOption({ label: data.expenseType });
     }
 
     await fill(this.expenseDateInput, data.date);
     await fill(this.amountInput, data.amount);
     await fill(this.storeNameInput, data.storeName);
   }
 
   /**
    * Submits the bill form and waits for processing to complete.
    */
   async submit() {
     await this.saveButton.click();
     await this.saveButton.waitFor({ state: 'hidden' });
   }
 }
