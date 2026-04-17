import { Locator, Page } from '@playwright/test';
 
 export interface IncomeData {
   category: string;
   amount: string;
   checkDate?: string;
   transferDate?: string;
 }
 
 /**
  * IncomeFormPage Object Model.
  * Handles interactions with the income recording form.
  */
 export class IncomeFormPage {
   private readonly page: Page;
   readonly categorySelect: Locator;
   readonly amountInput: Locator;
   readonly checkDateInput: Locator;
   readonly transferDateInput: Locator;
   readonly submitButton: Locator;
 
   constructor(page: Page) {
     this.page = page;
     // Priority 1: getByRole
     this.categorySelect = page.getByRole('combobox');
     // Priority 3: getByPlaceholder
     this.amountInput = page.getByPlaceholder('0.00');
     // Priority 3: getByLabel/Placeholder (using name attribute as fallback if labels are missing)
     this.checkDateInput = page.locator('input[name="check_date"]');
     this.transferDateInput = page.locator('input[name="transfer_date"]');
     this.submitButton = page.getByRole('button', { name: 'บันทึกข้อมูลรายรับ', exact: true });
   }
 
   /**
    * Fills the income form with provided data.
    * @param data The income details to populate.
    */
   async fillForm(data: Partial<IncomeData>) {
     if (data.category) {
       await this.categorySelect.waitFor({ state: 'visible' });
       await this.categorySelect.selectOption(data.category);
     }
 
     if (data.amount) {
       await this.amountInput.waitFor({ state: 'visible' });
       await this.amountInput.clear();
       await this.amountInput.pressSequentially(data.amount);
     }
 
     if (data.checkDate) {
       await this.checkDateInput.fill(data.checkDate);
     }
 
     if (data.transferDate) {
       await this.transferDateInput.fill(data.transferDate);
     }
   }
 
   /**
    * Submits the income form and waits for processing to complete.
    */
   async submit() {
     await this.submitButton.click();
     await this.submitButton.waitFor({ state: 'hidden' });
   }
 
   /**
    * Retrieves all available category options from the dropdown.
    * @returns A list of category names/values.
    */
   async getCategoryOptions(): Promise<string[]> {
     await this.categorySelect.waitFor({ state: 'visible' });
     return await this.categorySelect.locator('option').allTextContents();
   }
 }
