import { BasePage } from '../base/BasePage';
import { Locator, Page, expect } from '@playwright/test';
import { EmployeeData } from './EmployeeTypes';

export class CreateEmployeePage extends BasePage {
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly positionInput: Locator;
  readonly phoneInput: Locator;
  readonly nationalIdInput: Locator;
  readonly skillsInput: Locator;
  readonly dailyWageInput: Locator;
  readonly hireDateInput: Locator;
  readonly statusSelect: Locator;
  readonly assignedSiteSelect: Locator;
  readonly saveButton: Locator;

  constructor(page: Page) {
    super(page);

    // Create form uses natural Thai labels and helpful placeholders
    this.firstNameInput = page.getByLabel('ชื่อ', { exact: true }).or(page.locator('input[name="first_name"]'));
    this.lastNameInput = page.getByLabel('นามสกุล', { exact: true }).or(page.locator('input[name="last_name"]'));
    this.positionInput = page.getByPlaceholder('เช่น IT Support');
    
    // Create form uses 'โทรศัพท์' label
    this.phoneInput = page.getByLabel('โทรศัพท์').or(page.getByPlaceholder('098xxxxxxx'));
    
    // Create form uses 'บัตรประชาชน' label
    this.nationalIdInput = page.getByLabel('บัตรประชาชน').or(page.locator('input[name="national_id"]'));
    
    this.skillsInput = page.getByPlaceholder('เช่น 1');
    this.dailyWageInput = page.getByLabel('ค่าจ้างรายวัน (บาท)').or(page.getByRole('spinbutton'));
    this.hireDateInput = page.getByLabel('วันที่เริ่มงาน').or(page.locator('input[name="hire_date"]'));
    this.statusSelect = page.getByLabel('สถานะ').or(page.locator('select[name="status"]'));
    this.assignedSiteSelect = page.getByLabel('ไซต์งาน').or(page.locator('select[name="assigned_site"]'));
    this.saveButton = page.getByRole('button', { name: /บันทึก/ });
  }

  async fillForm(data: Partial<EmployeeData>) {
    await this.waitForLoading();

    const fill = async (locator: Locator, value?: string) => {
      if (value !== undefined) {
        await locator.waitFor({ state: 'visible' });
        await locator.fill(value);
      }
    };

    await fill(this.firstNameInput, data.firstName);
    await fill(this.lastNameInput, data.lastName);
    await fill(this.positionInput, data.position);
    await fill(this.phoneInput, data.phone);
    await fill(this.nationalIdInput, data.nationalId);
    await fill(this.skillsInput, data.skills);
    await fill(this.dailyWageInput, data.dailyWage);
    await fill(this.hireDateInput, data.hireDate);

    if (data.status) {
      // Use generic selectOption to match either label or value for greater resilience
      await this.statusSelect.selectOption(data.status);
    }
    if (data.assignedSite) {
      await this.assignedSiteSelect.selectOption(data.assignedSite);
    }
  }

  async submit() {
    await this.waitForLoading();
    // Use a more specific locator for the Save button to avoid ambiguity
    const saveBtn = this.page.getByRole('button', { name: 'บันทึก', exact: true });
    await saveBtn.click();
    
    // Wait for the URL to change back to the list page
    await this.page.waitForURL(/\/(workers|employees)/);
    await this.waitForLoading();
  }

  async expectRequiredFieldErrorMessage(locator: Locator) {
    await this.waitForLoading();
    const validationMessage = await locator.evaluate((el: HTMLInputElement) => el.validationMessage);
    expect(validationMessage).toBeTruthy();
  }
}
