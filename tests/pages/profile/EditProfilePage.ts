import { Locator, Page, expect } from '@playwright/test';
 
 export interface ProfileData {
   displayName?: string;
   firstName?: string;
   lastName?: string;
   phone?: string;
 }
 
 export class EditProfilePage {
   private readonly page: Page;
   readonly editProfileButton: Locator;
   readonly displayNameInput: Locator;
   readonly firstNameInput: Locator;
   readonly lastNameInput: Locator;
   readonly phoneInput: Locator;
   readonly saveButton: Locator;
   readonly okButton: Locator;
 
   constructor(page: Page) {
     this.page = page;
     this.editProfileButton = page.getByRole('button', { name: 'แก้ไขโปรไฟล์' });
     this.displayNameInput = page.locator('input[name="display_name"]');
     this.firstNameInput = page.locator('input[name="first_name"]');
     this.lastNameInput = page.locator('input[name="last_name"]');
     this.phoneInput = page.locator('input[name="phone"]');
     this.saveButton = page.getByRole('button', { name: 'บันทึกข้อมูล' });
     this.okButton = page.getByRole('button', { name: 'OK' });
   }
 
   async openEditForm() {
     await this.editProfileButton.waitFor({ state: 'visible' });
     await this.editProfileButton.click();
   }
 
   async fillForm(data: ProfileData) {
     const fill = async (locator: Locator, value?: string) => {
       if (value !== undefined) {
         await locator.waitFor({ state: 'visible' });
         await locator.fill(value);
       }
     };
 
     await fill(this.displayNameInput, data.displayName);
     await fill(this.firstNameInput, data.firstName);
     await fill(this.lastNameInput, data.lastName);
     await fill(this.phoneInput, data.phone);
   }
 
   async submit() {
     await this.saveButton.click();
     if (await this.okButton.isVisible()) {
       await this.okButton.click();
     }
   }
 
   async navigateToProfile() {
     await this.page.getByRole('button', { name: 'โปรไฟล์' }).click();
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
