import { Locator, Page } from '@playwright/test';
 import { UserData } from './CreateUserPage';
 
 export class EditUserPage {
   private readonly page: Page;
   readonly usernameInput: Locator;
   readonly emailInput: Locator;
   readonly displayNameInput: Locator;
   readonly firstNameInput: Locator;
   readonly lastNameInput: Locator;
   readonly nicknameInput: Locator;
   readonly phoneInput: Locator;
   readonly roleSelect: Locator;
   readonly saveChangesButton: Locator;
 
   constructor(page: Page) {
     this.page = page;
 
     this.usernameInput = page.locator('input[name="username"]');
     this.emailInput = page.locator('input[name="email"]');
     this.displayNameInput = page.locator('input[name="display_name"]');
     this.firstNameInput = page.locator('input[name="first_name"]');
     this.lastNameInput = page.locator('input[name="last_name"]');
     this.nicknameInput = page.locator('input[name="nickname"]');
     this.phoneInput = page.locator('input[name="phone"]');
 
     this.roleSelect = page.locator('select[name="role"]');
     this.saveChangesButton = page.getByRole('button', { name: 'บันทึกการแก้ไขข้อมูล' });
   }
 
   async fillForm(data: UserData) {
     const fillIfAble = async (locator: Locator, value?: string) => {
       if (value !== undefined) {
         await locator.waitFor({ state: 'visible' });
         if (await locator.isEnabled()) {
           await locator.fill(value);
         }
       }
     };
 
     await fillIfAble(this.usernameInput, data.username);
     await fillIfAble(this.emailInput, data.email);
     await fillIfAble(this.displayNameInput, data.displayName);
     await fillIfAble(this.firstNameInput, data.firstName);
     await fillIfAble(this.lastNameInput, data.lastName);
     await fillIfAble(this.nicknameInput, data.nickname);
     await fillIfAble(this.phoneInput, data.phone);
 
     if (data.role) {
       await this.roleSelect.selectOption(data.role);
     }
   }
 
   async saveChanges() {
     await this.saveChangesButton.click();
     await this.saveChangesButton.waitFor({ state: 'hidden' }).catch(() => { });
   }
 }
