import { Page, Locator, expect } from '@playwright/test';
 
 /**
  * LoginPage Object Model.
  * Handles user authentication interactions.
  */
 export class LoginPage {
   private readonly page: Page;
   readonly usernameInput: Locator;
   readonly passwordInput: Locator;
   readonly loginButton: Locator;
 
   constructor(page: Page) {
     this.page = page;
     this.usernameInput = page.getByPlaceholder('กรอกไอดีของคุณ');
     this.passwordInput = page.getByPlaceholder('••••••••');
     this.loginButton = page.getByRole('button', { name: 'เข้าสู่ระบบ' });
   }
 
   /**
    * Navigates directly to the login page.
    */
   async navigate() {
     await this.page.goto('/login');
     await this.page.waitForLoadState('load');
   }
 
   /**
    * Performs a login operation.
    * @param username The identifier for the account.
    * @param password The secret credential for the account.
    */
   async login(username: string, password: string) {
     await this.usernameInput.fill(username);
     await this.passwordInput.fill(password);
     await this.loginButton.click();
   }
 }
