import { BasePage } from '../base/BasePage';
import { Locator, Page, expect } from '@playwright/test';
import { EmployeeData } from './EmployeeTypes';
import { MainPage } from '../base/MainPage';

export class EditEmployeePage extends BasePage {
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly nicknameInput: Locator;
  readonly positionInput: Locator;
  readonly phoneInput: Locator;
  readonly nationalIdInput: Locator;
  readonly skillsInput: Locator;
  readonly dailyWageInput: Locator;
  readonly hireDateInput: Locator;
  readonly statusInput: Locator;
  
  // Extra technical fields found only in Edit mode
  readonly workerIdDisplay: Locator;
  readonly employeeCodeDisplay: Locator;
  readonly addressInput: Locator;
  readonly emergencyContactInput: Locator;
  readonly notesInput: Locator;
  
  readonly saveButton: Locator;

  constructor(page: Page) {
    super(page);

    // Edit form uses technical snake_case labels and has NO placeholders
    this.firstNameInput = page.getByLabel('ชื่อจริง').or(page.locator('input[name="first_name"]'));
    this.lastNameInput = page.getByLabel('นามสกุล').or(page.locator('input[name="last_name"]'));
    this.nicknameInput = page.getByLabel('ชื่อเล่น').or(page.locator('input[name="nickname"]'));
    this.positionInput = page.getByLabel('ตำแหน่ง').or(page.locator('input[name="position"]'));
    
    // Edit form uses 'เบอร์โทร' instead of 'โทรศัพท์'
    this.phoneInput = page.getByLabel('เบอร์โทร').or(page.locator('input[name="phone"]'));
    
    // Edit form uses exact database field names as labels
    this.nationalIdInput = page.getByLabel('national_id').or(page.locator('input[name="national_id"]'));
    this.skillsInput = page.getByLabel('skill_level').or(page.locator('input[name="skill_level"]'));
    this.dailyWageInput = page.getByLabel('ค่าแรงต่อวัน (บาท)').or(page.locator('input[name="daily_wage"]'));
    this.hireDateInput = page.getByLabel('hire_date').or(page.locator('input[name="hire_date"]'));
    this.statusInput = page.getByLabel('status').or(page.locator('input[name="status"]'));

    // Specialized Edit-only fields
    this.workerIdDisplay = page.getByLabel('worker_id');
    this.employeeCodeDisplay = page.getByLabel('employee_code');
    this.addressInput = page.getByLabel('address').or(page.locator('textarea[name="address"]'));
    this.emergencyContactInput = page.getByLabel('emergency_contact');
    this.notesInput = page.getByLabel('notes');

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
    await fill(this.nicknameInput, data.nickname);
    await fill(this.positionInput, data.position);
    await fill(this.phoneInput, data.phone);
    await fill(this.nationalIdInput, data.nationalId);
    await fill(this.skillsInput, data.skills);
    await fill(this.dailyWageInput, data.dailyWage);
    await fill(this.hireDateInput, data.hireDate);
    await fill(this.addressInput, data.address);
    await fill(this.emergencyContactInput, data.emergencyContact);
    await fill(this.notesInput, data.notes);
    await fill(this.statusInput, data.status);
  }

  async saveChanges() {
    await this.waitForLoading();
    
    // Explicitly target the Save button and wait for navigation
    const saveBtn = this.page.getByRole('button', { name: 'บันทึกการเปลี่ยนแปลง', exact: true });
    await saveBtn.click();
    
    // Saving redirects to the Employee Detail page (e.g. /workers/317)
    // We wait for this redirect first
    await this.page.waitForURL(/\/workers\/\d+/);
    await this.waitForLoading();

    // Instead of the history-dependent "Back" button which can hang or loop,
    // we use the main navigation menu to return to the employee list.
    const mainPage = new MainPage(this.page);
    await mainPage.goToEmployees();

    // Wait for the URL to return to the list page
    await this.page.waitForURL(/\/workers\/?$/);
    await this.waitForLoading();
  }
}
