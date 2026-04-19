import { BasePage } from './BasePage';
import { Page, Locator, expect } from '@playwright/test';

export class LoginPage extends BasePage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = page.getByPlaceholder('กรอกไอดีของคุณ');
    this.passwordInput = page.getByPlaceholder('••••••••');
    this.loginButton = page.getByRole('button', { name: 'เข้าสู่ระบบ' });
  }

  async navigate() {
    await this.page.goto('/login');
    await this.page.waitForLoadState('load');
  }

  async login(username: string = 'admin_test', password: string = 'admin') {
    await this.waitForLoading();
    
    // Fill credentials
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    
    // Click login and wait for the transition
    await this.loginButton.click();

    // Check for error messages specifically if login fails to proceed
    
    // Race between successful login indicator and error message
    const logoutBtn = this.page.getByTitle('ออกจากระบบ').first();
    
    await Promise.race([
      logoutBtn.waitFor({ state: 'visible', timeout: 30000 }),
      
    ]).catch(async (e) => {
      // If it timed out without an error message, it might be the "stuck" state
      if (await this.page.getByRole('button', { name: 'กำลังเข้าสู่ระบบ...' }).isVisible()) {
        console.log('Login stuck in "Logging in..." state, retrying...');
        await this.page.reload();
        await this.login(username, password);
      } else {
        throw e;
      }
    });

    // Final synchronization once logged in
    await this.waitForLoading();
  }
}
