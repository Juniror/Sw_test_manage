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
}

export class CreateUserPage {
  private readonly page: Page;
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
    this.page = page;

    this.usernameInput = page.getByPlaceholder('ชื่อผู้ใช้งาน');
    this.emailInput = page.getByPlaceholder('example@email.com');
    this.passwordInput = page.getByPlaceholder('••••••••');
    this.displayNameInput = page.getByPlaceholder('ชื่อเล่นหรือชื่อเรียก');
    this.firstNameInput = page.getByPlaceholder('ชื่อจริง');
    this.lastNameInput = page.getByPlaceholder('นามสกุล');
    this.nicknameInput = page.getByPlaceholder('ชื่อเล่น' ,{exact : true});
    this.phoneInput = page.getByPlaceholder('08x-xxx-xxxx');

    this.roleSelect = page.locator('select[name="role"]');
    this.createButton = page.getByRole('button', { name: 'สร้างบัญชีผู้ใช้งานใหม่' });
  }

  async fillForm(data: UserData) {
    const fill = async (locator: Locator, value?: string) => {
      if (value) {
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
    // Listen for the success dialog before clicking
    this.page.once('dialog', async dialog => {
      await dialog.accept();
    });

    await this.createButton.click();
    await this.createButton.waitFor({ state: 'hidden' }).catch(() => { });
  }
}
