import { Page, Locator } from '@playwright/test';

 export class MainPage {
   private readonly page: Page;
   readonly navUserManagement: Locator;

   constructor(page: Page) {
     this.page = page;
     this.navUserManagement = page.getByRole('button', { name: 'จัดการผู้ใช้' });
   }

   async goToManagePage() {
     await this.navUserManagement.click();
   }
 }
