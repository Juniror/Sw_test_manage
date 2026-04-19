import { BasePage } from '../base/BasePage';
import { Locator, expect, Page } from '@playwright/test';

export interface UserData {
  username?: string;
  email?: string;
  password?: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  nickname?: string;
  phone?: string;
  role?: string;
  statusLabel?: string; // e.g. 'ใช้งาน', 'ระงับการใช้งาน'
}

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

  constructor(page: Page) {
    super(page);

    // Hybrid locators for robust selection in Create Mode
    this.usernameInput = page.getByLabel(/Username/).or(page.getByPlaceholder('ชื่อผู้ใช้งาน'));
    this.emailInput = page.getByLabel(/Email/).or(page.getByPlaceholder('example@email.com'));
    this.passwordInput = page.getByLabel(/Password/).or(page.getByPlaceholder('••••••••'));
    
    this.displayNameInput = page.getByLabel(/ชื่อที่แสดง/).or(page.getByPlaceholder('ชื่อเล่นหรือชื่อเรียก'));
    this.firstNameInput = page.getByLabel('ชื่อจริง').or(page.getByPlaceholder('ชื่อจริง'));
    this.lastNameInput = page.getByLabel('นามสกุล').or(page.getByPlaceholder('นามสกุล'));
    this.nicknameInput = page.getByLabel('ชื่อเล่น', { exact: true }).or(page.getByPlaceholder('ชื่อเล่น', { exact: true }));
    
    this.phoneInput = page.getByLabel('เบอร์โทรศัพท์').or(page.getByPlaceholder('08x-xxx-xxxx'));

    this.roleSelect = page.getByLabel('บทบาทผู้ใช้งาน').or(page.locator('select[name="role"]'));
    this.createButton = page.getByRole('button', { name: 'สร้างบัญชีผู้ใช้งานใหม่' });
  }

  async fillForm(data: UserData) {
    await this.waitForLoading();

    const fill = async (locator: Locator, value?: string) => {
      if (value !== undefined) {
        await locator.waitFor({ state: 'visible' });
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
    await this.waitForLoading();
    // Handle the platform's confirmation dialog
    this.page.once('dialog', async dialog => {
      await dialog.accept();
    });

    await this.createButton.click();
    await this.waitForLoading();
  }
}
