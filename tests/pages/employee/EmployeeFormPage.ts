import { Locator, Page, expect } from '@playwright/test';
 
 export interface EmployeeData {
   firstName: string;
   lastName?: string;
   nickname?: string;
   position?: string;
   phone?: string;
   nationalId?: string;
   skills?: string;
   dailyWage?: string;
   hireDate?: string;
   status?: string;
   assignedSite?: string;
 }
 
 /**
  * EmployeeFormPage Object Model.
  * Handles interactions with the employee creation and editing forms.
  */
 export class EmployeeFormPage {
   private readonly page: Page;
   readonly firstNameInput: Locator;
   readonly lastNameInput: Locator;
   readonly nicknameInput: Locator;
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
     this.page = page;
 
     // Priority 1: getByRole/Label
     this.firstNameInput = page.getByLabel('ชื่อ', { exact: true }).or(page.locator('input[name="first_name"]'));
     this.lastNameInput = page.getByLabel('นามสกุล', { exact: true }).or(page.locator('input[name="last_name"]'));
     this.nicknameInput = page.getByLabel('ชื่อเล่น', { exact: true }).or(page.locator('input[name="nickname"]'));
     this.positionInput = page.getByPlaceholder('เช่น IT Support');
     this.phoneInput = page.getByPlaceholder('098xxxxxxx');
     this.nationalIdInput = page.locator('input[name="national_id"]');
     this.skillsInput = page.getByPlaceholder('เช่น 1');
     this.dailyWageInput = page.getByRole('spinbutton');
     this.hireDateInput = page.locator('input[name="hire_date"]');
     this.statusSelect = page.getByLabel('สถานะ').or(page.locator('select[name="status"]'));
     this.assignedSiteSelect = page.locator('select[name="assigned_site"]');
     this.saveButton = page.getByRole('button', { name: /บันทึก/ });
   }
 
   /**
    * Fills the employee form with provided data.
    * Based on latest user requirements: Name and Nickname are primary.
    */
   async fillForm(data: Partial<EmployeeData>) {
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
 
     if (data.status) {
       await this.statusSelect.selectOption({ label: data.status });
     }
     if (data.assignedSite) {
       await this.assignedSiteSelect.selectOption({ label: data.assignedSite });
     }
   }
 
   /**
    * Submits the form and waits for the success state.
    */
   async submit() {
     await this.saveButton.click();
   }
 
   /**
    * Triggers a submit and expects a validation error on a specific field.
    */
   async expectRequiredError(field: Locator) {
     await this.saveButton.click();
     await this.expectRequiredFieldErrorMessage(field);
   }
 
   /**
    * Verifies that a field has a browser-native validation error (HTML5 validation).
    */
   async expectRequiredFieldErrorMessage(locator: Locator) {
     const validationMessage = await locator.evaluate((el: HTMLInputElement) => el.validationMessage);
     expect(validationMessage).toBeTruthy();
   }
 }
