import { Locator, Page, expect } from '@playwright/test';
 
 /**
  * EmployeeListPage Object Model.
  * Handles the listing of employees, navigation to detail/edit, and deletion workflows.
  */
 export class EmployeeListPage {
   private readonly page: Page;
   readonly addEmployeeButton: Locator;
   readonly employeeCards: Locator;
 
   constructor(page: Page) {
     this.page = page;
     this.addEmployeeButton = page.getByRole('button', { name: '+ เพิ่มพนักงาน', exact: true });
     // Relaxed locator: remove 'main' dependency as it's not present on all layouts
     this.employeeCards = page.locator('div.rounded-2xl');
   }
 
   /**
    * Retrieves an employee card locator by name.
    */
   getEmployeeCard(name: string): Locator {
     // Use Has+GetByText for precision, using .first() to handle any potential header/footer duplicates
     return this.employeeCards.filter({ has: this.page.getByText(name, { exact: true }) }).first();
   }
 
   /**
    * Navigates to the employee creation form.
    */
   async openCreateForm() {
     await this.addEmployeeButton.waitFor({ state: 'visible' });
     await this.addEmployeeButton.click();
   }
 
   /**
    * Navigates to the edit form for a specific employee.
    */
   async openEditForm(name: string) {
     const card = this.getEmployeeCard(name);
     await card.waitFor({ state: 'visible' });
     // Target the record actions within the card
     await card.locator('button').filter({ has: this.page.locator('svg') }).first().click(); 
   }
 
   /**
    * Navigates to the employee detail view.
    */
   async viewEmployeeDetail(name: string) {
     const card = this.getEmployeeCard(name);
     await card.waitFor({ state: 'visible' });
     await card.click();
   }
 
   /**
    * Performs an atomic delete of an employee record with confirmation.
    */
   async deleteEmployee(name: string) {
     const card = this.getEmployeeCard(name);
     await card.waitFor({ state: 'visible' });
     
     // Trigger bin icon (usually the last button in the actions group)
     await card.getByRole('button').last().click(); 
 
     // Handle Popup
     const confirmButton = this.page.getByRole('button', { name: 'ยืนยันการลบ', exact: true });
     await confirmButton.waitFor({ state: 'visible' });
     await confirmButton.click();
   }
 
   /**
    * Verifies an employee is in the list.
    */
   async expectEmployeeInList(name: string) {
     const card = this.getEmployeeCard(name);
     // Use a shorter timeout or explicit wait to confirm visibility
     await expect(card).toBeVisible({ timeout: 15000 });
   }
 }
