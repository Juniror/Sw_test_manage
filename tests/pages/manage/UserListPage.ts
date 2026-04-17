import { Locator, expect, Page } from '@playwright/test';
 
 export class UserListPage {
   private readonly page: Page;
   readonly addUserButton: Locator;
 
   constructor(page: Page) {
     this.page = page;
     this.addUserButton = page.getByRole('button', { name: 'เพิ่มบัญชีผู้ใช้งาน' });
   }
 
   getUserRow(label: string): Locator {
     return this.page.locator('div.rounded-2xl')
       .filter({ hasText: label })
       .first();
   }
 
   async openCreateForm() {
     await this.addUserButton.waitFor({ state: 'visible' });
     await this.addUserButton.click();
   }
 
   async openEditForm(label: string) {
     const row = this.getUserRow(label);
     await row.waitFor({ state: 'visible' });
     await row.getByTitle('แก้ไข').click();
   }
 
   async deleteUser(label: string) {
     const row = this.getUserRow(label);
     await row.waitFor({ state: 'visible' });
     await row.getByTitle('ลบ').click();
 
     const confirmButton = this.page.getByRole('button', { name: 'ยืนยันการลบ' });
     await confirmButton.waitFor({ state: 'visible' });
     await confirmButton.click();
 
     await this.expectSuccess('ลบเรียบร้อย');
   }
 
   async expectUserInList(label: string) {
     const row = this.getUserRow(label);
     await expect(row).toBeVisible();
   }
 
   /**
    * Universal success verification helper.
    */
   async expectSuccess(message?: string) {
     if (message) {
       await expect(this.page.getByText(message)).toBeVisible();
     } else {
       // General success indicator fallback
       const successToast = this.page.locator('[class*="success"], [role="alert"]').first();
       await expect(successToast).toBeVisible();
     }
   }
 }
