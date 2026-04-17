import { Locator, Page } from '@playwright/test';
 
 /**
  * Global MainPage Page Object.
  * Serves as the central hub for global navigation (Sidebar, Header) and shared dashboard elements.
  * Every test suite typically starts by interacting with this page to reach its target module.
  */
 export class MainPage {
   public readonly page: Page;
   // Navigation Locators (Sidebar / Header)
   readonly navManageUsers: Locator;
   readonly navEmployees: Locator;
   readonly navIncome: Locator;
   readonly navExpenses: Locator;
   readonly navProfile: Locator;
   readonly logoutButton: Locator;
 
   constructor(page: Page) {
     this.page = page;
 
     // Sidebar/Header menus - Narrowed down to avoid strict mode violations (buttons vs internal spans)
     this.navManageUsers = page.getByRole('button', { name: 'จัดการผู้ใช้', exact: true });
     this.navEmployees = page.getByRole('button', { name: 'พนักงาน', exact: true });
     this.navIncome = page.getByRole('button', { name: 'รายรับ', exact: true });
     this.navExpenses = page.getByRole('button', { name: 'รวมจ่าย', exact: true });
     this.navProfile = page.getByRole('button', { name: 'โปรไฟล์', exact: true });
     // The logout button is an icon button found by its title attribute
     this.logoutButton = page.getByTitle('ออกจากระบบ').first();
   }
 
   /**
   * Navigates to a specific path with automatic authentication recovery.
   * If a session redirect to /login is detected, it performs a fallback login.
   */
  async navigate(path: string = '/') {
    await this.page.goto(path);
    await this.page.waitForLoadState('load');

    // Detect if we were redirected to Login due to missing/expired session
    if (this.page.url().includes('/login')) {
      console.log(`[Smart Auth] Session missing or expired. Redirecting to login for automatic recovery...`);
      // We perform a low-level login here to avoid circular dependencies with LoginPage object
      await this.page.getByPlaceholder('กรอกไอดีของคุณ').fill('admin_test');
      await this.page.getByPlaceholder('••••••••').fill('admin');
      await this.page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click();
      
      // Wait for success and re-navigate to the original intended path
      await this.page.waitForURL(u => !u.toString().includes('/login'), { timeout: 15000 });
      await this.page.goto(path);
      await this.page.waitForLoadState('load');
    }
  }

  /**
   * Guarantees that the session is authenticated.
   * Useful in hooks or during complex transitions.
   */
  async ensureAuthenticated() {
    if (this.page.url().includes('/login')) {
        await this.navigate('/');
    }
  }
 
   /**
    * Navigates to the User Management module.
    */
   async goToManageUsers() {
     await this.navManageUsers.click();
   }
 
   /**
    * Navigates to the Employee Management module.
    */
   async goToEmployees() {
     await this.navEmployees.click();
   }
 
   /**
    * Navigates to the Income module.
    */
   async goToIncome() {
     await this.navIncome.click();
   }
 
   /**
    * Navigates to the Expenses module.
    */
   async goToExpenses() {
     await this.navExpenses.click();
   }
 
   /**
    * Navigates to the Profile settings page.
    */
   async goToProfile() {
     await this.navProfile.click();
   }
 
   /**
    * Logs out of the application and waits for the login redirection.
    */
   async logout() {
     await this.logoutButton.click();
     await this.page.waitForURL('**/login**');
   }
 }
