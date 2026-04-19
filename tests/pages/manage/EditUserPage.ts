import { BasePage } from '../base/BasePage';
import { Locator, Page, expect } from '@playwright/test';
import { UserData } from './CreateUserPage';

export class EditUserPage extends BasePage {

  readonly usernameInput: Locator;
  readonly emailInput: Locator;
  readonly displayNameInput: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly nicknameInput: Locator;
  readonly phoneInput: Locator;
  readonly roleSelect: Locator;
  readonly statusToggle: Locator;
  readonly statusText: Locator;

  readonly saveChangesButton: Locator;

  constructor(page: Page) {
    super(page);

    // Hybrid locators for Edit Mode (Labels OR Name attributes)
    this.usernameInput = page.getByLabel('Username').or(page.locator('input[name="username"]'));
    this.emailInput = page.getByLabel('Email').or(page.locator('input[name="email"]'));
    this.displayNameInput = page.getByLabel(/ชื่อที่แสดง/).or(page.locator('input[name="display_name"]'));
    this.firstNameInput = page.getByLabel('ชื่อจริง').or(page.locator('input[name="first_name"]'));
    this.lastNameInput = page.getByLabel('นามสกุล').or(page.locator('input[name="last_name"]'));
    this.nicknameInput = page.getByLabel('ชื่อเล่น', { exact: true }).or(page.locator('input[name="nickname"]'));
    this.phoneInput = page.getByLabel('เบอร์โทรศัพท์').or(page.locator('input[name="phone"]'));

    this.roleSelect = page.getByLabel('บทบาทผู้ใช้งาน').or(page.locator('select[name="role"]'));

    // Status in Edit mode is a toggle witch with label 'สถานะบัญชี'
    // The label wrapper is the click target, and the span inside contains the status text
    this.statusToggle = page.locator('label:has-text("สถานะบัญชี")').locator('.relative.inline-flex');
    this.statusText = page.locator('label:has-text("สถานะบัญชี") span');

    this.saveChangesButton = page.getByRole('button', { name: 'บันทึกการแก้ไขข้อมูล' });
  }

  async fillForm(data: UserData) {
    await this.waitForLoading();

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

    if (data.statusLabel) {
      await this.setStatus(data.statusLabel as 'ปกติ' | 'ไม่ใช้งาน');
    }

    if (data.role) {
      await this.roleSelect.selectOption(data.role);
    }
  }

  /**
   * Toggles the user status if the current state doesn't match the desired state.
   * @param targetStatus 'ปกติ' (Enabled) or 'ไม่ใช้งาน' (Disabled)
   */
  async setStatus(targetStatus: 'ปกติ' | 'ไม่ใช้งาน') {
    await this.waitForLoading();
    await this.statusText.waitFor({ state: 'visible' });

    const currentStatus = (await this.statusText.innerText()).trim();
    if (currentStatus !== targetStatus) {
      await this.statusToggle.click();
      // Verify the change
      await expect(this.statusText).toHaveText(targetStatus);
    }
  }

  async saveChanges() {
    await this.waitForLoading();
    await this.saveChangesButton.click();
    await this.waitForLoading();
  }
}
