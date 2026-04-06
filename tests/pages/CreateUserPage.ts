import { Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class CreateUserPage extends BasePage {
  readonly usernameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly displayNameInput: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly nicknameInput: Locator;
  readonly phoneInput: Locator;
  readonly roleSelect: Locator;
  readonly createButton: Locator;

  constructor(page: any) {
    super(page);

    this.usernameInput = page.getByPlaceholder('ชื่อผู้ใช้งาน');
    this.emailInput = page.getByPlaceholder('example@email.com');
    this.passwordInput = page.getByPlaceholder('••••••••');
    this.displayNameInput = page.getByPlaceholder('ชื่อเล่นหรือชื่อเรียก');
    this.firstNameInput = page.getByPlaceholder('First Name');
    this.lastNameInput = page.getByPlaceholder('Last Name');
    this.nicknameInput = page.getByPlaceholder('Nickname');
    this.phoneInput = page.getByPlaceholder('08x-xxx-xxxx');

    this.roleSelect = page.locator('select[name="role"]');
    this.createButton = page.getByRole('button', { name: 'สร้างบัญชีผู้ใช้งานใหม่' });
  }

  async fillForm(data: any) {
    const fill = async (locator: Locator, value?: string) => {
      if (value) {
        await expect(locator).toBeVisible();
        await locator.fill(value);
      }
    };

    await fill(this.usernameInput, data.username);
    await fill(this.emailInput, data.email);
    await fill(this.passwordInput, data.password);
    await fill(this.displayNameInput, data.displayName);
    await fill(this.firstNameInput, data.firstName);
    await fill(this.lastNameInput, data.lastName);
    await fill(this.nicknameInput, data.nickname);
    await fill(this.phoneInput, data.phone);
    
    if (data.role) {
      await this.roleSelect.selectOption(data.role);
    }
  }

  async submit() {
    // Listen for the success dialog before clicking
    this.page.once('dialog', async dialog => {
      await dialog.accept();
    });

    await this.createButton.click();

    // Wait for redirect back to management page
    await this.page.waitForURL('**/users/manage**', { timeout: 10000 }).catch(() => {});
    await this.page.getByText('จัดการบัญชีผู้ใช้').waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
  }
}
