import { BasePage } from '../base/BasePage';
import { Locator, Page, expect } from '@playwright/test';
import { MainPage } from '../base/MainPage';
import { CreateEmployeePage } from './CreateEmployeePage';
import { EditEmployeePage } from './EditEmployeePage';

 export class EmployeeListPage extends BasePage {
   
   readonly addEmployeeButton: Locator;
   readonly employeeCards: Locator;

   constructor(page: Page) {
      super(page);
     
     this.addEmployeeButton = page.getByRole('button', { name: '+ เพิ่มพนักงาน', exact: true });

     this.employeeCards = page.locator('div.rounded-2xl');
   }

   async getEmployeeCard(name: string): Promise<Locator> {
     const mainPage = new MainPage(this.page);
     await mainPage.waitForLoading();
     
     // Ensure the container is present and at least one card exists before filtering
     await this.employeeCards.first().waitFor({ state: 'visible', timeout: 30000 });
     
     return this.employeeCards.filter({ has: this.page.getByText(name, { exact: true }) }).first();
   }

     async openCreateForm(): Promise<CreateEmployeePage> {

       await this.waitForLoading();
await this.addEmployeeButton.waitFor({ state: 'visible' });
     await this.addEmployeeButton.click();
     return new CreateEmployeePage(this.page);
   }

     async openEditForm(name: string): Promise<EditEmployeePage> {

       await this.waitForLoading();
const card = await this.getEmployeeCard(name);
     await card.waitFor({ state: 'visible' });

     await card.locator('button').filter({ has: this.page.locator('svg') }).first().click();
     return new EditEmployeePage(this.page);
   }

     async viewEmployeeDetail(name: string) {

       await this.waitForLoading();
const card = await this.getEmployeeCard(name);
     await card.waitFor({ state: 'visible' });
     await card.click();
   }

  async clickDeleteBtn(name: string) {
    await this.waitForLoading();
    const card = await this.getEmployeeCard(name);
    await card.waitFor({ state: 'visible' });

    // The delete button is the second button in the card (usually after the edit button)
    // We target the button containing an SVG that is NOT the first one
    await card.getByRole('button').filter({ has: this.page.locator('svg') }).nth(1).click();
  }

  async deleteEmployee(name: string) {
    await this.clickDeleteBtn(name);

    // The site uses a custom Tailwind modal, not standard SweetAlert2
    const confirmButton = this.page.getByRole('button', { name: 'ยืนยันการลบ', exact: true });
    await confirmButton.waitFor({ state: 'visible' });
    await confirmButton.click();
    
    // Wait for the modal to disappear
    await expect(confirmButton).not.toBeVisible();
    await this.waitForLoading();
  }

     async expectEmployeeInList(name: string) {

       await this.waitForLoading();
const card = await this.getEmployeeCard(name);

     await expect(card).toBeVisible({ timeout: 15000 });
   }
 }
